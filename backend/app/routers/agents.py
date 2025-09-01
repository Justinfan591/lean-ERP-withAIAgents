from fastapi import APIRouter, Body, HTTPException
from sqlalchemy import text
from app.db import engine


router = APIRouter(tags=["agents"])

@router.get("/agents/planner/proposals")
def planner_proposals():
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT id, sku, name, on_hand, reorder_point, reorder_qty, safety_stock
            FROM item
            ORDER BY id
        """)).mappings().all()

    proposals = []
    for r in rows:
        on_hand = r["on_hand"] or 0
        rp = r.get("reorder_point") or 0
        rq = r.get("reorder_qty") or 0
        ss = r.get("safety_stock") or 0
        if on_hand < rp:
            # easy heuristic
            need = max(rq, (rp - on_hand) + ss)
            proposals.append({
                "proposal_id": f"PLN-{r['id']}",     # synthetic id
                "item_id": r["id"],
                "sku": r["sku"],
                "name": r["name"],
                "suggested_qty": int(need),
                "reason": f"on_hand {on_hand} < reorder_point {rp}, ss {ss}",
            })
    return proposals

@router.post("/agents/planner/act")
def planner_act(payload: dict = Body(...)):
    action = payload.get("action")  # "APPROVE" | "REJECT"
    item_id = int(payload.get("item_id", 0))
    qty = int(payload.get("qty", 0))
    sku = payload.get("sku", "")
    proposal_id = payload.get("proposal_id", "")

    if action not in ("APPROVE", "REJECT"):
        raise HTTPException(status_code=400, detail="invalid action")
    if item_id <= 0:
        raise HTTPException(status_code=400, detail="invalid item_id")

    with engine.begin() as conn:
        if action == "APPROVE":
            if qty <= 0:
                raise HTTPException(status_code=400, detail="invalid qty")
            # create PO
            r = conn.execute(
                text("""
                    INSERT INTO purchase_order (item_id, qty, status, note)
                    VALUES (:item_id, :qty, 'OPEN', :note)
                """),
                {"item_id": item_id, "qty": qty, "note": f"Planner proposal {proposal_id} for {sku}"},
            )
            po_id = conn.execute(text("SELECT last_insert_rowid()")).scalar_one()
            # event
            conn.execute(text("""
                INSERT INTO event_log (actor, event_type, payload_json)
                VALUES ('planner', 'PO_CREATED', json(:payload))
            """), {"payload": f'{{"po_id":{po_id},"item_id":{item_id},"qty":{qty},"sku":"{sku}"}}'})
            msg = f"📝 Created PO-{po_id} {qty} pcs for {sku}"
            return {"ok": True, "message": msg, "po_id": po_id}

        else:  # REJECT
            conn.execute(text("""
                INSERT INTO event_log (actor, event_type, payload_json)
                VALUES ('planner', 'PROPOSAL_REJECTED', json(:payload))
            """), {"payload": f'{{"proposal_id":"{proposal_id}","item_id":{item_id},"sku":"{sku}"}}'})
            return {"ok": True, "message": f"❌ Rejected {proposal_id} for {sku}"}
        
    # Events log
@router.get("/events")
def events():
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT id, ts, actor, event_type, payload_json
            FROM event_log
            ORDER BY id DESC
            LIMIT 100
        """)).mappings().all()
    return [dict(r) for r in rows]
