import React, { useEffect, useMemo, useRef, useState } from "react";

export type Anchor = { id: string; x: number; y: number };
export type Flow = { id: string; from: string; to: string };
type Pulse = { id: string; from: string; to: string; start: number; duration: number };

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
          const x = from.x + (to.x - from.x) * t;
          const y = from.y + (to.y - from.y) * t;

          const trailTs = [0.72, 0.5, 0.28].map((back) => Math.max(0, t - 0.06 / back));

          return (
            <g key={p.id}>
              {trailTs.map((tt, i) => {
                const tx = from.x + (to.x - from.x) * tt;
                const ty = from.y + (to.y - from.y) * tt;
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
