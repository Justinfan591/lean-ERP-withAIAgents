export type Summary = { day: number; otif: number; stockouts: number };
export type Item = { id: number; sku: string; name: string; on_hand: number; reorder_point: number };
export type EventRow = { id: number; ts: string; text: string };
export type PlannerProposal = { id: string; type: "NEW_PO"; item_id: number; qty: number; due_day: number; reason: string };

export type Supplier = {
  id: string;
  name: string;
  lead_time_days: number;
  rating: number;
};

export type PurchaseOrder = {
  po_number: string;
  item_id: number;
  sku: string;
  item_name: string;
  qty: number;
  supplier: Supplier;
  unit_price: number;
  total_price: number;
  delivery_date: string;
  payment_terms: string;
  notes: string;
};

export type Email = {
  to: string;
  subject: string;
  body: string;
};