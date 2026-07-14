import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle } from 'lucide-react';
import { ceoDashboardRepository } from '../../../../repositories/ceoDashboardRepository';

const DeliveryKpiWidget: React.FC = () => {
  const [delivery, setDelivery] = useState<any>(null);

  useEffect(() => {
    ceoDashboardRepository.getDeliveryMetrics().then(setDelivery);
    const channel = ceoDashboardRepository.initializeRealtime({
      onDeliveryUpdate: setDelivery,
    });
    return () => {
      if (channel) ceoDashboardRepository.disposeRealtime(channel);
    };
  }, []);

  return (
    <div className="h-full p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] transition-all">
      <div className="flex items-center justify-between text-xs text-[#9A7B4F] font-mono uppercase tracking-wider font-bold">
        <span>DELIVERY VELOCITY</span>
        <Activity className="w-4 h-4 text-[#C9A56A]" />
      </div>
      <div className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027] mt-3">
        {delivery ? `${delivery.average_milestone_completion_days || 0} Days` : '---'}
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#0B3027]/5">
        <div className="text-[10px] font-mono font-bold text-[#0B3027]/60">
          ACTIVE WS: <span className="text-[#0B3027]">{delivery?.active_workspaces || 0}</span>
        </div>
        {delivery?.projects_at_risk > 0 && (
          <div className="text-[10px] font-mono font-bold text-red-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {delivery.projects_at_risk} AT RISK
          </div>
        )}
      </div>
    </div>
  );
};

DeliveryKpiWidget.displayName = 'DeliveryKpiWidget';
export default DeliveryKpiWidget;
