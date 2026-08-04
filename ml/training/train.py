import os
import json
import random
import yaml
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import pandas as pd

from ..models.quality_net import ImageQualityNet
from ..datasets.dataset import ImageQualityDataset
from ..data.synthetic_generator import SyntheticDefectGenerator

def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

def train_model(config_path="ml/configs/train_config.yaml", dataset_dir="ml/datasets/synthetic"):
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    set_seed(config.get("seed", 42))

    # Ensure dataset exists
    anno_path = os.path.join(dataset_dir, "annotations.csv")
    if not os.path.exists(anno_path):
        print(f"Dataset not found at {anno_path}. Generating synthetic dataset...")
        gen = SyntheticDefectGenerator(output_dir=dataset_dir)
        gen.generate_dataset(num_samples=120)

    df = pd.read_csv(anno_path)
    train_df = df[df["split"] == "train"]
    val_df = df[df["split"] == "val"]

    train_ds = ImageQualityDataset(train_df, dataset_dir, img_size=config.get("img_size", 224))
    val_ds = ImageQualityDataset(val_df, dataset_dir, img_size=config.get("img_size", 224))

    batch_size = config.get("batch_size", 16)
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)

    device = torch.device("cuda" if torch.cuda.is_available() and config.get("device") != "cpu" else "cpu")
    print(f"Training on device: {device}")

    model = ImageQualityNet(
        backbone_name=config.get("backbone", "convnext_tiny"),
        pretrained=False,
        num_defects=config.get("num_defects", 8),
        num_suitability_classes=len(config.get("suitability_classes", []))
    ).to(device)

    # Loss Functions
    criterion_presence = nn.BCEWithLogitsLoss()
    criterion_severity = nn.SmoothL1Loss()
    criterion_quality = nn.SmoothL1Loss()
    criterion_suitability = nn.CrossEntropyLoss()

    optimizer = torch.optim.AdamW(model.parameters(), lr=float(config.get("learning_rate", 0.0003)), weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=2)

    epochs = config.get("epochs", 5)
    best_val_loss = float("inf")

    weights_dir = os.path.join(os.path.dirname(config_path), "..", "weights")
    checkpoint_dir = os.path.join(os.path.dirname(config_path), "..", "..", "artifacts", "checkpoints")
    os.makedirs(weights_dir, exist_ok=True)
    os.makedirs(checkpoint_dir, exist_ok=True)

    history = []

    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0

        for batch in train_loader:
            imgs = batch["image"].to(device)
            severities = batch["severities"].to(device)
            presence = batch["presence"].to(device)
            quality = batch["overall_quality"].to(device)
            suitability = batch["suitability"].to(device)

            optimizer.zero_grad()
            out = model(imgs)

            loss_p = criterion_presence(out["presence_logits"], presence)
            loss_s = criterion_severity(out["severities"], severities)
            loss_q = criterion_quality(out["overall_quality"], quality)
            loss_suit = criterion_suitability(out["suitability_logits"], suitability)

            loss = loss_p * 1.0 + loss_s * 1.0 + loss_q * 1.5 + loss_suit * 1.0
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()

            train_loss += loss.item()

        train_loss /= max(1, len(train_loader))

        # Validation
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for batch in val_loader:
                imgs = batch["image"].to(device)
                severities = batch["severities"].to(device)
                presence = batch["presence"].to(device)
                quality = batch["overall_quality"].to(device)
                suitability = batch["suitability"].to(device)

                out = model(imgs)
                loss_p = criterion_presence(out["presence_logits"], presence)
                loss_s = criterion_severity(out["severities"], severities)
                loss_q = criterion_quality(out["overall_quality"], quality)
                loss_suit = criterion_suitability(out["suitability_logits"], suitability)

                val_loss += (loss_p * 1.0 + loss_s * 1.0 + loss_q * 1.5 + loss_suit * 1.0).item()

        val_loss /= max(1, len(val_loader))
        scheduler.step(val_loss)

        print(f"Epoch {epoch:02d}/{epochs:02d} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}")

        history.append({"epoch": epoch, "train_loss": round(train_loss, 4), "val_loss": round(val_loss, 4)})

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_weight_path = os.path.join(weights_dir, "best_model.pt")
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_loss": val_loss,
                "config": config
            }, best_weight_path)
            print(f" Saved best model checkpoint to {best_weight_path}")

    # Write training history log
    history_path = os.path.join(os.path.dirname(config_path), "..", "..", "artifacts", "training_history.json")
    with open(history_path, "w") as f:
        json.dump(history, f, indent=2)

    return history

if __name__ == "__main__":
    train_model()
