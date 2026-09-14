@echo off
title Incubadora de Huevos - Iniciando Sistema
echo ========================================================
echo   INICIANDO SISTEMA DE INCUBADORA DE HUEVOS (ARDUINO)
echo ========================================================
echo.

:: Agregar node al PATH si está instalado localmente
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"

echo 1. Comprobando Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] No se encontro Node.js en el sistema.
    pause
    exit /b 1
)
echo [OK] Node.js detectado correctamente.
echo.

echo 2. Iniciando Backend (Puerto 3001)...
start "Incubadora - Backend API (Puerto 3001)" cmd /k "cd /d "%~dp0backend" && set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%" && node index.js"

echo 3. Iniciando Frontend (Puerto 8080)...
start "Incubadora - Frontend Web (Puerto 8080)" cmd /k "cd /d "%~dp0" && set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%" && npm run dev"

echo.
ping 127.0.0.1 -n 4 >nul

echo Abriendo navegador en http://localhost:8080/ ...
start http://localhost:8080/

echo.
echo ========================================================
echo   SISTEMA LEVANTADO CON EXITO
echo   - Frontend: http://localhost:8080
echo   - Backend:  http://localhost:3001
echo   - Admin:    admin@admin.com / admin123
echo ========================================================
exit /b 0
