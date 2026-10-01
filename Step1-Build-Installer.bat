@echo off
setlocal
cd /d "%~dp0"
title SSS Staff Portal - Build Installer
echo ==============================================
echo   SSS Staff Portal - Installer Builder
echo ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed.
  echo Please install Node.js LTS from https://nodejs.org
  echo then double-click this file again.
  echo.
  pause
  exit /b 1
)

echo [1/2] Installing required files. Please wait, needs internet... (5-15 minutes first time)
call npm install
if errorlevel 1 goto :fail

echo.
echo [2/2] Building Windows installer...
call npm run dist:win
if errorlevel 1 goto :fail

echo.
echo ==============================================
echo   DONE! Your installer is in the "release" folder:
echo   "SSS Staff Portal Setup 1.0.0.exe"
echo   Copy this file to any other computer and double-click it.
echo ==============================================
start "" "%~dp0release"
pause
exit /b 0

:fail
echo.
echo [ERROR] Something went wrong. Check your internet connection and try again.
echo If it still fails, take a screenshot of this window and share it.
pause
exit /b 1
