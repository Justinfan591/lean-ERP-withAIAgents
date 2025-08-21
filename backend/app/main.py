# backend/app/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.engine import create_engine

app = FastAPI(title="Lean AI-ERP")

# CORS (put AFTER app = FastAPI(...))
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

# DB ping (defaults to SQLite so you can run without Postgres)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
except Exception:
    engine = None

@app.get("/db/ping")
def db_ping():
    if engine is None:
        return {"ok": False, "error": "engine_not_initialized"}
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"ok": True, "url": DATABASE_URL}
    except Exception as e:
        return {"ok": False, "error": str(e), "url": DATABASE_URL}
