# Deployment Guide — Docker & Local Windows Setup

## 1. Docker Compose
Run the entire production stack using Docker Compose:
```bash
docker-compose up --build
```

## 2. Local Windows PowerShell
1. Run setup:
```powershell
.\scripts\setup_windows.ps1
```
2. Start servers:
```powershell
.\scripts\run_all.ps1
```
