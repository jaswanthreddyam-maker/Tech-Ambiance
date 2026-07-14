import React from 'react';
import type { PermissionId } from './permissions';
import { Permission } from './permissions';

export interface AdminRouteConfig {
  path: string;
  requiredPermission: PermissionId;
  component: React.ComponentType;
  index?: boolean;
}

// Re-use lazy loading from App for components to avoid circular dependencies 
// or simply pass string identifiers if we want the registry pure data.
// Since App.tsx has the lazy components, we'll export the registry config without the actual Component type,
// or we can put the lazy loading here. For now, we'll move the lazy loading logic here to keep App.tsx clean.

const lazyNamed = <T extends React.ComponentType<any>>(
  importer: () => Promise<Record<string, T>>,
  exportName: string
) =>
  React.lazy(async () => {
    const module = await importer();
    return { default: module[exportName] };
  });

const DashboardPage = lazyNamed(() => import("../../routes/admin/DashboardPage"), "DashboardPage");
const WorkspacesPage = lazyNamed(() => import("../../routes/admin/WorkspacesPage"), "WorkspacesPage");
const CrmPipelinePage = lazyNamed(() => import("../../routes/admin/CrmPipelinePage"), "CrmPipelinePage");
const CmsEditorPage = lazyNamed(() => import("../../routes/admin/CmsEditorPage"), "CmsEditorPage");
const AiCenterPage = lazyNamed(() => import("../../routes/admin/AiCenterPage"), "AiCenterPage");
const MediaPage = lazyNamed(() => import("../../routes/admin/MediaPage"), "MediaPage");
const TimelinePage = lazyNamed(() => import("../../routes/admin/TimelinePage"), "TimelinePage");
const StudioTeamPage = lazyNamed(() => import("../../routes/admin/components/StudioTeamPage"), "StudioTeamPage");
const AdminPortfolioPage = lazyNamed(() => import("../../routes/admin/PortfolioPage.tsx"), "AdminPortfolioPage");

export const ADMIN_ROUTES: AdminRouteConfig[] = [
  { index: true, path: '', requiredPermission: Permission.DASHBOARD_READ, component: DashboardPage },
  { path: 'dashboard', requiredPermission: Permission.DASHBOARD_READ, component: DashboardPage },
  { path: 'timeline', requiredPermission: Permission.DASHBOARD_READ, component: TimelinePage },
  { path: 'workspaces', requiredPermission: Permission.WORKSPACE_READ, component: WorkspacesPage },
  { path: 'workspaces/:slug', requiredPermission: Permission.WORKSPACE_READ, component: WorkspacesPage },
  { path: 'crm', requiredPermission: Permission.CRM_READ, component: CrmPipelinePage },
  { path: 'portfolio', requiredPermission: Permission.PORTFOLIO_READ, component: AdminPortfolioPage },
  { path: 'media', requiredPermission: Permission.MEDIA_READ, component: MediaPage },
  { path: 'cms', requiredPermission: Permission.CMS_READ, component: CmsEditorPage },
  { path: 'ai-center', requiredPermission: Permission.AI_READ, component: AiCenterPage },
  { path: 'settings', requiredPermission: Permission.SYSTEM_READ, component: StudioTeamPage },
];
