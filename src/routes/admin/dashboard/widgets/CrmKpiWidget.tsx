import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { ceoDashboardRepository } from '../../../../repositories/ceoDashboardRepository';

const CrmKpiWidget: React.FC = () => {
  const [crm, setCrm] = useState<any>(null);

  useEffect(() => {
    ceoDashboardRepository.getCrmMetrics().then(setCrm);
    const channel = ceoDashboardRepository.initializeRealtime({
      onCrmUpdate: setCrm,
    });
    return () => {
      if (channel) ceoDashboardRepository.disposeRealtime(channel);
    };
  }, []);

  return (
    <div className="h-full p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] transition-all">
      <div className="flex items-center justify-between text-xs text-[#9A7B4F] font-mono uppercase tracking-wider font-bold">
        <span>CRM PIPELINE VALUE</span>
        <TrendingUp className="w-4 h-4 text-[#C9A56A]" />
      </div>
      <div className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027] mt-3">
        {crm ? `$${crm.pipeline_value?.toLocaleString() || 0}` : '---'}
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#0B3027]/5">
          <div className="text-[10px] font-mono font-bold text-[#0B3027]/60">
          OPEN DEALS: <span className="text-[#0B3027]">{crm?.open_deals || 0}</span>
        </div>
          <div className="text-[10px] font-mono font-bold text-[#0B3027]/60">
          WON: <span className="text-emerald-700">{crm?.deals_won || 0}</span>
        </div>
      </div>
    </div>
  );
};

CrmKpiWidget.displayName = 'CrmKpiWidget';
export default CrmKpiWidget;
