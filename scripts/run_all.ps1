# Image Quality Assessment AI â€” Master Startup Script
# Automatically launches Backend (FastAPI) and Frontend (Vite) on 0.0.0.0

$ErrorActionPreference = "Continue"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

# Detect Active LAN IPv4 Address
$lanIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress
if (-not $lanIp) { $lanIp = "192.168.0.200" }

Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "  Starting Image Quality Assessment AI Project Services..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Magenta

# 1. Check & Start Backend (Port 8000)
$backendConn = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($backendConn) {
    Write-Host "[OK] Backend is already running on port 8000." -ForegroundColor Green
} else {
    Write-Host "[LAUNCH] Launching Backend Server on port 8000 (0.0.0.0)..." -ForegroundColor Yellow
    $backendCmd = "Set-Location '$ProjectRoot\backend'; python run_backend.py"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
}

# 2. Check & Start Frontend (Port 5173)
$frontendConn = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontendConn) {
    Write-Host "[OK] Frontend is already running on port 5173." -ForegroundColor Green
} else {
    Write-Host "[LAUNCH] Launching Frontend Server on port 5173 (0.0.0.0)..." -ForegroundColor Yellow
    $frontendCmd = "Set-Location '$ProjectRoot\frontend'; npm run dev -- --host 0.0.0.0"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
}

Start-Sleep -Seconds 2

Write-Host "`n============================================================" -ForegroundColor Magenta
Write-Host "  All Services Active & Ready!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "  Frontend LAN:   http://${lanIp}:5173" -ForegroundColor White
Write-Host "  Frontend Local: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend LAN:    http://${lanIp}:8000" -ForegroundColor White
Write-Host "  Swagger Docs:   http://${lanIp}:8000/docs" -ForegroundColor White
Write-Host "  Health Endpoint:http://${lanIp}:8000/api/v1/health" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Magenta


