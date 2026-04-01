@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
cd /d "%ROOT%"

if "%~1"=="" goto usage
if /i "%~1"=="dev" goto dev
if /i "%~1"=="prod" goto prod
goto usage

:usage
echo.
echo  MonkeyPrint — Windows (no Docker^)
echo.
echo  Prerequisites: Node.js 18+, Python 3.10+ on PATH, PostgreSQL via DATABASE_URL in .env
echo.
echo  Usage:  %~nx0 dev   ^| prod
echo    dev   Install npm deps, prisma generate, rembg venv — then npm run dev
echo    prod  Same installs — then npm run build, rembg + npm run start
echo.
exit /b 1

rem -- npm i, prisma generate, Python venv + pip (same for dev and prod)
:install_all
call :check_node
call :check_python
where npm >nul 2>&1 || (echo [error] npm not found. Install Node.js.& exit /b 1)
echo [install] npm i
call npm i
if errorlevel 1 exit /b 1
echo [install] prisma generate
call npx prisma generate
if errorlevel 1 exit /b 1
call :setup_venv
if errorlevel 1 exit /b 1
echo [install] done.
exit /b 0

:dev
call :kill_ports
call :install_all
if errorlevel 1 exit /b 1
call :start_rembg
echo [dev] npm run dev
call npm run dev
set "EXIT=%ERRORLEVEL%"
echo.
echo [dev] Stopped. Next run will free ports 8000 and 3000 before starting.
exit /b %EXIT%

:prod
call :kill_ports
call :install_all
if errorlevel 1 exit /b 1
echo [prod] npm run build
call npm run build
if errorlevel 1 exit /b 1
set NODE_ENV=production
call :start_rembg
echo [prod] npm run start
call npm run start
set "EXIT=%ERRORLEVEL%"
echo.
echo [prod] Stopped. Next run will free ports 8000 and 3000 before starting.
exit /b %EXIT%

:kill_ports
echo [cleanup] Freeing listeners on ports 8000 and 3000...
rem No pipes in -Command so cmd.exe does not split the line
powershell -NoProfile -ExecutionPolicy Bypass -Command "foreach ($port in 8000,3000) { foreach ($c in @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } }"
exit /b 0

:start_rembg
echo [rembg] Starting on port 8000 (background^) ...
start "MonkeyPrint rembg" /B "%ROOT%rembg-venv\Scripts\python.exe" "%ROOT%scripts\remove_bg.py"
exit /b 0

:check_node
where node >nul 2>&1 || (echo [error] Node.js not found.& echo         https://nodejs.org/& exit /b 1)
for /f "tokens=1 delims=." %%a in ('node -p "process.versions.node" 2^>nul') do set "NODE_MAJOR=%%a"
if not defined NODE_MAJOR set "NODE_MAJOR=0"
if %NODE_MAJOR% LSS 18 (
  echo [warn] Node 18+ recommended. Current major: %NODE_MAJOR%
)
exit /b 0

:check_python
where python >nul 2>&1 || (echo [error] Python not found.& echo         Add Python 3.10+ to PATH.& exit /b 1)
exit /b 0

:setup_venv
if exist "rembg-venv\Scripts\python.exe" (
  echo [venv] rembg-venv found — upgrading pip and ensuring packages...
  goto setup_venv_pip
)
if exist "rembg-venv\" (
  echo [venv] Incomplete rembg-venv — removing and recreating...
  rmdir /s /q "rembg-venv"
  if errorlevel 1 (
    echo [error] Could not remove rembg-venv. Close apps using it and retry.
    exit /b 1
  )
)
echo [venv] Creating rembg-venv...
python -m venv rembg-venv
if errorlevel 1 (
  echo [error] python -m venv failed.
  exit /b 1
)
if not exist "rembg-venv\Scripts\python.exe" (
  echo [error] venv created but python.exe missing under rembg-venv\Scripts\
  exit /b 1
)
:setup_venv_pip
call "%ROOT%rembg-venv\Scripts\pip.exe" install --upgrade pip
if errorlevel 1 exit /b 1
echo [venv] pip install rembg[cpu], fastapi, uvicorn, python-multipart ^(may take several minutes^) ...
call "%ROOT%rembg-venv\Scripts\pip.exe" install --no-cache-dir "rembg[cpu]" fastapi uvicorn python-multipart
if errorlevel 1 exit /b 1
echo [venv] OK.
exit /b 0
