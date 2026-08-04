# Script to launch FastAPI Backend Server
Write-Host "Starting Image Quality Assessment AI Backend..." -ForegroundColor Purple

if (Test-Path ".venv\Scripts\Activate.ps1") {
    & ".\.venv\Scripts\Activate.ps1"
}

Set-Location backend
python run_backend.py
