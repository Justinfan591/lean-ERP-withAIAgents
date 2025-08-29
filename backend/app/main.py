# backend/app/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import NoResultFound

# Use the single engine defined in app.db
from app.db import engine

# Routers
from app.routers.items import router as items_router
from app.routers.sim import router as sim_router

app = FastAPI(title="Lean AI-ERP")

# Routers (existing)
app.include_router(items_router)
app.include_router(sim_router)

# CORS (keep 5173 + 127.0.0.1:5173 for Vite)
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

# DB ping using the single engine
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

@app.get("/db/ping")
def db_ping():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"ok": True, "url": DATABASE_URL}
    except Exception as e:
        return {"ok": False, "error": str(e), "url": DATABASE_URL}

# --- Bootstrap: ensure base tables exist and seed minimal rows ---
# This runs once on import; perfect for dev.
with engine.begin() as conn:
    # Ensure sim_state row exists (self-heal for /sim/tick)
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS sim_state (
            id INTEGER PRIMARY KEY,
            current_day INTEGER DEFAULT 1
        )
    """))
    conn.execute(text("INSERT OR IGNORE INTO sim_state (id, current_day) VALUES (1, 1)"))

    # Ensure item table exists (you may already have this from step 1)
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS item (
            id INTEGER PRIMARY KEY,
            sku TEXT UNIQUE,
            name TEXT,
            uom TEXT DEFAULT 'pcs',
            reorder_point INTEGER DEFAULT 0,
            reorder_qty INTEGER DEFAULT 0,
            safety_stock INTEGER DEFAULT 0,
            lead_time_days INTEGER DEFAULT 7,
            on_hand INTEGER DEFAULT 0
        )
    """))

    # Seed items if empty (so you see something in the UI)
    count_items = conn.execute(text("SELECT COUNT(*) FROM item")).scalar_one()
    if count_items == 0:
        conn.execute(text("""
            INSERT INTO item (id, sku, name, uom, reorder_point, reorder_qty, safety_stock, lead_time_days, on_hand)
            VALUES
            (1,'FG-BOLT','Hex Bolt','pcs',60,80,20,7,120),
            (2,'FG-NUT','Hex Nut','pcs',50,80,10,7,24),
            (3,'RM-STEEL','Steel Rod','kg',200,200,50,10,500)
        """))

    # Movements table for Milestone 2
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS item_movement (
            id INTEGER PRIMARY KEY,
            item_id INTEGER NOT NULL,
            ts DATETIME DEFAULT (CURRENT_TIMESTAMP),
            move_type TEXT NOT NULL, -- IN / OUT / ADJUST
            qty INTEGER NOT NULL,
            note TEXT,
            FOREIGN KEY (item_id) REFERENCES item(id)
        )
    """))

    # Seed a few movements if empty (so clicking an item shows data)
    count_mv = conn.execute(text("SELECT COUNT(*) FROM item_movement")).scalar_one()
    if count_mv == 0:
        conn.execute(text("""
            INSERT INTO item_movement (item_id, ts, move_type, qty, note) VALUES
            (1, datetime('now','-3 days'), 'OUT', 15, 'WO-101 consumption'),
            (1, datetime('now','-1 days'), 'IN',  40, 'PO-5001 received'),
            (2, datetime('now','-2 days'), 'OUT', 8,  'Pack order #A12')
        """))

# --- Movements router (Milestone 2) ---
from fastapi import APIRouter, Query, Path

movements_router = APIRouter(tags=["items"])

@movements_router.get("/items/{item_id}/movements")
def item_movements(
    item_id: int = Path(..., ge=1),
    days: int = Query(60, ge=1, le=365)
):
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT ts, move_type, qty, COALESCE(note,'') AS note
            FROM item_movement
            WHERE item_id = :item_id
              AND ts >= datetime('now', printf('-%d days', :days))
            ORDER BY ts DESC
        """), {"item_id": item_id, "days": days}).mappings().all()
        return [dict(r) for r in rows]

app.include_router(movements_router)

# Optional friendly root
@app.get("/")
def root():
    return {"ok": True, "try": ["/items", "/sim/tick (POST)", "/items/1/movements?days=60", "/docs"]}
