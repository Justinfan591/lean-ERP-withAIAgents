import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../lib/api";
import type { PlannerProposal } from "../types";

export default function AgentConsole() {
  const { data } = useQuery<PlannerProposal[]>({
    queryKey: ["planner","proposals"],
    queryFn: () => apiGet("/agents/planner/proposals")
  });

  return (
    <div className="w-80 border-l border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
      <div className="text-sm font-semibold text-neutral-300">Agent Console — Planner</div>
      {data?.map(p => (
        <div key={p.id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
          <div className="text-neutral-200 text-sm mb-1">Place PO {p.qty} for item #{p.item_id} due D+{p.due_day}</div>
          <div className="text-neutral-400 text-xs mb-2">{p.reason}</div>
          <div className="flex gap-2">
            <button className="px-2 py-1 rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-xs">Approve</button>
            <button className="px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs">Reject</button>
          </div>
        </div>
      ))}
      {!data?.length && <div className="text-neutral-500 text-sm">No proposals.</div>}
    </div>
  );
}
