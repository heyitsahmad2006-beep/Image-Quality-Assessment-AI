# Script to train multi-task vision model
if (Test-Path ".venv\Scripts\Activate.ps1") {
    & ".\.venv\Scripts\Activate.ps1"
}

Write-Host "Starting Multi-Task PyTorch Model Training..." -ForegroundColor Purple
python -m ml.training.train
