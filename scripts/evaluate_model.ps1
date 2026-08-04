# Script to evaluate model on held-out test set
if (Test-Path ".venv\Scripts\Activate.ps1") {
    & ".\.venv\Scripts\Activate.ps1"
}

Write-Host "Running Model Evaluation Suite..." -ForegroundColor Purple
python -m ml.evaluation.evaluate
