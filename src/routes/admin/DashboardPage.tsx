import React, { Suspense } from 'react';
import { DASHBOARD_WIDGETS } from '../../auth/registry/widgets';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { WidgetErrorBoundary } from '../../components/admin/WidgetErrorBoundary';
import type { DashboardWidgetConfig } from '../../auth/registry/widgets';

export const DashboardPage: React.FC = () => {
  const { can } = usePermissions();

  // 1. Filter widgets strictly by permission
  // 2. Sort widgets by priority
  const sortedWidgets = DASHBOARD_WIDGETS
    .filter((widget: DashboardWidgetConfig) => can(widget.requiredPermission))
    .sort((a: DashboardWidgetConfig, b: DashboardWidgetConfig) => a.priority - b.priority);

  return (
    <div className="animate-in fade-in duration-300">
      {/* 
        Adaptive Dashboard Registry Engine:
        CSS Grid auto-placement handles the layout dynamically.
        12-column grid system allows fractional spans (3=25%, 4=33%, 6=50%, 8=66%, 12=100%).
      */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 auto-rows-max">
        {sortedWidgets.map((widget: DashboardWidgetConfig) => {
          const WidgetComponent = widget.component;
          const Skeleton = widget.skeleton || (() => <div className="animate-pulse bg-white/50 w-full h-full min-h-[120px] rounded-2xl" />);

          return (
            <div 
              key={widget.id} 
              className={`${widget.colSpan.sm} ${widget.colSpan.lg} flex flex-col`}
            >
              <WidgetErrorBoundary fallback={widget.errorFallback}>
                <Suspense fallback={<Skeleton />}>
                  <WidgetComponent />
                </Suspense>
              </WidgetErrorBoundary>
            </div>
          );
        })}
      </div>

      {sortedWidgets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4 opacity-50">🗂️</div>
          <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">
            Your Dashboard is Empty
          </h2>
          <p className="text-sm text-[#0B3027]/60 mt-2 max-w-sm">
            You do not have any widget permissions assigned to your role. Contact an administrator to adjust your permissions.
          </p>
        </div>
      )}
    </div>
  );
};
