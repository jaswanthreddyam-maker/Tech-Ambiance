import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { ceoDashboardRepository } from '../../../../repositories/ceoDashboardRepository';

const FinanceKpiWidget: React.FC = () => {
  const [finance, setFinance] = useState<any>(null);

  useEffect(() => {
    ceoDashboardRepository.getFinanceMetrics().then(setFinance);
    const channel = ceoDashboardRepository.initializeRealtime({
      onFinanceUpdate: setFinance,
    });
    return () => {
      if (channel) ceoDashboardRepository.disposeRealtime(channel);
    };
  }, []);

  return (
    <div className="h-full p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] transition-all">
      <div className="flex items-center justify-between text-xs text-[#9A7B4F] font-mono uppercase tracking-wider font-bold">
        <span>MONTHLY REVENUE (USD)</span>
        <DollarSign className="w-4 h-4 text-[#C9A56A]" />
      </div>
      <div className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027] mt-3">
        {finance ? `$${finance.monthly_revenue?.toLocaleString() || 0}` : '---'}
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#0B3027]/5">
        <div className="text-[10px] font-mono font-bold text-[#0B3027]/60">
          COLLECTED: <span className="text-[#0B3027]">${finance?.cash_collected_this_month?.toLocaleString() || 0}</span>
        </div>
        <div className="text-[10px] font-mono font-bold text-amber-700">
          OVERDUE: {finance?.overdue_invoice_count || 0}
        </div>
      </div>
    </div>
  );
};

FinanceKpiWidget.displayName = 'FinanceKpiWidget';
export default FinanceKpiWidget;
