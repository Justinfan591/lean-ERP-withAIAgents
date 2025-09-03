// src/lib/flowBus.ts
type Handler<T> = (d: T) => void;
const subs = new Map<string, Set<Handler<any>>>();

function on<T = any>(evt: string, h: Handler<T>) {
  if (!subs.has(evt)) subs.set(evt, new Set());
  subs.get(evt)!.add(h as any);
  return () => subs.get(evt)!.delete(h as any);
}
function emit<T = any>(evt: string, d: T) {
  subs.get(evt)?.forEach((h) => h(d));
}

// existing flash API you already have…
export type FlowFlashDetail = { from: string; to: string };
export const onFlowFlash = (h: Handler<FlowFlashDetail>) => on<FlowFlashDetail>("flash", h);
export const flashFlow = (from: string, to: string) => emit<FlowFlashDetail>("flash", { from, to });

// NEW: pulse API
export type FlowPulseDetail = {
  from: string;
  to: string;
  durationMs?: number; // default 900
  count?: number;      // how many pulses in a train (default 1)
  gapMs?: number;      // delay between pulses (default 120)
};
export const onFlowPulse = (h: Handler<FlowPulseDetail>) => on<FlowPulseDetail>("pulse", h);
export const pulseFlow = (from: string, to: string, opts: Omit<FlowPulseDetail, "from" | "to"> = {}) =>
  emit<FlowPulseDetail>("pulse", { from, to, ...opts });
