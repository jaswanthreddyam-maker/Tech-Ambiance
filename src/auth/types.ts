import type { Session, User as SupabaseAuthUser } from "@supabase/supabase-js";
import type { PermissionId } from './registry/permissions';

export type AuthRoleName =
  | "OWNER"
  | "ADMIN"
  | "DEVELOPER"
  | "DESIGNER"
  | "PROJECT_MANAGER"
  | "STRATEGIST"
  | "SALES"
  | "CLIENT";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  active_organization_id?: string | null;
  active_workspace_id?: string | null;
  is_active?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  brand_color?: string;
  timezone?: string;
  currency?: string;
}

export interface Workspace {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "ARCHIVED" | "SUSPENDED";
  is_default: boolean;
}

export interface User {
  email: string;
  name: string;
  avatarUrl?: string;
  role: "client" | "admin" | "owner";
}

export interface Project {
  id: string;
  name: string;
  status: "Discovery" | "Design" | "Development" | "Testing" | "Launch" | "Complete";
  progress: number;
  startDate: string;
  deliveryDate: string;
  budget: string;
  activeMilestone: string;
  milestones: { id: string; name: string; date: string; status: "completed" | "active" | "pending" }[];
  invoices: { id: string; amount: string; date: string; status: "Paid" | "Pending" | "Overdue" }[];
  sourceCode?: string;
  demoUrl?: string;
  supportTickets: { id: string; subject: string; status: "Open" | "Resolved"; date: string }[];
}

export interface AuthContextState {
  session: Session | null;
  authUser: SupabaseAuthUser | null;
  profile: Profile | null;
  roles: AuthRoleName[];
  permissions: Set<PermissionId>;
  organization: Organization | null;
  workspace: Workspace | null;

  user: User | null;
  project: Project | null;

  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;

  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signup: (email: string, name: string, password: string, redirectTo?: string) => Promise<{ success: boolean; requiresVerification: boolean }>;
  loginWithGoogle: (redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  hasRole: (role: AuthRoleName | AuthRoleName[]) => boolean;
  hasPermission: (permission: PermissionId) => boolean;
  can: (permission: PermissionId) => boolean;
  canAny: (permissions: PermissionId[]) => boolean;
  canAll: (permissions: PermissionId[]) => boolean;
  checkSession: () => Promise<void>;
}
