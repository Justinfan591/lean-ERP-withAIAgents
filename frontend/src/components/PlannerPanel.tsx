import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../lib/api";
import type { PurchaseOrder, Email } from "../types";
import { useState } from "react";
import BuyerAgentModal from "./BuyerAgentModal";

type Proposal = {
  id: string;
  type: "NEW_PO";
  item_id: number;
  qty: number;
  due_day: number;
  reason: string;
};

export default function PlannerPanel() {
  const qc = useQueryClient();
  const [buyerResult, setBuyerResult] = useState<{ po: PurchaseOrder; email: Email } | null>(null);
  
  const { data = [], isLoading } = useQuery<Proposal[]>({
    queryKey: ["proposals"],
    queryFn: () => {
      console.log("📋 PlannerPanel: Fetching proposals...");
      return apiGet("/agents/planner/proposals");
    },
    refetchInterval: 10_000,
  });

  console.log("📊 PlannerPanel: Proposals data:", data);

  const approveMutation = useMutation({
    mutationFn: (proposalId: string) => {
      console.log("🤖 Buyer Agent: Approving proposal", proposalId);
      return apiPost("/agents/buyer/approve", { proposal_id: proposalId });
    },
    onSuccess: (result) => {
      console.log("✅ Buyer Agent: Success!", result);
      setBuyerResult(result as { po: PurchaseOrder; email: Email });
      qc.invalidateQueries({ queryKey: ["proposals"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      console.error("❌ Buyer Agent: Error", error);
    },
  });

  if (isLoading) return (
    <div className="p-3">
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        Loading…
      </div>
    </div>
  );

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
          <div className="w-0.5 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          AI Planner
        </h3>
        {data.length > 0 && (
          <span className="text-[10px] font-semibold bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full border border-purple-500/30">
            {data.length}
          </span>
        )}
      </div>
      
      {data.length === 0 && (
        <div className="rounded-xl border border-neutral-800/50 bg-neutral-900/60 p-4 text-center">
          <div className="text-neutral-400 text-xs">No proposals</div>
          <div className="text-neutral-600 text-[10px] mt-0.5">AI monitoring</div>
        </div>
      )}
      
      <div className="space-y-2">
        {data.map((pr, idx) => (
          <div 
            key={pr.id} 
            className="group relative rounded-lg border border-neutral-800/50 bg-gradient-to-br from-neutral-900/80 to-neutral-900/60 p-2.5 hover:border-purple-500/30 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Content */}
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-xs">
                    <span>PO Request - Item #{pr.item_id}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-2">
                    {pr.reason}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 flex-shrink-0">
                  <span className="text-[10px] text-purple-400 font-medium">Qty:</span>
                  <span className="text-xs font-bold text-purple-200">{pr.qty}</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={() => approveMutation.mutate(pr.id)}
                  disabled={approveMutation.isPending}
                  className="flex-1 text-[10px] font-medium px-2 py-1 rounded bg-emerald-600/70 hover:bg-emerald-500/70 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {approveMutation.isPending ? "..." : "✓ Approve"}
                </button>
                <button
                  disabled={approveMutation.isPending}
                  className="flex-1 text-[10px] font-medium px-2 py-1 rounded bg-neutral-800/70 hover:bg-neutral-700/70 text-neutral-300 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Buyer Agent Modal */}
      {buyerResult && (
        <BuyerAgentModal
          po={buyerResult.po}
          email={buyerResult.email}
          onClose={() => setBuyerResult(null)}
        />
      )}
    </div>
  );
}
