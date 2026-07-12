import React, { useState, useEffect } from 'react';
import { ceoDashboardRepository } from '../../repositories/ceoDashboardRepository';
import type { StudioEventItem } from '../../types/studioHQ';

// Map projection row → UI type
const mapProjectionToEvent = (row: any): StudioEventItem => ({
  id: row.id,
  eventKey: row.event_type || 'system.event',
  title: row.description?.split('—')[0]?.trim() || row.event_type || 'Studio Event',
  description: row.description || '',
  timestampLabel: row.event_timestamp
    ? new Date(row.event_timestamp).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
      })
    : '',
  tag: row.tag || row.source_context || 'System',
});

export const TimelinePage: React.FC = () => {
  const [events, setEvents] = useState<StudioEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchTimeline = async () => {
      try {
        const data = await ceoDashboardRepository.getStudioTimeline();
        if (mounted) {
          setEvents(data.map(mapProjectionToEvent));
          setError(null);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load timeline.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchTimeline();

    // Subscribe to realtime inserts
    const channel = ceoDashboardRepository.initializeRealtime({
      onTimelineUpdate: (newRow: any) => {
        setEvents((prev) => [mapProjectionToEvent(newRow), ...prev]);
      },
    });

    return () => {
      mounted = false;
      if (channel) ceoDashboardRepository.disposeRealtime(channel);
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="pb-6 border-b border-[#0B3027]/10">
        <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027]">
          Global Studio Activity Feed
        </h1>
        <p className="text-sm text-[#0B3027]/70 mt-1">
          Immutable event stream powered by the Transactional Outbox Pattern.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#C9A56A] border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-sm text-[#0B3027]/60 font-medium">Loading activity stream…</span>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-sm text-red-600/80 font-medium">{error}</p>
          </div>
        )}

        {!isLoading && !error && events.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-[#0B3027]/50 font-medium">No studio events yet.</p>
            <p className="text-xs text-[#0B3027]/35 mt-1">
              Events will appear here as domain actions occur across StudioHQ.
            </p>
          </div>
        )}

        {!isLoading && events.map((event, idx) => (
          <div key={event.id} className="flex items-start gap-4 pb-6 border-b border-[#0B3027]/8 last:border-0 last:pb-0">
            <div className="relative flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-[#0B3027] border-2 border-[#C9A56A] mt-1.5 shrink-0 shadow-sm" />
              {idx < events.length - 1 && (
                <div className="w-0.5 h-12 bg-[#0B3027]/15 mt-1" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#0B3027]">{event.title}</span>
                <span className="text-xs text-[#0B3027]/50 font-mono">{event.timestampLabel}</span>
              </div>
              <p className="text-xs text-[#0B3027]/75 mt-1 leading-relaxed">{event.description}</p>
              <div className="flex items-center gap-2 mt-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#0B3027]/10 text-[#0B3027]">
                  {event.tag}
                </span>
                <span className="text-[10px] font-mono text-[#0B3027]/40">{event.eventKey}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
