from fastapi import APIRouter
from sqlalchemy import text
from app.db import engine

router = APIRouter(tags=["items"])

@router.get("/items")
def list_items():
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT id, sku, name, on_hand, reorder_point
            FROM item
            ORDER BY id
        """)).mappings().all()
        return [dict(r) for r in rows]
