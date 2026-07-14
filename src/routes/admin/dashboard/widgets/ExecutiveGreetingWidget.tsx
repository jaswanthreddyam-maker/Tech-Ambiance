import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ceoDashboardRepository } from '../../../../repositories/ceoDashboardRepository';
import { ActionButton } from '../../../../components/admin/ActionButton';

const ExecutiveGreetingWidget: React.FC = () => {
  const navigate = useNavigate();

  const handleExportReport = async () => {
    const csvContent = await ceoDashboardRepository.getExecutiveReport();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `executive-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
      <div>
        <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold tracking-tight text-[#0B3027]">
          Executive Read Model
        </h1>
        <p className="text-sm text-[#0B3027]/70 mt-1">
          CQRS real-time projections across Finance, Delivery, CRM, and Operations.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <ActionButton
          actionId="dashboard.export"
          onAction={handleExportReport}
          className="px-4 py-2.5 rounded-full bg-white hover:bg-white/90 border border-[#0B3027]/15 text-xs font-semibold text-[#0B3027] shadow-sm transition-all"
        >
          Export SOW Executive Report
        </ActionButton>
        
        <ActionButton
          actionId="workspace.provision"
          onAction={() => {
            navigate('/admin/workspaces', { state: { openProvisionWizard: true } });
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B3027] hover:bg-[#0E3A2F] text-white font-semibold text-xs shadow-[0_4px_16px_rgba(11,48,39,0.25)] transition-all"
        >
          <Plus className="w-4 h-4 text-[#C9A56A]" />
          <span>Provision Client Workspace</span>
        </ActionButton>
      </div>
    </div>
  );
};

ExecutiveGreetingWidget.displayName = 'ExecutiveGreetingWidget';
export default ExecutiveGreetingWidget;
