import { useQuery } from "@tanstack/react-query";
import { apiGetBE } from "../lib/api";

type Item = {
  id: number;
  sku: string;
  name: string;
  on_hand: number;
  reorder_point: number;
};

export default function ItemsPanel() {
  const { data, isLoading, isError, error } = useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: () => apiGetBE("/items"),
    staleTime: 5_000, // feel snappy but not too chatty
  });

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-zinc-400">Loading items…</div>
    );
  }
  if (isError) {
    return (
      <div className="p-4 text-sm text-red-400">
        Failed to load items: {(error as Error)?.message}
      </div>
    );
  }

  const items = data ?? [];

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold tracking-wide text-zinc-200 mb-3">
        Items (live from backend)
      </h3>
      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/50">
            <tr className="text-zinc-400">
              <th className="text-left px-3 py-2">SKU</th>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-right px-3 py-2">On Hand</th>
              <th className="text-right px-3 py-2">Reorder Pt.</th>
              <th className="text-right px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const below = it.on_hand <= it.reorder_point;
              return (
                <tr
                  key={it.id}
                  className="border-t border-zinc-800 hover:bg-zinc-900/30"
                >
                  <td className="px-3 py-2 font-mono">{it.sku}</td>
                  <td className="px-3 py-2">{it.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{it.on_hand}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{it.reorder_point}</td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className={
                        "inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full " +
                        (below
                          ? "bg-amber-500/10 text-amber-300 border border-amber-600/40"
                          : "bg-emerald-500/10 text-emerald-300 border border-emerald-600/40")
                      }
                    >
                      <span className="size-1.5 rounded-full bg-current"></span>
                      {below ? "Reorder soon" : "Healthy"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-zinc-500" colSpan={5}>
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
