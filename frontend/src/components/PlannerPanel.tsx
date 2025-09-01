import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGetBE, apiPostBE } from "../lib/api";

type Proposal = {
  proposal_id: string;
  item_id: number;
  sku: string;
  name: string;
  suggested_qty: number;
  reason: string;
};

export default function PlannerPanel() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery<Proposal[]>({
    queryKey: ["proposals"],
    queryFn: () => apiGetBE("/agents/planner/proposals"),
    refetchInterval: 10_000, // light auto-refresh
  });

  const act = useMutation({
    mutationFn: (p: { action: "APPROVE" | "REJECT"; proposal: Proposal }) =>
      apiPostBE("/agents/planner/act", {
        action: p.action,
        item_id: p.proposal.item_id,
        qty: p.action === "APPROVE" ? p.proposal.suggested_qty : 0,
        proposal_id: p.proposal.proposal_id,
        sku: p.proposal.sku,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] });
      qc.invalidateQueries({ queryKey: ["events"] });   // if feed is real
      qc.invalidateQueries({ queryKey: ["items"] });     // proposals may change after POs
    },
  });

  if (isLoading) return <div className="p-3 text-sm text-neutral-400">Loading…</div>;

  return (
    <div className="p-3 space-y-2">
      <h3 className="text-sm font-semibold text-neutral-200">Planner Proposals</h3>
      {data.length === 0 && <div className="text-sm text-neutral-400">No proposals right now.</div>}
      {data.map((pr) => (
        <div key={pr.proposal_id} className="border border-neutral-800 rounded-xl p-3">
          <div className="text-sm font-medium">{pr.sku} — {pr.name}</div>
          <div className="text-xs text-neutral-400">Suggest: {pr.suggested_qty} (reason: {pr.reason})</div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => act.mutate({ action: "APPROVE", proposal: pr })}
              className="text-xs px-2 py-1 rounded border border-emerald-700/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200"
            >
              Approve
            </button>
            <button
              onClick={() => act.mutate({ action: "REJECT", proposal: pr })}
              className="text-xs px-2 py-1 rounded border border-amber-700/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
