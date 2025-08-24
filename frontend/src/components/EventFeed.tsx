import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../lib/api";
import type { EventRow } from "../types";

export default function EventFeed() {
  const { data } = useQuery<EventRow[]>({
    queryKey: ["events"],
    queryFn: () => apiGet("/events"),
    refetchInterval: 2000,
  });

  return (
    <div className="h-28 overflow-y-auto border-t border-neutral-800 bg-neutral-900/50 px-4 py-2 text-sm">
      {(data ?? []).map(ev => (
        <div key={ev.id} className="text-neutral-300">
          <span className="text-neutral-500 mr-2">{new Date(ev.ts).toLocaleTimeString()}</span>
          {ev.text}
        </div>
      ))}
    </div>
  );
}
