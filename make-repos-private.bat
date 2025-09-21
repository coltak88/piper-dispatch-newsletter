@echo off
echo GitHub Repository Privacy Updater
echo ===================================
echo.
echo This script will help you make your GitHub repositories private.
echo You will need a GitHub Personal Access Token with 'repo' scope.
echo.
echo To get a token:
echo 1. Go to https://github.com/settings/tokens
echo 2. Click "Generate new token (classic)"
echo 3. Select 'repo' scope
echo 4. Copy the generated token
echo.
echo Run the PowerShell script instead:
echo powershell -ExecutionPolicy Bypass -File make-repos-private.ps1 -Token "YOUR_TOKEN_HERE"
echo.
pause