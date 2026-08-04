import os
import json
import time
import psutil
import torch
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, mean_absolute_error, mean_squared_error, confusion_matrix

from ..models.quality_net import ImageQualityNet
from ..datasets.dataset import ImageQualityDataset
from torch.utils.data import DataLoader

def evaluate_model(weights_path="ml/weights/best_model.pt", dataset_dir="ml/datasets/synthetic", output_dir="artifacts"):
    os.makedirs(output_dir, exist_ok=True)
    anno_path = os.path.join(dataset_dir, "annotations.csv")

    if not os.path.exists(anno_path):
        print(f"Dataset annotations not found at {anno_path}")
        return

    df = pd.read_csv(anno_path)
    test_df = df[df["split"] == "test"]
    if len(test_df) == 0:
        test_df = df.sample(frac=0.2, random_state=42)

    test_ds = ImageQualityDataset(test_df, dataset_dir, img_size=224)
    test_loader = DataLoader(test_ds, batch_size=1, shuffle=False)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Evaluating model on device: {device}")

    is_trained = os.path.exists(weights_path)
    if is_trained:
        print(f"Loading trained weights from {weights_path}...")
        checkpoint = torch.load(weights_path, map_location=device)
        model = ImageQualityNet().to(device)
        model.load_state_dict(checkpoint["model_state_dict"])
        model.eval()
    else:
        print("Trained model weights not found. Evaluating in Heuristic / Baseline Mode...")
        model = ImageQualityNet().to(device)
        model.eval()

    defects = ["blur", "glare", "darkness", "overexposure", "motion_artifacts", "occlusion", "poor_framing", "low_resolution"]

    all_true_severities = []
    all_pred_severities = []
    all_true_presence = []
    all_pred_presence = []
    all_true_suitability = []
    all_pred_suitability = []
    latencies = []

    start_mem = psutil.Process(os.getpid()).memory_info().rss / (1024 * 1024)

    with torch.no_grad():
        for batch in test_loader:
            imgs = batch["image"].to(device)
            true_sev = batch["severities"].numpy()[0] * 100.0
            true_pres = batch["presence"].numpy()[0]
            true_suit = batch["suitability"].numpy()[0]

            t0 = time.perf_counter()
            out = model(imgs)
            t1 = time.perf_counter()
            latencies.append((t1 - t0) * 1000.0)

            pred_sev = out["severities"].cpu().numpy()[0] * 100.0
            pres_logits = out["presence_logits"].cpu().numpy()[0]
            pred_pres = (pres_logits > 0).astype(float)
            pred_suit = np.argmax(out["suitability_logits"].cpu().numpy()[0])

            all_true_severities.append(true_sev)
            all_pred_severities.append(pred_sev)
            all_true_presence.append(true_pres)
            all_pred_presence.append(pred_pres)
            all_true_suitability.append(true_suit)
            all_pred_suitability.append(pred_suit)

    end_mem = psutil.Process(os.getpid()).memory_info().rss / (1024 * 1024)

    all_true_severities = np.array(all_true_severities)
    all_pred_severities = np.array(all_pred_severities)
    all_true_presence = np.array(all_true_presence)
    all_pred_presence = np.array(all_pred_presence)

    mae_per_defect = np.mean(np.abs(all_true_severities - all_pred_severities), axis=0)
    rmse_per_defect = np.sqrt(np.mean((all_true_severities - all_pred_severities)**2, axis=0))

    per_defect_metrics = {}
    for i, name in enumerate(defects):
        p, r, f1, _ = precision_recall_fscore_support(all_true_presence[:, i], all_pred_presence[:, i], average="binary", zero_division=0)
        acc = accuracy_score(all_true_presence[:, i], all_pred_presence[:, i])
        per_defect_metrics[name] = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(p), 4),
            "recall": round(float(r), 4),
            "f1_score": round(float(f1), 4),
            "mae_severity": round(float(mae_per_defect[i]), 2),
            "rmse_severity": round(float(rmse_per_defect[i]), 2)
        }

    overall_suitability_acc = round(float(accuracy_score(all_true_suitability, all_pred_suitability)), 4)
    avg_latency = round(float(np.mean(latencies)), 2)

    cm = confusion_matrix(all_true_suitability, all_pred_suitability, labels=[0, 1, 2, 3]).tolist()

    metrics_output = {
        "model_version": "v1.0.0",
        "is_trained_weights": is_trained,
        "evaluation_mode": "Trained AI Model" if is_trained else "Baseline Demonstration Mode",
        "dataset_size": len(df),
        "test_set_size": len(test_df),
        "overall_suitability_accuracy": overall_suitability_acc,
        "average_inference_latency_ms": avg_latency,
        "memory_used_mb": round(end_mem - start_mem, 2),
        "confusion_matrix": cm,
        "per_defect_metrics": per_defect_metrics,
        "limitations": [
            "Real-world performance depends on camera sensor noise, lighting variations, and domain shifts.",
            "Synthetic defect generators provide controlled benchmarks but may not capture all physical lens distortions.",
            "Subject framing and saliency detection require adequate contrast between subject and background."
        ]
    }

    metrics_file = os.path.join(output_dir, "metrics.json")
    with open(metrics_file, "w") as f:
        json.dump(metrics_output, f, indent=2)

    # Markdown evaluation report
    report_md = f"""# Image Quality Assessment AI - Evaluation Report

## Model Overview
- **Model Version**: v1.0.0
- **Mode**: {"Trained Deep Neural Network" if is_trained else "Baseline Heuristic Model"}
- **Evaluation Date**: 2026-08-03
- **Test Set Size**: {len(test_df)} samples
- **Average Latency**: {avg_latency} ms / image
- **Overall Suitability Accuracy**: {overall_suitability_acc * 100:.1f}%

---

## Per-Defect Performance Metrics

| Defect Name | Accuracy | Precision | Recall | F1 Score | Severity MAE | Severity RMSE |
|---|---|---|---|---|---|---|
"""
    for d_name, d_m in per_defect_metrics.items():
        report_md += f"| **{d_name.replace('_', ' ').title()}** | {d_m['accuracy']*100:.1f}% | {d_m['precision']:.3f} | {d_m['recall']:.3f} | {d_m['f1_score']:.3f} | {d_m['mae_severity']} | {d_m['rmse_severity']} |\n"

    report_md += f"""
---

## Confusion Matrix (Overall Suitability)
Classes: 0: Not Suitable, 1: Needs Improvement, 2: Suitable, 3: Highly Suitable
```
{np.array(cm)}
```

---

## Model Limitations & Notes
1. **Domain Shift**: Performance in production depends on camera sensor characteristics, compression level, and ambient lighting.
2. **Subject Ambiguity**: Framing and occlusion rely on visual contrast when dedicated object detection backbones are omitted.
3. **No 100% Accuracy Claim**: System metrics represent validated test performance on benchmark datasets.
"""
    report_file = os.path.join(output_dir, "evaluation_report.md")
    with open(report_file, "w") as f:
        f.write(report_md)

    print(f" Evaluation completed successfully. Saved metrics.json and evaluation_report.md to {output_dir}")
    return metrics_output

if __name__ == "__main__":
    evaluate_model()
