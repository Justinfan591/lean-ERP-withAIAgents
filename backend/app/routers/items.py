from fastapi import APIRouter, Body, HTTPException
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

@router.post("/items/{item_id}/movements")
def add_movement(item_id: int, payload: dict = Body(...)):
    move_type = payload.get("move_type")
    qty = int(payload.get("qty", 0))
    note = payload.get("note", "")

    if move_type not in ("IN", "OUT", "ADJUST") or qty <= 0:
        raise HTTPException(status_code=400, detail="invalid payload")

    with engine.begin() as conn:
        conn.execute(
            text("""
                INSERT INTO item_movement (item_id, move_type, qty, note)
                VALUES (:id, :t, :q, :n)
            """),
            {"id": item_id, "t": move_type, "q": qty, "n": note},
        )
        if move_type == "IN":
            conn.execute(text("UPDATE item SET on_hand = on_hand + :q WHERE id = :id"), {"id": item_id, "q": qty})
        elif move_type == "OUT":
            conn.execute(text("UPDATE item SET on_hand = on_hand - :q WHERE id = :id"), {"id": item_id, "q": qty})

    return {"ok": True}