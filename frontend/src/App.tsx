import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import TopBar from "./components/TopBar";
import GameBoard from "./components/GameBoard";
import AgentConsole from "./components/AgentConsole";
import EventFeed from "./components/EventFeed";
import DevBanner from "./components/DevBanner";
import ItemsPanel from "./components/ItemsPanel";
import PlannerPanel from "./components/PlannerPanel";

import FlowCanvas, { type Anchor, type Flow } from "./components/FlowCanvas";
import { onFlowPulse } from "./lib/flowBus"; // ensure flowBus exports onFlowPulse

type Pulse = {
  id: string;       // unique
  from: string;
  to: string;
  start: number;    // ms
  duration: number; // ms
};

export default function App() {
  const overlayRootRef = useRef<HTMLDivElement | null>(null);

  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [flashed] = useState<Set<string>>(new Set()); // kept for FlowCanvas compatibility
  const [pulses, setPulses] = useState<Pulse[]>([]);

  const flows: Flow[] = useMemo(
    () => [
      { id: "SUP->WH", from: "SUP", to: "WH" },
      { id: "WH->CUST", from: "WH", to: "CUST" },
      { id: "WH->SUP", from: "WH", to: "SUP" },
      { id: "CUST->WH", from: "CUST", to: "WH" },
    ],
    []
  );

  // Compute anchors from ANY element with data-flow-anchor="ID"
  const recomputeAnchors = () => {
    const root = overlayRootRef.current;
    if (!root) return;

    const rootRect = root.getBoundingClientRect();
    const nodes = root.querySelectorAll<HTMLElement>("[data-flow-anchor]");

    const next: Anchor[] = [];
    nodes.forEach((el) => {
      const id = el.dataset.flowAnchor?.trim();
      if (!id) return;
      const r = el.getBoundingClientRect();
      next.push({
        id,
        x: r.left - rootRect.left + r.width / 2,
        y: r.top - rootRect.top + r.height / 2,
      });
    });

    const byId = new Map<string, Anchor>();
    next.forEach((a) => byId.set(a.id, a));
    setAnchors(Array.from(byId.values()));
  };

  useLayoutEffect(() => {
    recomputeAnchors();

    const ro = new ResizeObserver(() => recomputeAnchors());
    if (overlayRootRef.current) ro.observe(overlayRootRef.current);

    const observeAll = () => {
      overlayRootRef.current
        ?.querySelectorAll<HTMLElement>("[data-flow-anchor]")
        .forEach((el) => ro.observe(el));
    };
    observeAll();

    const onResize = () => recomputeAnchors();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, []);

  // Subscribe for pulse trains (impulse dots)
  useEffect(() => {
    // Track timeout ids to clear on unmount
    const timeouts = new Set<number>();

    const stop = onFlowPulse(({ from, to, durationMs = 900, count = 1, gapMs = 120 }) => {
      const now = performance.now();

      const newOnes: Pulse[] = Array.from({ length: count }, (_, i) => ({
        id: `${from}->${to}#${now + i}`,
        from,
        to,
        start: now + i * gapMs,
        duration: durationMs,
      }));
      setPulses((prev) => [...prev, ...newOnes]);

      // GC after the last pulse finishes
      const endAt = now + (count - 1) * gapMs + durationMs + 50;
      const tid = window.setTimeout(() => {
        const tNow = performance.now();
        setPulses((prev) => prev.filter((p) => p.start + p.duration > tNow));
        timeouts.delete(tid);
      }, Math.max(0, endAt - now));
      timeouts.add(tid);
    });

    return () => {
      stop?.();
      timeouts.forEach((tid) => clearTimeout(tid));
      timeouts.clear();
    };
  }, []);

  return (
    <div ref={overlayRootRef} style={{ position: "relative", minHeight: "100vh" }}>
      <DevBanner />
      <TopBar />

      {/* Your existing layout; just add small data-flow-anchor wrappers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 16, padding: "12px 16px" }}>
        <div>
          <div data-flow-anchor="SUP">
            <ItemsPanel />
          </div>
          <PlannerPanel />
        </div>

        <div>
          {/* Ideally place data-flow-anchor="WH" on the actual Warehouse tile *inside* GameBoard */}
          <div data-flow-anchor="WH">
            <GameBoard />
          </div>
        </div>

        <div>
          <div data-flow-anchor="CUST">
            <AgentConsole />
          </div>
          <EventFeed />
        </div>
      </div>

      {/* Overlay with lines + impulse dots */}
      <FlowCanvas anchors={anchors} flows={flows} flashed={flashed} pulses={pulses} />
    </div>
  );
}
