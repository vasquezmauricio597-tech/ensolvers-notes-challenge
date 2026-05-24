@echo off
echo Iniciando el sistema de notas...

:: Cerrar procesos previos en puertos 8000 y 5173
echo Cerrando procesos en uso...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /f /pid %%a
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a

:: Iniciar el Backend
echo [1/2] Iniciando Backend...
start "Backend" cmd /k "cd backend && call venv\Scripts\activate && uvicorn main:app --reload"

:: Iniciar el Frontend
echo [2/2] Iniciando Frontend...
cd frontend
call npm run dev