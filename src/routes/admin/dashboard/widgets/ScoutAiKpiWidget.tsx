import React from 'react';
import { Sparkles } from 'lucide-react';

const ScoutAiKpiWidget: React.FC = () => {
  return (
    <div className="h-full p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] transition-all">
      <div className="flex items-center justify-between text-xs text-[#9A7B4F] font-mono uppercase tracking-wider font-bold">
        <span>SCOUT AI TELEMETRY</span>
        <Sparkles className="w-4 h-4 text-[#C9A56A]" />
      </div>
      <div className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#0B3027]/40 mt-3 italic">
        UNAVAILABLE
      </div>
      <div className="text-[10px] font-mono text-[#0B3027]/50 mt-3 pt-3 border-t border-[#0B3027]/5 font-bold uppercase tracking-widest">
        Awaiting Worker Node Sync
      </div>
    </div>
  );
};

ScoutAiKpiWidget.displayName = 'ScoutAiKpiWidget';
export default ScoutAiKpiWidget;
