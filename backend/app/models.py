# app/models.py
from sqlalchemy import (
    String, Date, DateTime, ForeignKey, Float, JSON, CheckConstraint
)
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from .db import Base

class Item(Base):
    __tablename__ = "item"
    id: Mapped[int] = mapped_column(primary_key=True)
    sku: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    uom: Mapped[str] = mapped_column(String(16), default="pcs")
    reorder_point: Mapped[int] = mapped_column(default=0)
    reorder_qty: Mapped[int] = mapped_column(default=0)
    safety_stock: Mapped[int] = mapped_column(default=0)
    lead_time_days: Mapped[int] = mapped_column(default=7)
    on_hand: Mapped[int] = mapped_column(default=0)

class Customer(Base):
    __tablename__ = "customer"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    priority: Mapped[int] = mapped_column(default=2)  # 1=A,2=B,3=C

class Supplier(Base):
    __tablename__ = "supplier"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    reliability: Mapped[float] = mapped_column(default=0.9)
    avg_lead_days: Mapped[int] = mapped_column(default=7)

class SalesOrder(Base):
    __tablename__ = "sales_order"
    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customer.id"))
    order_date: Mapped[Date] = mapped_column(Date)
    ship_by: Mapped[Date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(32), default="Open")

class SalesOrderLine(Base):
    __tablename__ = "sales_order_line"
    id: Mapped[int] = mapped_column(primary_key=True)
    so_id: Mapped[int] = mapped_column(ForeignKey("sales_order.id"))
    item_id: Mapped[int] = mapped_column(ForeignKey("item.id"))
    qty: Mapped[int] = mapped_column()
    allocated_qty: Mapped[int] = mapped_column(default=0)

class PurchaseOrder(Base):
    __tablename__ = "purchase_order"
    id: Mapped[int] = mapped_column(primary_key=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("supplier.id"))
    expected_date: Mapped[Date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(32), default="Open")

class PurchaseOrderLine(Base):
    __tablename__ = "purchase_order_line"
    id: Mapped[int] = mapped_column(primary_key=True)
    po_id: Mapped[int] = mapped_column(ForeignKey("purchase_order.id"))
    item_id: Mapped[int] = mapped_column(ForeignKey("item.id"))
    qty: Mapped[int] = mapped_column()
    received_qty: Mapped[int] = mapped_column(default=0)

class StockMovement(Base):
    __tablename__ = "stock_movement"
    id: Mapped[int] = mapped_column(primary_key=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("item.id"))
    type: Mapped[str] = mapped_column(String(16))  # RECEIPT|SHIPMENT|ADJUSTMENT
    qty: Mapped[int] = mapped_column()
    ref: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class EventLog(Base):
    __tablename__ = "event_log"
    id: Mapped[int] = mapped_column(primary_key=True)
    ts: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    actor: Mapped[str] = mapped_column(String(64))
    event_type: Mapped[str] = mapped_column(String(64))
    payload_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)

class SimState(Base):
    __tablename__ = "sim_state"
    id: Mapped[int] = mapped_column(primary_key=True)  # always 1
    current_day: Mapped[int] = mapped_column(default=0)

# Example (optional) constraint pattern if you add negatives later:
# __table_args__ = (CheckConstraint("qty >= 0", name="ck_qty_nonneg"),)
