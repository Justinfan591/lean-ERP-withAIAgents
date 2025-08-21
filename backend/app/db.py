# app/db.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Default to local SQLite so you can work without Docker
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

class Base(DeclarativeBase):
    pass

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
