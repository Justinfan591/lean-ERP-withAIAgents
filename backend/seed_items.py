from sqlalchemy import create_engine, text

e = create_engine("sqlite:///./dev.db", future=True, connect_args={"check_same_thread": False})

with e.begin() as c:
    c.execute(text("""
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
    n = c.execute(text("SELECT COUNT(*) FROM item")).scalar_one()
    if n == 0:
        c.execute(text("""
            INSERT INTO item (id, sku, name, uom, reorder_point, reorder_qty, safety_stock, lead_time_days, on_hand)
            VALUES
            (1,'FG-BOLT','Hex Bolt','pcs',60,80,20,7,120),
            (2,'FG-NUT','Hex Nut','pcs',50,80,10,7,24),
            (3,'RM-STEEL','Steel Rod','kg',200,200,50,10,500)
        """))
        print("Seeded 3 items.")
    else:
        print(f"Items already present: {n}")
