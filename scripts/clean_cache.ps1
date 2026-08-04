# Removes Python & Node caches without touching user database or weights
Write-Host "Cleaning temporary build and cache folders..." -ForegroundColor Yellow

Get-ChildItem -Path . -Recurse -Include __pycache__, .pytest_cache, .mypy_cache, .ruff_cache, .coverage, .next, .vite -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force

Write-Host "Caches cleared successfully!" -ForegroundColor Green
