# ============================================
# GESTOCK - INICIAR.ps1
# Levanta el backend (puerto 3000) y el
# frontend Angular (puerto 4200) en ventanas
# separadas y abre el navegador.
# ============================================

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  GESTOCK - Inicio" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

$backendDir = Join-Path $raiz 'backend'
$frontendDir = Join-Path $raiz 'frontend_gestock'

if (-not (Test-Path (Join-Path $backendDir 'node_modules'))) {
    Write-Host "[ERROR] El backend no tiene dependencias instaladas. Ejecuta primero .\scripts\INSTALAR.ps1" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path (Join-Path $frontendDir 'node_modules'))) {
    Write-Host "[ERROR] El frontend no tiene dependencias instaladas. Ejecuta primero .\scripts\INSTALAR.ps1" -ForegroundColor Red
    exit 1
}

# Backend: API en http://localhost:3000
Write-Host "[1/2] Iniciando BACKEND (http://localhost:3000) ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendDir'; npm run dev"
Start-Sleep -Seconds 2

# Frontend: app en http://localhost:4200
Write-Host "[2/2] Iniciando FRONTEND (http://localhost:4200) ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; npm start"

Start-Sleep -Seconds 3
Write-Host "`nAbriendo el navegador..." -ForegroundColor Green
Start-Process "http://localhost:4200"

Write-Host ""
Write-Host "Swagger de la API: http://localhost:3000/api/docs" -ForegroundColor Green