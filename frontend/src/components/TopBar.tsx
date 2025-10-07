// src/components/TopBar.tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiGetBE, apiPostBE } from "../lib/api";
import type { Summary } from "../types";
import { Play, FastForward } from "lucide-react";
import { useState, useEffect } from "react";
import { pulseFlow } from "../lib/flowBus"; // <-- add this

export default function TopBar() {
  const qc = useQueryClient();

  // Mocked summary (unchanged, still via MSW)
  const { data: summary } = useQuery<Summary>({
    queryKey: ["summary"],
    queryFn: () => apiGet("/state/summary"),
  });

  // NEW: live day from real backend
  const { data: simDay } = useQuery<{ day: number }>({
    queryKey: ["sim-day"],
    queryFn: () => apiGetBE("/sim/day"),
  });

  // Helper: animate impulses for a "day tick"
  const animateDayTick = () => {
    // Feel free to tune these to match your sim volume
    pulseFlow("SUP","WH", { kind:"order", qty:12, count:3, gapMs:90, durationMs:800 });
    pulseFlow("WH", "CUST", { kind:"order", qty:12, count:3, gapMs:90, durationMs:800 });
    // optional acknowledgements/returns:
    pulseFlow("CUST", "WH",  { kind:"order", qty:12, count:3, gapMs:90, durationMs:800 });
    pulseFlow("WH", "SUP",   { kind:"order", qty:12, count:3, gapMs:90, durationMs:800 });
  };

  // Step now hits real backend; also refresh live day + items
  const { mutate: step, isPending } = useMutation({
    mutationFn: () => apiPostBE("/sim/tick"),
    onSuccess: () => {
      // Kick the visuals on success (keeps UI in sync with server state)
      animateDayTick();

      // refresh caches
      qc.invalidateQueries({ queryKey: ["summary"] }); // mocked still ok
      qc.invalidateQueries({ queryKey: ["events"] });  // mocked
      qc.invalidateQueries({ queryKey: ["items"] });   // live items refresh
      qc.invalidateQueries({ queryKey: ["sim-day"] }); // live day refresh
    },
  });

  // Optional: auto tick
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      // Fire the mutation; onSuccess will animate + invalidate
      step();
    }, 1200);
    return () => clearInterval(id);
  }, [auto, step]);

  return (
    <div className="w-full flex items-center justify-between px-6 py-4 glass border-b border-neutral-800/50 backdrop-blur-xl sticky top-0 z-50">
      {/* Left: Title with gradient accent */}
      <div className="flex items-center gap-4">
        <div className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
          Lean AI-ERP
        </div>
        <div className="h-6 w-px bg-neutral-700"></div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
          <span className="text-sm font-semibold text-blue-100">Day {simDay?.day ?? summary?.day ?? "…"}</span>
        </div>
      </div>

      {/* Right: Metrics and Controls */}
      <div className="flex items-center gap-6">
        {/* Metrics */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider">OTIF</div>
            <div className="text-lg font-bold text-emerald-100">
              {(summary?.otif ?? 0).toFixed(2)}
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="text-xs font-medium text-red-400 uppercase tracking-wider">Stockouts</div>
            <div className="text-lg font-bold text-red-100">
              {summary?.stockouts ?? 0}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-neutral-700"></div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              animateDayTick();
              step();
            }}
            disabled={isPending}
            className="group relative px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border border-blue-400/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            <Play size={16} className="transition-transform group-hover:scale-110" />
            <span className="font-medium">Step</span>
          </button>
          <button
            onClick={() => setAuto(v => !v)}
            className={
              "relative px-4 py-2 rounded-lg border flex items-center gap-2 font-medium transition-all duration-200 " +
              (auto
                ? "bg-gradient-to-r from-purple-600 to-purple-500 border-purple-400/30 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30"
                : "bg-neutral-800/80 border-neutral-700/50 hover:bg-neutral-700/80 hover:border-neutral-600/50 hover:shadow-md")
            }
          >
            <FastForward size={16} className={auto ? "animate-pulse" : ""} />
            <span>{auto ? "Stop" : "Auto"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
