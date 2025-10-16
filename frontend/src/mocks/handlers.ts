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

// Mock suppliers database
const suppliers = [
  { id: "sup1", name: "FastParts Inc.", lead_time_days: 3, rating: 4.8 },
  { id: "sup2", name: "Reliable Manufacturing", lead_time_days: 5, rating: 4.9 },
  { id: "sup3", name: "Global Supply Co.", lead_time_days: 7, rating: 4.5 },
];

// Helper to generate PO from proposal
function generatePO(proposal: any) {
  const item = items.find(i => i.id === proposal.item_id);
  if (!item) throw new Error("Item not found");
  
  // Choose best supplier based on rating and lead time
  const supplier = suppliers.sort((a, b) => b.rating - a.rating)[0];
  
  // Calculate pricing (mock calculation)
  const unitPrice = item.sku.startsWith("FG") ? 2.50 : 1.20;
  const totalPrice = unitPrice * proposal.qty;
  
  // Calculate delivery date
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + supplier.lead_time_days);
  
  const po = {
    po_number: `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    item_id: item.id,
    sku: item.sku,
    item_name: item.name,
    qty: proposal.qty,
    supplier,
    unit_price: unitPrice,
    total_price: totalPrice,
    delivery_date: deliveryDate.toISOString().split('T')[0],
    payment_terms: "Net 30",
    notes: `Generated from planner proposal: ${proposal.reason}`,
  };
  
  // Generate email
  const email = {
    to: `purchasing@${supplier.name.toLowerCase().replace(/\s+/g, '')}.com`,
    subject: `Purchase Order ${po.po_number} - ${item.name}`,
    body: `Dear ${supplier.name} Team,

Please find our purchase order details below:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PURCHASE ORDER: ${po.po_number}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Item Details:
• SKU: ${po.sku}
• Description: ${po.item_name}
• Quantity: ${po.qty} units

Pricing:
• Unit Price: $${po.unit_price.toFixed(2)}
• Total Amount: $${po.total_price.toFixed(2)}

Delivery:
• Required Delivery Date: ${po.delivery_date}
• Shipping Address: 123 Warehouse St, Industrial Park

Payment Terms: ${po.payment_terms}

Special Instructions:
${po.notes}

Please confirm receipt of this order and provide:
1. Order confirmation number
2. Estimated shipping date
3. Tracking information when available

Thank you for your continued partnership.

Best regards,
Procurement Team
Lean AI-ERP System

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated message from the Buyer Agent.
Please do not reply to this email directly.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
  };
  
  return { po, email };
}

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
  
  // Buyer Agent: Approve proposal -> Generate PO and Email
  http.post("/agents/buyer/approve", async ({ request }) => {
    const body = await request.json() as { proposal_id: string };
    const proposal = plannerProposals.find(p => p.id === body.proposal_id);
    
    if (!proposal) {
      return HttpResponse.json({ error: "Proposal not found" }, { status: 404 });
    }
    
    // Generate PO and Email
    const { po, email } = generatePO(proposal);
    
    // Add event
    events.unshift({
      id: ++eventId,
      ts: new Date().toISOString(),
      text: `🤖 Buyer Agent created ${po.po_number} for ${po.qty}x ${po.sku} → ${po.supplier.name}`,
    });
    
    // Remove proposal from list
    const index = plannerProposals.findIndex(p => p.id === body.proposal_id);
    if (index > -1) plannerProposals.splice(index, 1);
    
    return HttpResponse.json({ po, email });
  }),
];
