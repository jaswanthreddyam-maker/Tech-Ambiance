import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { ceoDashboardRepository } from '../../../../repositories/ceoDashboardRepository';

const TimelineWidget: React.FC = () => {
  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => {
    ceoDashboardRepository.getStudioTimeline().then(setTimeline);
    const channel = ceoDashboardRepository.initializeRealtime({
      onTimelineUpdate: (newEvent) => setTimeline(prev => [newEvent, ...prev].slice(0, 10))
    });
    return () => {
      if (channel) ceoDashboardRepository.disposeRealtime(channel);
    };
  }, []);

  return (
    <div className="h-full p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)]">
      <div className="flex items-center justify-between pb-5 border-b border-[#0B3027]/10 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0B3027] text-[#F8F6F1]">
            <Terminal className="w-4 h-4 text-[#C9A56A]" />
          </div>
          <div>
            <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">
              Global Studio Timeline
            </h2>
            <p className="text-xs text-[#0B3027]/60">
              Real-time domain events (`studio_activity_projection`)
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-[#9A7B4F] bg-[#C9A56A]/15 px-3 py-1.5 rounded-full border border-[#C9A56A]/30 font-semibold">
          CQRS Feed Active
        </span>
      </div>

      <div className="space-y-6">
        {timeline.length === 0 ? (
          <div className="text-sm font-mono text-[#0B3027]/50 text-center py-6">No events processed yet.</div>
        ) : (
          timeline.map((event, idx) => (
            <div key={event.id || idx} className="flex items-start gap-4 group">
              <div className="relative flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 shadow-sm mt-1.5 ${
                  event.severity === 'WARNING' ? 'bg-amber-500 border-amber-700' : 
                  event.severity === 'ERROR' ? 'bg-red-500 border-red-700' : 'bg-[#0B3027] border-[#C9A56A]'
                }`} />
                {idx < timeline.length - 1 && (
                  <div className="w-0.5 h-14 bg-[#0B3027]/15 mt-1" />
                )}
              </div>
              <div className="flex-1 pb-5 border-b border-[#0B3027]/8 group-last:border-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#0B3027]">
                    {event.event_type}
                  </span>
                  <span className="text-xs text-[#0B3027]/50 font-mono">
                    {new Date(event.created_at || event.event_timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-[#0B3027]/75 mt-1 leading-relaxed">
                  {event.description}
                </p>
                <div className="flex items-center gap-2.5 mt-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#0B3027]/10 text-[#0B3027]">
                    {event.tag || event.source_context}
                  </span>
                  {event.actor_name && (
                    <span className="text-[10px] font-mono font-bold text-[#0B3027]/40">
                      By {event.actor_name}
                    </span>
                  )}
                  {event.organization_name && (
                     <span className="text-[10px] font-mono font-bold text-[#0B3027]/40">
                      • {event.organization_name}
                     </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

TimelineWidget.displayName = 'TimelineWidget';
export default TimelineWidget;
