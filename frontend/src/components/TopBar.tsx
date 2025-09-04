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
    <div className="w-full flex items-center justify-between px-4 py-3 bg-neutral-900/70 border-b border-neutral-800">
      <div className="text-lg font-semibold">
        Lean AI-ERP — Day {simDay?.day ?? summary?.day ?? "…"}
      </div>
      <div className="flex items-center gap-6">
        <div className="text-sm text-neutral-400">
          OTIF{" "}
          <span className="text-neutral-100 font-medium">
            {(summary?.otif ?? 0).toFixed(2)}
          </span>
        </div>
        <div className="text-sm text-neutral-400">
          Stockouts{" "}
          <span className="text-red-400 font-medium">
            {summary?.stockouts ?? 0}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              // Optional: pre-animate for instant feedback, even before server responds
              animateDayTick();
              step();
            }}
            disabled={isPending}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 flex items-center gap-2 disabled:opacity-60"
          >
            <Play size={16} /> Step
          </button>
          <button
            onClick={() => setAuto(v => !v)}
            className={
              "px-3 py-1.5 rounded-xl border flex items-center gap-2 " +
              (auto
                ? "bg-neutral-700 border-neutral-600"
                : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700")
            }
          >
            <FastForward size={16} /> {auto ? "Stop" : "Auto"}
          </button>
        </div>
      </div>
    </div>
  );
}
