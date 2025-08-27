from fastapi import APIRouter
from sqlalchemy import text
from app.db import engine

router = APIRouter(tags=["sim"])

@router.post("/sim/tick")
def sim_tick():
    with engine.begin() as conn:
        # Ensure the row exists, then advance the day
        conn.execute(text("""
            INSERT INTO sim_state (id, current_day)
            VALUES (1, 1)
            ON CONFLICT(id) DO NOTHING
        """))  # SQLite syntax; harmless if row exists

        conn.execute(text("UPDATE sim_state SET current_day = current_day + 1 WHERE id = 1"))
        day = conn.execute(text("SELECT current_day FROM sim_state WHERE id = 1")).scalar_one()

        # Log the event (works even if JSON1 isn't present; SQLite will store as text/JSON)
        conn.execute(text("""
            INSERT INTO event_log (actor, event_type, payload_json)
            VALUES ('sim', 'TICK', json('{"note":"advanced one day"}'))
        """))

    return {"day": day, "new_sos": 1, "pos_received": 0, "pos_late": 1}
