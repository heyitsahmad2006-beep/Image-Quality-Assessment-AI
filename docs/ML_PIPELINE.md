# Machine Learning Pipeline Guide

## Neural Architecture
`ImageQualityNet` uses a transfer-learning backbone (ConvNeXt-Tiny / EfficientNet-B0) paired with 5 task-specific prediction heads:
1. **Defect Presence Head**: Multi-label BCE loss predicting binary defect presence.
2. **Defect Severity Head**: Smooth L1 loss regressing severity percentage [0, 100].
3. **Overall Quality Head**: Smooth L1 loss regressing overall score [0, 100].
4. **Suitability Head**: 4-class Cross-Entropy Loss predicting downstream suitability.
5. **Confidence Head**: Estimates output uncertainty.

## Score Fusion Rules
The final overall quality score fuses AI predictions with classical OpenCV metrics:
- Blur: 20% weight
- Glare: 12% weight
- Darkness: 12% weight
- Overexposure: 12% weight
- Motion Artifacts: 15% weight
- Occlusion: 12% weight
- Poor Framing: 10% weight
- Low Resolution: 7% weight
