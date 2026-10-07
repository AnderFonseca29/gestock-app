# ============================================
# GESTOCK - INSTALAR.ps1
# Instala dependencias, crea/actualiza la base
# de datos Gestock_db y compila el frontend.
# Ejecutar desde la raíz del proyecto.
# ============================================

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  GESTOCK - Instalacion" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# --- Verificar Node.js y npm -------------------------------------------
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "[ERROR] Node.js no esta instalado o no esta en el PATH." -ForegroundColor Red
    exit 1
}
$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) {
    Write-Host "[ERROR] npm no esta instalado." -ForegroundColor Red
    exit 1
}
$nodeVersion = & node --version
Write-Host "Node.js detectado: $nodeVersion" -ForegroundColor Green

# --- Verificar PostgreSQL ----------------------------------------------
$pg = Get-Command psql -ErrorAction SilentlyContinue
if (-not $pg) {
    Write-Host "[AVISO] No se encontro 'psql' en el PATH. La migracion se hara via Node.js (pg)." -ForegroundColor Yellow
    Write-Host "        Asegurate de que el servicio PostgreSQL este corriendo en localhost:5432." -ForegroundColor Yellow
}

# --- Backend -------------------------------------------------------------
Write-Host "`n[1/3] Instalando dependencias del BACKEND ..." -ForegroundColor Cyan
Push-Location (Join-Path $raiz 'backend')
try {
    npm install
    if (-not (Test-Path '.env')) {
        Copy-Item '.env.example' '.env'
        Write-Host "Se creo backend\.env a partir de .env.example" -ForegroundColor Yellow
        Write-Host "  -> Revisa la variable DATABASE_URL con tu usuario/clave de PostgreSQL." -ForegroundColor Yellow
        Write-Host "  -> Revisa JWT_SECRET (cambia la clave por defecto en produccion)." -ForegroundColor Yellow
    }

    Write-Host "`n[2/3] Creando/actualizando la base de datos Gestock_db ..." -ForegroundColor Cyan
    npm run db:setup
}
finally {
    Pop-Location
}

# --- Frontend ------------------------------------------------------------
Write-Host "`n[3/3] Instalando dependencias y compilando el FRONTEND ..." -ForegroundColor Cyan
Push-Location (Join-Path $raiz 'frontend_gestock')
try {
    npm install
    npx ng build
}
finally {
    Pop-Location
}

Write-Host "`n======================================" -ForegroundColor Green
Write-Host "  Instalacion completada." -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Credenciales de prueba:"
Write-Host "  admin@gestock.com      / Admin2026!"
Write-Host "  supervisor@gestock.com / Supervisor2026!"
Write-Host "  operario@gestock.com   / Operario2026!"
Write-Host "  tecnico@gestock.com    / Tecnico2026!"
Write-Host "  auditor@gestock.com    / Auditor2026!"
Write-Host ""
Write-Host "Para arrancar: .\scripts\INICIAR.ps1" -ForegroundColor Cyan