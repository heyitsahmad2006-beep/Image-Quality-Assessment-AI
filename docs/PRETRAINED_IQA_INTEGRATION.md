# Pretrained No-Reference IQA Model Integration

## Architecture Overview
The Image Quality Assessment AI system utilizes a hybrid computer-vision architecture:

```
                  Uploaded Image
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
   Pretrained IQA              OpenCV Deterministic
  Perceptual Model              Technical Detectors
(NIMA_MobileNet_NR)           (8 Defect Categories)
         │                             │
   Raw Score: 0.88               Weighted Defect Score:
  Calibrated: 88.4                Technical Score: 84.1
         │                             │
         └──────────────┬──────────────┘
                        ▼
             Calibrated Hybrid Fusion
    Final Score = 0.75 * IQA + 0.25 * Technical
             Final Overall Score: 87.3
```

## Model Selection Rationale
- **Selected Model**: `NIMA_MobileNet_NR` (No-Reference Aesthetic & Technical Deep Neural Network).
- **Why Selected**: 
  1. Operates on a single uploaded image without requiring a pristine reference target.
  2. Runs locally using PyTorch and OpenCV C++ neural backends on CPU/GPU without external network API calls.
  3. Pretrained weights evaluate global perceptual quality independently of edge-case heuristic thresholds.

## Input & Preprocessing
- **Original Dimensions**: Preserved for technical resolution metrics.
- **Model Tensor**: RGB conversion, normalized scale $[0, 1]$, $224 \times 224$ tensor input.

## Score Calibration
- **Raw Score**: $[0.0, 1.0]$ continuous output probability.
- **Normalized Score**: $S_{\text{norm}} = \text{Clamp}(S_{\text{raw}} \times 100.0, \, 0.0, \, 100.0)$.

## Fusion Logic
$$\text{Technical Quality Score} = \text{Clamp}(100.0 - \text{Weighted Defect Severity}, \, 0.0, \, 100.0)$$
$$\text{Final Quality Score} = 0.75 \times S_{\text{norm}} + 0.25 \times \text{Technical Quality Score}$$

## Model Mode Behavior & Fallback
- `pretrained_iqa`: Pretrained NR-IQA model active (`AI Model Mode`).
- `heuristic_fallback`: Fallback mode active when PyTorch weights are missing.
