// super lightweight bus using the DOM EventTarget (no extra deps)
const target = new EventTarget();

export type FlowFlashDetail = { from: string; to: string };

export function flashFlow(from: string, to: string) {
  target.dispatchEvent(new CustomEvent<FlowFlashDetail>("flow-flash", { detail: { from, to } }));
}

export function onFlowFlash(handler: (d: FlowFlashDetail) => void) {
  const h = (e: Event) => handler((e as CustomEvent<FlowFlashDetail>).detail);
  target.addEventListener("flow-flash", h);
  return () => target.removeEventListener("flow-flash", h);
}
