# Dataset Guide — Synthetic Defect Pipeline

## Overview
The synthetic dataset generator (`ml/data/synthetic_generator.py`) generates controlled quality defect benchmarks while preserving clean source images and recording exact metadata.

## Annotation Schema (`annotations.csv`)
- `image_path`: Relative filepath under split (`train/sample_0001.jpg`).
- `blur_score`: 0 to 100
- `glare_score`: 0 to 100
- `darkness_score`: 0 to 100
- `overexposure_score`: 0 to 100
- `motion_artifact_score`: 0 to 100
- `occlusion_score`: 0 to 100
- `poor_framing_score`: 0 to 100
- `low_resolution_score`: 0 to 100
- `overall_quality_score`: 0 to 100
- `suitable_label`: "Not Suitable", "Needs Improvement", "Suitable", "Highly Suitable"
- `source_type`: "synthetic"
- `split`: "train", "val", or "test"
