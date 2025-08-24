import { http, HttpResponse } from "msw";

let day = 1;
let eventId = 0;

type Event = { id: number; ts: string; text: string };
const events: Event[] = [
  { id: ++eventId, ts: new Date().toISOString(), text: "🎮 Simulation ready" },
];

const items = [
  { id: 1, sku: "FG-BOLT",  name: "Hex Bolt",   on_hand: 120, reorder_point: 60 },
  { id: 2, sku: "FG-NUT",   name: "Hex Nut",    on_hand: 24,  reorder_point: 50 },
  { id: 3, sku: "RM-STEEL", name: "Steel Rod",  on_hand: 500, reorder_point: 200 },
];

const plannerProposals = [
  { id: "p1", type: "NEW_PO", item_id: 2, qty: 80, due_day: day + 7, reason: "Projected shortfall for FG-NUT" },
];

export const handlers = [
  // Summary header
  http.get("/state/summary", () =>
    HttpResponse.json({ day, otif: 0.92, stockouts: 1 })
  ),

  // Items list
  http.get("/items", () => HttpResponse.json(items)),

  // Tick the sim one day
  http.post("/sim/tick", async () => {
    day += 1;
    const msg = `⏭️ Advanced to day ${day} • late POs: ${Math.random() < 0.4 ? 1 : 0}`;
    events.unshift({ id: ++eventId, ts: new Date().toISOString(), text: msg });
    return HttpResponse.json({ day, new_sos: 1, pos_received: 0, pos_late: 1 });
  }),

  // Event feed
  http.get("/events", () => HttpResponse.json(events.slice(0, 20))),

  // Planner proposals (static for now)
  http.get("/agents/planner/proposals", () =>
    HttpResponse.json(plannerProposals)
  ),
];
