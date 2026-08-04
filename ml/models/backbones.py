import torch
import torch.nn as nn
import torchvision.models as models

class FeatureExtractor(nn.Module):
    def __init__(self, backbone_name="convnext_tiny", pretrained=False):
        super().__init__()
        self.backbone_name = backbone_name
        
        if backbone_name == "convnext_tiny":
            try:
                weights = models.ConvNeXt_Tiny_Weights.DEFAULT if pretrained else None
                m = models.convnext_tiny(weights=weights)
                self.features = m.features
                self.num_features = m.classifier[2].in_features
            except Exception:
                m = models.resnet18(weights=None)
                self.features = nn.Sequential(*list(m.children())[:-2])
                self.num_features = 512
                
        elif backbone_name == "efficientnet_b0":
            try:
                weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
                m = models.efficientnet_b0(weights=weights)
                self.features = m.features
                self.num_features = m.classifier[1].in_features
            except Exception:
                m = models.resnet18(weights=None)
                self.features = nn.Sequential(*list(m.children())[:-2])
                self.num_features = 512
        else:
            # ResNet18 default fallback
            try:
                weights = models.ResNet18_Weights.DEFAULT if pretrained else None
                m = models.resnet18(weights=weights)
            except Exception:
                m = models.resnet18(weights=None)
            self.features = nn.Sequential(*list(m.children())[:-2])
            self.num_features = 512

        self.pool = nn.AdaptiveAvgPool2d((1, 1))

    def forward(self, x):
        feat = self.features(x)
        feat = self.pool(feat)
        feat = torch.flatten(feat, 1)
        return feat
