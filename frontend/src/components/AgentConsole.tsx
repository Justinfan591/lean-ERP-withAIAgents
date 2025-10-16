import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../lib/api";
import type { PlannerProposal } from "../types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function AgentConsole() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data } = useQuery<PlannerProposal[]>({
    queryKey: ["planner","proposals"],
    queryFn: () => apiGet("/agents/planner/proposals")
  });

  const hasProposals = data && data.length > 0;

  return (
    <div className="rounded-xl border border-neutral-800/50 bg-gradient-to-br from-neutral-900/80 to-neutral-900/60 backdrop-blur-sm overflow-hidden">
      {/* Compact Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-neutral-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-4 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
          <h3 className="text-sm font-semibold text-white">Agent Console</h3>
          {hasProposals && (
            <span className="text-xs bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full">
              {data.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-xs text-cyan-400">Active</span>
          </div>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-neutral-800/50 max-h-64 overflow-y-auto">
          {hasProposals ? (
            <div className="p-3 space-y-2">
              {data.map((p) => (
                <div 
                  key={p.id} 
                  className="rounded-lg border border-neutral-800/50 bg-neutral-900/40 p-2.5 hover:border-cyan-500/30 transition-all duration-200"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white truncate">
                          PO Request
                        </div>
                        <div className="text-xs text-cyan-300 font-mono">
                          Item #{p.item_id} • Qty: {p.qty}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-neutral-400 line-clamp-2">
                      {p.reason}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      (View proposals in AI Planner panel)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <div className="text-neutral-500 text-xs">No active tasks</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
