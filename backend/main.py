from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api.v1.api_note import router as api_router

# Creamos las tablas físicas en el archivo SQLite automáticamente al arrancar
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Ensolvers Notes API",
    description="Backend estructurado en capas para el reto de gestión de notas",
    version="1.0.0"
)

# Configuración de CORS obligatoria para conectar con React/Vue/Angular sin bloqueos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite peticiones desde cualquier origen (ideal para desarrollo)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluimos los endpoints de notas bajo el prefijo global /api/v1
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"status": "Backend corriendo exitosamente", "docs": "/docs"}