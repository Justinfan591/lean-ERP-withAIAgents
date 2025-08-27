from fastapi import APIRouter
from sqlalchemy import text
from app.db import engine

router = APIRouter(tags=["sim"])

@router.post("/sim/tick")
def sim_tick():
    with engine.begin() as conn:
        conn.execute(text("UPDATE sim_state SET current_day = current_day + 1 WHERE id = 1"))
        day = conn.execute(text("SELECT current_day FROM sim_state WHERE id = 1")).scalar_one()
        conn.execute(text("""
            INSERT INTO event_log (actor, event_type, payload_json)
            VALUES ('sim', 'TICK', json('{"note":"advanced one day"}'))
        """))
    return {"day": day, "new_sos": 1, "pos_received": 0, "pos_late": 1}
