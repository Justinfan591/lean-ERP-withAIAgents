import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPostBE } from "../lib/api";
import type { Summary } from "../types";
import { Play, FastForward } from "lucide-react";
import { useState, useEffect } from "react";

export default function TopBar() {
  const qc = useQueryClient();
  const { data } = useQuery<Summary>({ queryKey: ["summary"], queryFn: () => apiGet("/state/summary") });

  const { mutate: step, isPending } = useMutation({
    mutationFn: () => apiPostBE("/sim/tick"), // <- now hitting backend
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["summary"] }); // still mocked
      qc.invalidateQueries({ queryKey: ["events"] });  // still mocked
      qc.invalidateQueries({ queryKey: ["items"] });   // refresh items list
    },
  });
  

  const [auto, setAuto] = useState(false);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => step(), 1200);
    return () => clearInterval(id);
  }, [auto]);

  return (
    <div className="w-full flex items-center justify-between px-4 py-3 bg-neutral-900/70 border-b border-neutral-800">
      <div className="text-lg font-semibold">Lean AI-ERP — Day {data?.day ?? "…"}</div>
      <div className="flex items-center gap-6">
        <div className="text-sm text-neutral-400">OTIF <span className="text-neutral-100 font-medium">{(data?.otif ?? 0).toFixed(2)}</span></div>
        <div className="text-sm text-neutral-400">Stockouts <span className="text-red-400 font-medium">{data?.stockouts ?? 0}</span></div>
        <div className="flex gap-2">
          <button onClick={() => step()} disabled={isPending} className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 flex items-center gap-2">
            <Play size={16}/> Step
          </button>
          <button onClick={() => setAuto(v => !v)} className={"px-3 py-1.5 rounded-xl border flex items-center gap-2 " + (auto ? "bg-neutral-700 border-neutral-600" : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700")}>
            <FastForward size={16}/> {auto ? "Stop" : "Auto"}
          </button>
        </div>
      </div>
    </div>
  );
}
