import React, { lazy } from 'react';
import { Permission } from './permissions';
import type { PermissionId } from './permissions';

export interface DashboardWidgetConfig {
  id: string;
  component: React.ComponentType;
  requiredPermission: PermissionId;
  priority: number;
  lazy: boolean;
  skeleton?: React.ComponentType;
  errorFallback?: React.ComponentType<{ error: Error }>;
  refreshInterval?: number; // In milliseconds
  colSpan: {
    sm: string;
    lg: string;
  };
}

// Lazy load all widget components
const ExecutiveGreetingWidget = lazy(() => import('../../routes/admin/dashboard/widgets/ExecutiveGreetingWidget'));
const FinanceKpiWidget = lazy(() => import('../../routes/admin/dashboard/widgets/FinanceKpiWidget'));
const CrmKpiWidget = lazy(() => import('../../routes/admin/dashboard/widgets/CrmKpiWidget'));
const ScoutAiKpiWidget = lazy(() => import('../../routes/admin/dashboard/widgets/ScoutAiKpiWidget'));
const DeliveryKpiWidget = lazy(() => import('../../routes/admin/dashboard/widgets/DeliveryKpiWidget'));
const TopProjectsWidget = lazy(() => import('../../routes/admin/dashboard/widgets/TopProjectsWidget'));
const OperationsHealthWidget = lazy(() => import('../../routes/admin/dashboard/widgets/OperationsHealthWidget'));
const TimelineWidget = lazy(() => import('../../routes/admin/dashboard/widgets/TimelineWidget'));

// Default skeleton (can be customized per widget)
const DefaultSkeleton: React.FC = () => (
  <div className="w-full h-full min-h-[120px] rounded-2xl bg-white/50 animate-pulse border border-[#0B3027]/5" />
);

export const DASHBOARD_WIDGETS: DashboardWidgetConfig[] = [
  {
    id: 'executive-greeting',
    component: ExecutiveGreetingWidget,
    requiredPermission: Permission.DASHBOARD_READ,
    priority: 1,
    lazy: true,
    skeleton: DefaultSkeleton,
    colSpan: { sm: 'sm:col-span-12', lg: 'lg:col-span-12' },
  },
  {
    id: 'finance-kpi',
    component: FinanceKpiWidget,
    requiredPermission: Permission.ANALYTICS_FINANCE,
    priority: 2,
    lazy: true,
    skeleton: DefaultSkeleton,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    colSpan: { sm: 'sm:col-span-6', lg: 'lg:col-span-3' },
  },
  {
    id: 'crm-kpi',
    component: CrmKpiWidget,
    requiredPermission: Permission.CRM_READ,
    priority: 3,
    lazy: true,
    skeleton: DefaultSkeleton,
    refreshInterval: 30 * 1000, // 30 seconds
    colSpan: { sm: 'sm:col-span-6', lg: 'lg:col-span-3' },
  },
  {
    id: 'scout-ai-kpi',
    component: ScoutAiKpiWidget,
    requiredPermission: Permission.AI_READ,
    priority: 4,
    lazy: true,
    skeleton: DefaultSkeleton,
    refreshInterval: 15 * 1000, // 15 seconds
    colSpan: { sm: 'sm:col-span-6', lg: 'lg:col-span-3' },
  },
  {
    id: 'delivery-kpi',
    component: DeliveryKpiWidget,
    requiredPermission: Permission.WORKSPACE_READ,
    priority: 5,
    lazy: true,
    skeleton: DefaultSkeleton,
    refreshInterval: 60 * 1000, // 1 minute
    colSpan: { sm: 'sm:col-span-6', lg: 'lg:col-span-3' },
  },
  {
    id: 'top-projects',
    component: TopProjectsWidget,
    requiredPermission: Permission.PROJECT_READ,
    priority: 6,
    lazy: true,
    skeleton: DefaultSkeleton,
    colSpan: { sm: 'sm:col-span-12', lg: 'lg:col-span-8' },
  },
  {
    id: 'operations-health',
    component: OperationsHealthWidget,
    requiredPermission: Permission.SYSTEM_AUDIT,
    priority: 7,
    lazy: true,
    skeleton: DefaultSkeleton,
    colSpan: { sm: 'sm:col-span-12', lg: 'lg:col-span-8' },
  },
  {
    id: 'timeline',
    component: TimelineWidget,
    requiredPermission: Permission.DASHBOARD_READ,
    priority: 8,
    lazy: true,
    skeleton: DefaultSkeleton,
    colSpan: { sm: 'sm:col-span-12', lg: 'lg:col-span-4' },
  },
];

