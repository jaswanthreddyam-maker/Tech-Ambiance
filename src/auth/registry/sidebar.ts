import {
  LayoutDashboard,
  Clock,
  KanbanSquare,
  Globe,
  Sparkles,
  FolderKanban,
  ShieldCheck,
  Briefcase,
  Layers,
} from 'lucide-react';
import { Permission, type PermissionId } from './permissions';

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  requiredPermission: PermissionId;
  icon: React.ElementType;
}

export interface SidebarSectionConfig {
  id: string;
  title: string;
  items: SidebarItem[];
}

export const SIDEBAR_CONFIG: SidebarSectionConfig[] = [
  {
    id: 'executive-command',
    title: 'Executive Command',
    items: [
      { id: 'dashboard', label: 'CEO Dashboard', href: '/admin/dashboard', requiredPermission: Permission.DASHBOARD_READ, icon: LayoutDashboard },
      { id: 'timeline', label: 'Studio Timeline Feed', href: '/admin/timeline', requiredPermission: Permission.DASHBOARD_READ, icon: Clock },
    ]
  },
  {
    id: 'workspaces-engine',
    title: 'Workspaces Engine',
    items: [
      { id: 'workspaces', label: 'Client Workspaces', href: '/admin/workspaces', requiredPermission: Permission.WORKSPACE_READ, icon: Briefcase },
    ]
  },
  {
    id: 'agency-products',
    title: 'Agency Products',
    items: [
      { id: 'crm', label: 'Sales CRM Pipeline', href: '/admin/crm', requiredPermission: Permission.CRM_READ, icon: KanbanSquare },
      { id: 'cms', label: 'Website Engine (CMS)', href: '/admin/cms', requiredPermission: Permission.CMS_READ, icon: Globe },
      { id: 'ai-center', label: 'AI Center (ScoutAI)', href: '/admin/ai-center', requiredPermission: Permission.AI_READ, icon: Sparkles },
      { id: 'media', label: 'Universal Media Vault', href: '/admin/media', requiredPermission: Permission.MEDIA_READ, icon: FolderKanban },
      { id: 'portfolio', label: 'Portfolio Manager', href: '/admin/portfolio', requiredPermission: Permission.PORTFOLIO_READ, icon: Layers },
    ]
  },
  {
    id: 'core-platform',
    title: 'Core Platform',
    items: [
      { id: 'settings', label: '8-Role RBAC & Vaults', href: '/admin/settings', requiredPermission: Permission.SYSTEM_READ, icon: ShieldCheck },
    ]
  }
];
