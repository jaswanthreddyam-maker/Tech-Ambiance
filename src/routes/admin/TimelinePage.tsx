import React from 'react';
import { MOCK_STUDIO_TIMELINE } from '../../mocks/studioHQ';

export const TimelinePage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="pb-6 border-b border-[#0B3027]/10">
        <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027]">
          Global Studio Activity Feed (`studio_events`)
        </h1>
        <p className="text-sm text-[#0B3027]/70 mt-1">
          Immutable event stream powered by the Transactional Outbox Pattern (`outbox_events`).
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] space-y-6">
        {MOCK_STUDIO_TIMELINE.map((event, idx) => (
          <div key={event.id} className="flex items-start gap-4 pb-6 border-b border-[#0B3027]/8 last:border-0 last:pb-0">
            <div className="relative flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-[#0B3027] border-2 border-[#C9A56A] mt-1.5 shrink-0 shadow-sm" />
              {idx < MOCK_STUDIO_TIMELINE.length - 1 && (
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
