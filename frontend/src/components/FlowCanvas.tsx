import { useEffect, useMemo, useRef, useState } from "react";

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
  pulses?: Pulse[];
};

export default function FlowCanvas({ anchors, flows, pulses = [] }: Props) {
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
          {/* Arrow marker for flow lines */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="rgba(100, 116, 139, 0.4)" />
          </marker>
        </defs>

        {/* static connection lines with arrows */}
{lines.map(({ flow, from, to }) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  // Shorten the line to avoid overlapping with the tile
  const shortenBy = 40; // pixels to shorten from each end
  const startX = from.x + (dx * shortenBy) / length;
  const startY = from.y + (dy * shortenBy) / length;
  const endX = to.x - (dx * shortenBy) / length;
  const endY = to.y - (dy * shortenBy) / length;
  
  return (
    <g key={flow.id}>
      {/* Arrow line */}
      <line
        x1={startX} y1={startY}
        x2={endX}   y2={endY}
        stroke="rgba(100, 116, 139, 0.35)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        markerEnd="url(#arrowhead)"
        style={{ shapeRendering: "geometricPrecision" }}
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

          // base position - no lane offset, single clean path
          const x = from.x + dx * t;
          const y = from.y + dy * t;

          const pulseColor = p.kind === "ship" ? "#10b981" : "#3b82f6";
          
          return (
            <g key={p.id}>
              {/* Simple pulse dot - no trails or glows */}
              <circle 
                cx={x} 
                cy={y} 
                r={3} 
                fill={pulseColor}
                opacity={0.8}
              />
            </g>
          );
        })}

        {/* Simplified quantity labels - only show when qty is present */}
        {pulses.map((p) => {
          const from = getAnchor(p.from), to = getAnchor(p.to);
          if (!from || !to || p.qty == null) return null;
          const elapsed = now - p.start;
          if (elapsed < 0 || elapsed > p.duration) return null;

          // Position near the pulse
          const t = elapsed / p.duration;
          const dx = to.x - from.x, dy = to.y - from.y;
          const mx = from.x + dx * t;
          const my = from.y + dy * t;

          // fade out over the pulse lifetime
          const life = 1 - Math.min(1, elapsed / (p.duration * 0.9));

          const labelColor = p.kind === "ship" ? "#10b981" : "#3b82f6";
          
          return (
            <g key={`${p.id}-label`} transform={`translate(${mx},${my - 18})`} opacity={life * 0.8}>
              {/* Minimal label */}
              <rect 
                x={-16} 
                y={-10} 
                rx={6} 
                ry={6} 
                width={32} 
                height={20} 
                fill="rgba(17, 19, 24, 0.9)"
                stroke={labelColor}
                strokeWidth={1}
                strokeOpacity={0.6}
              />
              <text 
                x={0} 
                y={3} 
                textAnchor="middle" 
                fontSize="11" 
                fontWeight="500"
                fill={labelColor}
                fillOpacity={0.9}
              >
                +{p.qty}
              </text>
            </g>
          );
        })}
      </svg>

    </>
  );
}
