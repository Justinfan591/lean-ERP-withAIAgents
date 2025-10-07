import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetBE, apiPostBE } from "../lib/api";
import { flashFlow } from "../lib/flowBus";

type Movement = {
  ts: string;
  move_type: "IN" | "OUT" | "ADJUST";
  qty: number;
  note: string;
};

export default function ItemDrawer({
  itemId,
  onClose,
}: {
  itemId: number | null;
  onClose: () => void;
}) {
  const open = itemId !== null;
  const qc = useQueryClient();

  // Fetch when open
  const { data = [], isLoading, isError } = useQuery<Movement[]>({
    queryKey: ["movements", itemId],
    queryFn: () => apiGetBE(`/items/${itemId}/movements?days=60`),
    enabled: open && itemId !== null,
  });

  // Create movement (IN/OUT) then refresh both items + movements
  const createMove = useMutation({
    mutationFn: (vars: { move_type: "IN" | "OUT"; qty: number; note: string }) =>
      apiPostBE(`/items/${itemId}/movements`, vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["movements", itemId] });
    // simple rule: if it's an OUT on RM item -> RM->FG flow; if IN on FG -> FG->RM (choose what fits your logic)
  // Start simple: always flash RM->FG
  flashFlow("RM", "FG");
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-neutral-950 border-l border-neutral-800/50 shadow-2xl backdrop-blur-xl z-[100] animate-slide-in">
      {/* Header with gradient */}
      <div className="relative px-6 py-4 border-b border-neutral-800/50 bg-gradient-to-r from-neutral-900/80 to-neutral-900/60">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-lg text-white flex items-center gap-2">
              <span className="text-blue-400">Item #{itemId}</span>
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">Movement History</div>
          </div>
          <button
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded-lg border border-neutral-700/50 hover:bg-neutral-800/80 hover:border-neutral-600 transition-all duration-200 font-medium"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Action bar */}
      <div className="px-6 py-4 border-b border-neutral-800/50 bg-neutral-900/40">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          Quick Actions
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              createMove.mutate({
                move_type: "IN",
                qty: 10,
                note: "Received shipment",
              })
            }
            disabled={createMove.isPending}
            className="flex-1 text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600/80 to-emerald-500/80 hover:from-emerald-500 hover:to-emerald-400 border border-emerald-400/30 text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20 transition-all duration-200 disabled:opacity-50"
          >
            +10 IN
          </button>
          <button
            onClick={() =>
              createMove.mutate({
                move_type: "OUT",
                qty: 5,
                note: "Consumed in assembly",
              })
            }
            disabled={createMove.isPending}
            className="flex-1 text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600/80 to-amber-500/80 hover:from-amber-500 hover:to-amber-400 border border-amber-400/30 text-white shadow-sm hover:shadow-md hover:shadow-amber-500/20 transition-all duration-200 disabled:opacity-50"
          >
            -5 OUT
          </button>
        </div>
        {createMove.isPending && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-2">
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Saving movement…
          </div>
        )}
      </div>

      {/* Movements list */}
      <div className="p-6 space-y-3 overflow-auto h-[calc(100%-140px)]">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Loading movements…
          </div>
        )}
        {isError && (
          <div className="rounded-xl border border-red-800/50 bg-red-900/20 p-4 text-center">
            <div className="text-sm text-red-400">Failed to load movements</div>
          </div>
        )}
        {!isLoading && data.length === 0 && (
          <div className="rounded-xl border border-neutral-800/50 bg-neutral-900/60 p-8 text-center">
            <div className="text-neutral-400 text-sm">No movements in range</div>
            <div className="text-neutral-600 text-xs mt-1">Create your first movement above</div>
          </div>
        )}
        {data.map((m, i) => {
          const isIn = m.move_type === "IN";
          const isOut = m.move_type === "OUT";
          
          return (
            <div
              key={i}
              className="group relative rounded-xl border border-neutral-800/50 bg-gradient-to-br from-neutral-900/80 to-neutral-900/60 p-4 hover:border-neutral-700/50 transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {/* Type indicator */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ 
                  color: isIn ? '#10b981' : isOut ? '#f59e0b' : '#06b6d4' 
                }}
              ></div>
              
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-neutral-500 font-mono mb-1">
                    {new Date(m.ts).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="text-sm text-neutral-300">
                    {m.note}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div
                    className={
                      "text-sm font-bold font-mono px-3 py-1.5 rounded-lg " +
                      (isIn
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : isOut
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        : "bg-sky-500/15 text-sky-300 border border-sky-500/30")
                    }
                  >
                    {isIn ? '+' : isOut ? '-' : ''}{m.qty}
                  </div>
                  <div className="text-xs text-neutral-500 text-center mt-1 font-medium">
                    {m.move_type}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
