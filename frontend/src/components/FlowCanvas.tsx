import React, { useEffect, useMemo, useRef, useState } from "react";

export type Anchor = { id: string; x: number; y: number };
export type Flow = { id: string; from: string; to: string };

// Allow extra metadata carried by pulse events (optional)
type PulseExtra = {
  qty?: number; // e.g., show "+12" bubble
  kind?: "order" | "ship"; // optional lane offset
};

type Pulse = {
  id: string;
  from: string;
  to: string;
  start: number;      // ms
  duration: number;   // ms
} & PulseExtra;

type Props = {
  anchors: Anchor[];
  flows: Flow[];
  flashed?: Set<string>;
  pulses?: Pulse[];
};

export default function FlowCanvas({ anchors, flows, flashed, pulses = [] }: Props) {
  const getAnchor = (id: string) => anchors.find((a) => a.id === id);

  const lines = useMemo(() => {
    return flows
      .map((flow) => {
        const from = getAnchor(flow.from);
        const to = getAnchor(flow.to);
        if (!from || !to) return null;
        return { flow, from, to };
      })
      .filter(Boolean) as { flow: Flow; from: Anchor; to: Anchor }[];
  }, [anchors, flows]);

  // RAF tick to update pulse positions
  const [, setTick] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const loop = () => {
      setTick((t) => (t + 1) % 1_000_000); // keep state change tiny
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const now = performance.now();

  // INSERT A: small helper to offset points perpendicular to a link (for lanes)
  const offsetPoint = (x: number, y: number, dx: number, dy: number, k: number) => {
    const len = Math.hypot(dx, dy) || 1;
    // perpendicular vector (-dy, dx)
    return { x: x + (-dy / len) * k, y: y + (dx / len) * k };
  };

  return (
    <>
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 50,
        }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" />
          </marker>
          <marker id="arrowhead-flash" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto">
            <polygon points="0 0, 12 4, 0 8" />
          </marker>
        </defs>

        {/* static links */}
        {lines.map(({ flow, from, to }) => {
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const len = Math.hypot(dx, dy);
          const isFlashing = !!flashed?.has(flow.id);

          return (
            <line
              key={flow.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="currentColor"
              strokeWidth={isFlashing ? 3 : 2}
              markerEnd={`url(#${isFlashing ? "arrowhead-flash" : "arrowhead"})`}
              className={isFlashing ? "flow-line flashing" : "flow-line"}
              style={
                isFlashing
                  ? ({
                      strokeDasharray: `${Math.max(8, Math.min(16, len / 12))} ${Math.max(
                        6,
                        Math.min(14, len / 18)
                      )}`,
                    } as React.CSSProperties)
                  : undefined
              }
            />
          );
        })}

        {/* impulses (moving dots with a short tail) */}
        {pulses.map((p) => {
          const from = getAnchor(p.from);
          const to = getAnchor(p.to);
          if (!from || !to) return null;

          const elapsed = now - p.start;
          if (elapsed < 0 || elapsed > p.duration) return null;

          const t = elapsed / p.duration; // 0..1
          const dx = to.x - from.x;
          const dy = to.y - from.y;

          // base position
          let x = from.x + dx * t;
          let y = from.y + dy * t;

          // Optional lane offset by kind
          if (p.kind === "order") {
            const o = offsetPoint(x, y, dx, dy, 6);
            x = o.x; y = o.y;
          } else if (p.kind === "ship") {
            const o = offsetPoint(x, y, dx, dy, -6);
            x = o.x; y = o.y;
          }

          const trailTs = [0.72, 0.5, 0.28].map((back) => Math.max(0, t - 0.06 / back));

          return (
            <g key={p.id}>
              {trailTs.map((tt, i) => {
                let tx = from.x + dx * tt;
                let ty = from.y + dy * tt;
                if (p.kind === "order") {
                  const o = offsetPoint(tx, ty, dx, dy, 6);
                  tx = o.x; ty = o.y;
                } else if (p.kind === "ship") {
                  const o = offsetPoint(tx, ty, dx, dy, -6);
                  tx = o.x; ty = o.y;
                }
                return (
                  <circle
                    key={`${p.id}-trail-${i}`}
                    cx={tx}
                    cy={ty}
                    r={3 - i * 0.6}
                    fill="currentColor"
                    opacity={0.25 - i * 0.06}
                  />
                );
              })}
              <circle cx={x} cy={y} r={3.5} fill="currentColor" />
            </g>
          );
        })}

        {/* INSERT B: mid-link order labels (e.g., "+12") */}
        {pulses.map((p) => {
          const from = getAnchor(p.from), to = getAnchor(p.to);
          if (!from || !to || p.qty == null) return null;
          const elapsed = now - p.start;
          if (elapsed < 0 || elapsed > p.duration) return null;

          // midpoint of the (optionally offset) lane
          const mxBase = (from.x + to.x) / 2;
          const myBase = (from.y + to.y) / 2;

          let mx = mxBase, my = myBase;
          const dx = to.x - from.x, dy = to.y - from.y;
          if (p.kind === "order") {
            const o = offsetPoint(mxBase, myBase, dx, dy, 6);
            mx = o.x; my = o.y;
          } else if (p.kind === "ship") {
            const o = offsetPoint(mxBase, myBase, dx, dy, -6);
            mx = o.x; my = o.y;
          }

          // fade out over the pulse lifetime
          const life = 1 - Math.min(1, elapsed / (p.duration * 0.9));

          return (
            <g key={`${p.id}-label`} transform={`translate(${mx},${my - 12})`} opacity={life}>
              <rect x={-18} y={-11} rx={6} ry={6} width={36} height={22} fill="#111" stroke="#333" />
              <text x={0} y={5} textAnchor="middle" fontSize="11" fill="#fff">
                +{p.qty}
              </text>
            </g>
          );
        })}
      </svg>

      <style>
        {`
          .flow-line { color: #111; opacity: 0.85; }
          .flow-line.flashing { animation: flow-dash 900ms linear infinite; }
          @keyframes flow-dash { to { stroke-dashoffset: -40; } }
        `}
      </style>
    </>
  );
}
