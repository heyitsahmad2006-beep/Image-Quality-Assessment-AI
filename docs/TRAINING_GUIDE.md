# Training Guide

## Commands
To generate synthetic training data:
```bash
python -m ml.scripts.generate_synthetic_data
```

To run PyTorch model training:
```bash
python -m ml.training.train
```

Checkpoints will be saved under:
- `artifacts/checkpoints/`
- `ml/weights/best_model.pt`
