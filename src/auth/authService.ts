import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type {
  AuthRoleName,
  Organization,
  Profile,
  Workspace,
} from "./types";

export function computePermissions(roles: AuthRoleName[]): Record<string, boolean> {
  const perms: Record<string, boolean> = {};

  const isOwner = roles.includes("OWNER");
  const isAdmin = roles.includes("ADMIN") || isOwner;
  const isDeveloper = roles.includes("DEVELOPER") || isAdmin;
  const isDesigner = roles.includes("DESIGNER") || isAdmin;
  const isStrategist = roles.includes("STRATEGIST") || isAdmin;

  perms["admin:access"] = isAdmin;
  perms["organization:manage"] = isOwner;
  perms["workspace:manage"] = isAdmin;
  perms["codebase:access"] = isDeveloper;
  perms["design:access"] = isDesigner;
  perms["crm:access"] = isStrategist || roles.includes("SALES");
  perms["portal:access"] = true;

  return perms;
}

export const authService = {
  async signUpWithEmail(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured) {
      return { success: true, requiresVerification: false, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }

    const requiresVerification = Boolean(
      data.user && !data.user.email_confirmed_at && !data.session
    );

    return { success: true, requiresVerification, error: null };
  },

  async signInWithEmail(email: string, password: string) {
    if (!isSupabaseConfigured) {
      return { success: true, user: null, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return { success: true, user: data.user, session: data.session };
  },

  async signInWithGoogle() {
    if (!isSupabaseConfigured) {
      return;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  },

  async signOut() {
    if (!isSupabaseConfigured) {
      return;
    }
    await supabase.auth.signOut();
  },

  async resetPasswordForEmail(email: string) {
    if (!isSupabaseConfigured) {
      return true;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw error;
    }
    return true;
  },

  async updatePassword(newPassword: string) {
    if (!isSupabaseConfigured) {
      return true;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }
    return true;
  },

  async fetchFullContext(userId: string): Promise<{
    profile: Profile | null;
    organization: Organization | null;
    workspace: Workspace | null;
    roles: AuthRoleName[];
    permissions: Record<string, boolean>;
  }> {
    if (!isSupabaseConfigured) {
      const mockProfile: Profile = {
        id: userId,
        email: "demo@techambiance.com",
        full_name: "Executive Client",
        active_organization_id: "org-demo",
        active_workspace_id: "ws-demo",
      };
      const mockOrg: Organization = {
        id: "org-demo",
        name: "Tech Ambiance Flagship Organization",
        slug: "tech-ambiance-flagship",
        brand_color: "#0B3027",
      };
      const mockWs: Workspace = {
        id: "ws-demo",
        organization_id: "org-demo",
        name: "Primary Studio Workspace",
        slug: "primary-workspace",
        status: "ACTIVE",
        is_default: true,
      };
      const mockRoles: AuthRoleName[] = ["OWNER"];
      return {
        profile: mockProfile,
        organization: mockOrg,
        workspace: mockWs,
        roles: mockRoles,
        permissions: computePermissions(mockRoles),
      };
    }

    // 1. Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const profile = profileData as Profile | null;

    // 2. Fetch roles
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", userId);

    const roles: AuthRoleName[] = [];
    if (roleData) {
      roleData.forEach((row: any) => {
        if (row?.roles?.name) {
          roles.push(row.roles.name as AuthRoleName);
        }
      });
    }
    if (roles.length === 0) {
      roles.push("CLIENT");
    }

    // 3. Fetch Organization
    let organization: Organization | null = null;
    if (profile?.active_organization_id) {
      const { data: orgData } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", profile.active_organization_id)
        .single();
      organization = orgData as Organization | null;
    }

    // 4. Fetch Workspace
    let workspace: Workspace | null = null;
    if (profile?.active_workspace_id) {
      const { data: wsData } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", profile.active_workspace_id)
        .single();
      workspace = wsData as Workspace | null;
    }

    const permissions = computePermissions(roles);

    return {
      profile,
      organization,
      workspace,
      roles,
      permissions,
    };
  },
};
