from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan, title="AI Doc Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .routers import auth, projects, generation, export
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(generation.router)
app.include_router(export.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Doc Platform API"}
