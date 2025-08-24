export type Summary = { day: number; otif: number; stockouts: number };
export type Item = { id: number; sku: string; name: string; on_hand: number; reorder_point: number };
export type EventRow = { id: number; ts: string; text: string };
export type PlannerProposal = { id: string; type: "NEW_PO"; item_id: number; qty: number; due_day: number; reason: string };
