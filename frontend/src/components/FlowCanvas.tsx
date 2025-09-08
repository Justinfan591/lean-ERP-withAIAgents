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

  // tiny helper to offset perpendicular to a line (positive = one side, negative = the other)
  const offsetPoint = (x: number, y: number, dx: number, dy: number, k: number) => {
    const len = Math.hypot(dx, dy) || 1;
    return { x: x + (-dy / len) * k, y: y + (dx / len) * k };
  };


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
  {/* ORDER lane head */}
  <marker
    id="head-order"
    markerWidth="12"
    markerHeight="8"
    refX="10"
    refY="4"
    orient="auto"
    markerUnits="strokeWidth"
  >
    <polygon points="0,0 12,4 0,8" fill="currentColor" />
  </marker>

  {/* SHIP lane head */}
  <marker
    id="head-ship"
    markerWidth="12"
    markerHeight="8"
    refX="10"
    refY="4"
    orient="auto"
    markerUnits="strokeWidth"
  >
    <polygon points="0,0 12,4 0,8" fill="currentColor" />
  </marker>
</defs>


        {/* static links: two parallel lanes (order vs ship) */}
{lines.map(({ flow, from, to }) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Wider lane separation to avoid overlap artifacts
  const SEP = 12;

  const fromOrder = offsetPoint(from.x, from.y, dx, dy,  SEP);
  const toOrder   = offsetPoint(to.x,   to.y,   dx, dy,  SEP);
  const fromShip  = offsetPoint(from.x, from.y, dx, dy, -SEP);
  const toShip    = offsetPoint(to.x,   to.y,   dx, dy, -SEP);

  return (
    <g key={flow.id}>
      {/* ORDER lane */}
      <line
        x1={fromOrder.x} y1={fromOrder.y}
        x2={toOrder.x}   y2={toOrder.y}
        stroke="currentColor"
        strokeWidth={2.25}
        strokeOpacity={0.95}
        markerEnd="url(#head-order)"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ shapeRendering: "geometricPrecision", mixBlendMode: "normal" }}
      />
      {/* SHIP lane */}
      <line
        x1={fromShip.x} y1={fromShip.y}
        x2={toShip.x}   y2={toShip.y}
        stroke="currentColor"
        strokeWidth={2}
        strokeOpacity={0.55}
        markerEnd="url(#head-ship)"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ shapeRendering: "geometricPrecision", mixBlendMode: "normal" }}
      />
    </g>
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
            const SEP = 12;
          // ALWAYS offset: order pulses on +6 lane, ship pulses on -6 lane
          const laneOffset = p.kind === "ship" ? -SEP : SEP; // default order if kind missing
          ({ x, y } = offsetPoint(x, y, dx, dy, laneOffset));

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
