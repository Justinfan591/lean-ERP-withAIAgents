import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../lib/api";
import type { EventRow } from "../types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function EventFeed() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data } = useQuery<EventRow[]>({
    queryKey: ["events"],
    queryFn: () => apiGet("/events"),
    refetchInterval: 2000,
  });

  const eventCount = (data ?? []).length;

  return (
    <div className="mt-3 rounded-xl border border-neutral-800/50 bg-gradient-to-br from-neutral-900/80 to-neutral-900/60 backdrop-blur-sm overflow-hidden">
      {/* Compact Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-neutral-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-4 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
          <h3 className="text-sm font-semibold text-white">Event Feed</h3>
          {eventCount > 0 && (
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full">
              {eventCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs text-emerald-400">Live</span>
          </div>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-neutral-800/50 max-h-48 overflow-y-auto">
          <div className="p-2 space-y-1">
            {eventCount === 0 ? (
              <div className="text-center py-6 text-neutral-500 text-xs">
                No events yet
              </div>
            ) : (
              (data ?? []).map((ev) => (
                <div 
                  key={ev.id} 
                  className="flex items-start gap-1.5 px-2 py-1 rounded hover:bg-neutral-800/40 transition-colors"
                >
                  <div className="flex-shrink-0 w-0.5 h-0.5 rounded-full bg-emerald-400 mt-1.5"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[10px] text-neutral-500 font-mono flex-shrink-0">
                        {new Date(ev.ts).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="text-xs text-neutral-300 leading-tight">
                        {ev.text}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
