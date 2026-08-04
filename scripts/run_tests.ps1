# Runs backend pytest suite
if (Test-Path ".venv\Scripts\Activate.ps1") {
    & ".\.venv\Scripts\Activate.ps1"
}

Write-Host "Running Backend Pytest Suite..." -ForegroundColor Purple
pytest backend/tests -v
