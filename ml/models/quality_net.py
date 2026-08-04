import torch
import torch.nn as nn
from .backbones import FeatureExtractor

class ImageQualityNet(nn.Module):
    """
    Multi-task Deep Computer Vision Neural Network for Image Quality Assessment.
    Predicts:
    1. Defect severities (8 outputs normalized [0, 1])
    2. Defect presence (8 binary logits)
    3. Overall quality score (1 output normalized [0, 1])
    4. Suitability classification (4 logits: Not Suitable, Needs Improvement, Suitable, Highly Suitable)
    5. Uncertainty / confidence score (1 output [0, 1])
    """
    def __init__(self, backbone_name="convnext_tiny", pretrained=False, num_defects=8, num_suitability_classes=4):
        super().__init__()
        self.num_defects = num_defects
        self.num_suitability_classes = num_suitability_classes

        self.backbone = FeatureExtractor(backbone_name=backbone_name, pretrained=pretrained)
        in_dim = self.backbone.num_features

        # Shared projection trunk
        self.shared_fc = nn.Sequential(
            nn.Linear(in_dim, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2)
        )

        # 1. Defect Presence Head (logits)
        self.defect_presence_head = nn.Linear(256, num_defects)

        # 2. Defect Severity Head (0 to 1 continuous severity)
        self.defect_severity_head = nn.Sequential(
            nn.Linear(256, 128),
            nn.ReLU(inplace=True),
            nn.Linear(128, num_defects),
            nn.Sigmoid()
        )

        # 3. Overall Quality Score Head (0 to 1 continuous)
        self.overall_quality_head = nn.Sequential(
            nn.Linear(256, 64),
            nn.ReLU(inplace=True),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )

        # 4. Suitability Classification Head (4 logits)
        self.suitability_head = nn.Sequential(
            nn.Linear(256, 64),
            nn.ReLU(inplace=True),
            nn.Linear(64, num_suitability_classes)
        )

        # 5. Model Confidence Head (0 to 1 continuous)
        self.confidence_head = nn.Sequential(
            nn.Linear(256, 32),
            nn.ReLU(inplace=True),
            nn.Linear(32, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        feat = self.backbone(x)
        shared = self.shared_fc(feat)

        presence_logits = self.defect_presence_head(shared)
        severities = self.defect_severity_head(shared)
        overall_quality = self.overall_quality_head(shared)
        suitability_logits = self.suitability_head(shared)
        confidence = self.confidence_head(shared)

        return {
            "presence_logits": presence_logits,
            "severities": severities,
            "overall_quality": overall_quality,
            "suitability_logits": suitability_logits,
            "confidence": confidence
        }
