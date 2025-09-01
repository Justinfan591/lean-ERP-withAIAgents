import { useLayoutEffect, useRef, useState } from "react";

export type Anchor = { id: string; x: number; y: number };
export type Flow = { id: string; from: string; to: string; highlight?: boolean };

export default function FlowCanvas({ anchors, flows }: { anchors: Anchor[]; flows: Flow[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const onResize = () => {
      setSize({ w: window.innerWidth, h: window.innerHeight });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const aById = Object.fromEntries(anchors.map((a) => [a.id, a]));

  const path = (a: Anchor, b: Anchor) => {
    const dx = (b.x - a.x) / 2;
    const c1x = a.x + dx,
      c1y = a.y;
    const c2x = b.x - dx,
      c2y = b.y;
    return `M ${a.x} ${a.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${b.x} ${b.y}`;
  };

  return (
    <svg ref={svgRef} className="pointer-events-none fixed inset-0" width={size.w} height={size.h}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(34 197 94)" />
          <stop offset="100%" stopColor="rgb(234 179 8)" />
        </linearGradient>
      </defs>

      {flows.map((f) => {
        const a = aById[f.from],
          b = aById[f.to];
        if (!a || !b) return null;
        return (
          <path
            key={f.id}
            d={path(a, b)}
            fill="none"
            stroke={f.highlight ? "url(#grad)" : "currentColor"}
            strokeWidth={f.highlight ? 3 : 2}
            className={"text-zinc-600 " + (f.highlight ? "animate-[dash_0.8s_ease]" : "")}
            style={{
              strokeDasharray: f.highlight ? "6 6" : undefined,
              markerEnd: "url(#arrow)",
            }}
          />
        );
      })}

      <style>{`@keyframes dash { from { stroke-dashoffset: 30 } to { stroke-dashoffset: 0 } }`}</style>
    </svg>
  );
}
