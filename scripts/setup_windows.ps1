# PowerShell Setup Script for Image Quality Assessment AI on Windows

Write-Host "============================================================" -ForegroundColor Purple
Write-Host " Setting up Image Quality Assessment AI Development Environment" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Purple

# Check Python installation
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Python 3.11+ is required but not found in PATH."
    exit 1
}
Write-Host "Detected: $pythonVersion" -ForegroundColor Green

# Create Virtual Environment if missing
if (-not (Test-Path ".venv")) {
    Write-Host "Creating Python virtual environment (.venv)..." -ForegroundColor Yellow
    python -m venv .venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\.venv\Scripts\Activate.ps1"

# Install backend Python requirements
Write-Host "Installing Python dependencies from backend/requirements.txt..." -ForegroundColor Yellow
pip install --upgrade pip
pip install -r backend/requirements.txt

# Setup Backend .env if missing
if (-not (Test-Path "backend/.env")) {
    Write-Host "Creating backend/.env from backend/.env.example..." -ForegroundColor Yellow
    Copy-Item "backend/.env.example" "backend/.env"
}

# Check Node.js & npm for Frontend
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Detected Node.js: $nodeVersion" -ForegroundColor Green
    Set-Location frontend
    if (-not (Test-Path ".env")) {
        Copy-Item ".env.example" ".env"
    }
    Write-Host "Installing Node dependencies..." -ForegroundColor Yellow
    npm install
    Set-Location ..
} else {
    Write-Warning "Node.js not detected. Frontend setup skipped."
}

Write-Host "============================================================" -ForegroundColor Purple
Write-Host " Setup Completed Successfully!" -ForegroundColor Green
Write-Host " To start backend:  .\scripts\run_backend.ps1" -ForegroundColor Cyan
Write-Host " To start frontend: .\scripts\run_frontend.ps1" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Purple
