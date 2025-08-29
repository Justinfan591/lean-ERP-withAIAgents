import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetBE, apiPostBE } from "../lib/api";

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
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[380px] bg-neutral-900 border-l border-neutral-800 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <div className="font-semibold">Item #{itemId} — Movements</div>
        <button
          onClick={onClose}
          className="text-sm px-2 py-1 rounded border border-neutral-700 hover:bg-neutral-800"
        >
          Close
        </button>
      </div>

      {/* Action bar */}
      <div className="px-3 py-2 border-b border-neutral-800 flex gap-2">
        <button
          onClick={() =>
            createMove.mutate({
              move_type: "IN",
              qty: 10,
              note: "Received shipment",
            })
          }
          className="text-sm px-3 py-1.5 rounded-lg border border-emerald-700/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200"
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
          className="text-sm px-3 py-1.5 rounded-lg border border-amber-700/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200"
        >
          -5 OUT
        </button>
        {createMove.isPending && (
          <span className="text-xs text-neutral-400 self-center">Saving…</span>
        )}
      </div>

      {/* Movements list */}
      <div className="p-3 space-y-2 overflow-auto h-[calc(100%-48px-42px)]">
        {isLoading && <div className="text-sm text-neutral-400">Loading…</div>}
        {isError && (
          <div className="text-sm text-red-400">Failed to load movements.</div>
        )}
        {!isLoading && data.length === 0 && (
          <div className="text-sm text-neutral-400">No movements in range.</div>
        )}
        {data.map((m, i) => (
          <div
            key={i}
            className="flex items-start justify-between border border-neutral-800 rounded-xl p-2"
          >
            <div className="text-sm">
              <div className="text-neutral-300">
                {new Date(m.ts).toLocaleString()}
              </div>
              <div className="text-neutral-400">{m.note}</div>
            </div>
            <div
              className={
                "text-sm font-mono " +
                (m.move_type === "IN"
                  ? "text-emerald-300"
                  : m.move_type === "OUT"
                  ? "text-amber-300"
                  : "text-sky-300")
              }
            >
              {m.move_type} {m.qty}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
