import { useQuery } from "@tanstack/react-query";
import { apiGetBE } from "../lib/api";
import { useState } from "react";
import ItemDrawer from "./ItemDrawer";

type Item = {
  id: number;
  sku: string;
  name: string;
  on_hand: number;
  reorder_point: number;
};

export default function ItemsPanel() {
  const { data = [], isLoading, isError, error } = useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: () => apiGetBE("/items"),
    staleTime: 5_000, // feel snappy but not too chatty
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (isLoading) {
    return <div className="p-4 text-sm text-zinc-400">Loading items…</div>;
  }
  if (isError) {
    return (
      <div className="p-4 text-sm text-red-400">
        Failed to load items: {(error as Error)?.message}
      </div>
    );
  }

  const items = data;

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
          <div className="w-0.5 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          Inventory Items
        </h3>
        <span className="text-[10px] text-neutral-400 bg-neutral-800/50 px-1.5 py-0.5 rounded-md">
          Live
        </span>
      </div>

      <div className="rounded-xl border border-neutral-800/50 bg-gradient-to-br from-neutral-900/80 to-neutral-900/60 backdrop-blur-sm overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-neutral-800/40 border-b border-neutral-700/50">
                <th className="text-left px-2 py-2 text-[10px] font-semibold text-neutral-300 uppercase tracking-wider">SKU</th>
                <th className="text-left px-2 py-2 text-[10px] font-semibold text-neutral-300 uppercase tracking-wider">Name</th>
                <th className="text-right px-2 py-2 text-[10px] font-semibold text-neutral-300 uppercase tracking-wider">Qty</th>
                <th className="text-right px-2 py-2 text-[10px] font-semibold text-neutral-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const below = it.on_hand <= it.reorder_point;
                return (
                  <tr
                    key={it.id}
                    className="border-t border-neutral-800/50 hover:bg-blue-500/5 cursor-pointer transition-colors duration-200 group"
                    onClick={() => setSelectedId(it.id)}
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <td className="px-2 py-2 font-mono text-blue-300 text-xs group-hover:text-blue-200">
                      {it.sku}
                    </td>
                    <td className="px-2 py-2 text-neutral-200 group-hover:text-white text-xs truncate">
                      {it.name}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums font-semibold text-neutral-100 text-xs">
                      {it.on_hand}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <span
                        className={
                          "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded transition-all duration-200 " +
                          (below
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30")
                        }
                      >
                        <span className={
                          "w-1 h-1 rounded-full " +
                          (below ? "bg-amber-400 animate-pulse" : "bg-emerald-400")
                        }></span>
                        {below ? "Low" : "OK"}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {items.length === 0 && (
                <tr>
                  <td className="px-2 py-6 text-center text-neutral-500 text-xs" colSpan={4}>
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer mounts here */}
      <ItemDrawer itemId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
