#!/bin/bash

echo "Iniciando el sistema de notas en entorno Unix/Linux/macOS..."

# Iniciar el Backend en segundo plano
echo "[1/2] Iniciando Backend..."
cd backend
# Activar entorno virtual y correr servidor
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload &
BACKEND_PID=$!
cd ..

# Iniciar el Frontend
echo "[2/2] Iniciando Frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo "Sistemas iniciados."
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Función para cerrar todo al presionar Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Sistemas detenidos.'; exit" SIGINT

echo "Presiona Ctrl+C para detener ambos servidores."
wait