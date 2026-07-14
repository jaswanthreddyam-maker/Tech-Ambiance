import React, { useState, useEffect } from 'react';
import { ceoDashboardRepository } from '../../../../repositories/ceoDashboardRepository';

const OperationsHealthWidget: React.FC = () => {
  const [health, setHealth] = useState<any[]>([]);

  useEffect(() => {
    ceoDashboardRepository.getOperationsHealth().then(setHealth);
  }, []);

  return (
    <div className="h-full p-7 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] flex flex-col justify-between">
      <div>
        <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027] mb-4">
          Operations Health
        </h3>
        <div className="space-y-3 text-xs">
          {health.length === 0 ? (
            <div className="text-sm font-mono text-[#0B3027]/50 text-center py-2">Loading...</div>
          ) : health.map(h => (
            <div key={h.context_name} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/8">
              <div>
                <div className="text-[#0B3027] font-semibold">{h.context_name}</div>
                <div className="text-[9px] font-mono text-[#0B3027]/50 mt-1">
                  {h.outbox_lag > 0 ? `Lag: ${h.outbox_lag}` : 'Lag: 0'}
                </div>
              </div>
              <span className={`font-mono font-bold ${
                h.status === 'HEALTHY' ? 'text-emerald-700' :
                h.status === 'WARNING' ? 'text-amber-600' : 'text-red-600'
              }`}>{h.status}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* We can include the static CMS rollback card inside the Operations column as well, or separate it out. We will keep it here to match existing layout. */}
      <div className="mt-6 p-7 rounded-3xl bg-[#0B3027] text-[#F8F6F1] border border-[#C9A56A]/30 shadow-xl">
        <div className="flex items-center gap-2 text-[#C9A56A] font-semibold text-xs uppercase tracking-wider mb-2">
          <span>Website Engine (CMS)</span>
        </div>
        <h4 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#F8F6F1]">
          1-Click Version Rollback Ready
        </h4>
        <p className="text-xs text-[#F8F6F1]/80 mt-2 leading-relaxed">
          Every content change creates an immutable schema snapshot (`v1`, `v2`). Inspect line-by-line diffs before edge deployment.
        </p>
      </div>
    </div>
  );
};

OperationsHealthWidget.displayName = 'OperationsHealthWidget';
export default OperationsHealthWidget;
