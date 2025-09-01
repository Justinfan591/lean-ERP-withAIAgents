import TopBar from "./components/TopBar";
import GameBoard from "./components/GameBoard";
import AgentConsole from "./components/AgentConsole";
import EventFeed from "./components/EventFeed";
import DevBanner from "./components/DevBanner";
import ItemsPanel from "./components/ItemsPanel";
import PlannerPanel from "./components/PlannerPanel";
import { onFlowFlash } from "./lib/flowBus";

// NEW (for arrows):
import { useEffect, useState } from "react";
import FlowCanvas, { type Anchor, type Flow } from "./components/FlowCanvas";

export default function App() {
  // --- ARROWS: anchors + flows state
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [flows, setFlows] = useState<Flow[]>([
    // start with a single static arrow RM -> FG
    { id: "rm-fg", from: "RM", to: "FG", highlight: false },
  ]);

  // Recompute anchor coordinates after mount & on resize
  useEffect(() => {
    const compute = () => {
      const rmEl = document.getElementById("rm-anchor");
      const fgEl = document.getElementById("fg-anchor");
      const toPoint = (el: HTMLElement | null) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      };
      const a: Anchor[] = [];
      const rm = toPoint(rmEl);
      const fg = toPoint(fgEl);
      if (rm) a.push({ id: "RM", ...rm });
      if (fg) a.push({ id: "FG", ...fg });
      setAnchors(a);
    };

    useEffect(() => {
    // when someone emits a flash (e.g. ItemDrawer), highlight the RM->FG flow briefly
    const off = onFlowFlash(({ from, to }) => {
      setFlows((prev) =>
        prev.map((f) => (f.from === from && f.to === to ? { ...f, highlight: true } : f))
      );
      setTimeout(() => {
        setFlows((prev) =>
          prev.map((f) => (f.from === from && f.to === to ? { ...f, highlight: false } : f))
        );
      }, 800);
    });
    return off;
  }, []);

    compute();
    window.addEventListener("resize", compute);
    // Recompute shortly after first paint so layout settles
    const t = setTimeout(compute, 100);
    return () => {
      window.removeEventListener("resize", compute);
      clearTimeout(t);
    };
  }, []);

  return (
    <div className="h-full grid grid-rows-[auto_1fr_auto]">
      <DevBanner />
      <TopBar />

      {/* Main content area is relative so we can place anchor divs inside */}
      <div className="relative grid grid-cols-[1fr_320px]">
        {/* LEFT: Game board area */}
        <div className="relative">
          <GameBoard />
          {/* Invisible anchor for RM on the left */}
          <div id="rm-anchor" className="absolute left-6 top-20 w-4 h-4" />
        </div>

        {/* RIGHT: side column */}
        <div className="relative flex flex-col">
          <AgentConsole />
          <div className="border-t border-neutral-800">
            <PlannerPanel />
          </div>
          <div className="border-t border-neutral-800">
            <ItemsPanel />
          </div>

          {/* Invisible anchor for FG on the right */}
          <div id="fg-anchor" className="absolute right-6 top-20 w-4 h-4" />
        </div>
      </div>

      <EventFeed />

      {/* The arrow overlay (full-screen, pointer-events: none) */}
      <FlowCanvas anchors={anchors} flows={flows} />
    </div>
  );
}
