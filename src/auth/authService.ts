import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type {
  AuthRoleName,
  Organization,
  Profile,
  Workspace,
} from "./types";
import type { PermissionId } from './registry/permissions';
import { resolvePermissions } from "./legacyRoles";

const requireSupabase = () => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for this environment.");
  }
};

export function computePermissions(roles: AuthRoleName[]): Set<PermissionId> {
  return resolvePermissions(roles);
}

export const authService = {
  // ==============================================================================
  // ADMIN AUTHENTICATION (STUDIOHQ)
  // ==============================================================================

  async signInWithPrimaryFactor(email: string) {
    requireSupabase();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Auto-signup allows seamless onboarding and prevents email enumeration
      },
    });

    if (error) {
      // We still throw so the UI can show generic "Unable to dispatch code" if network fails,
      // but we shouldn't reveal email existence. Supabase handles this natively.
      throw error;
    }

    return { success: true, error: null };
  },

  async verifyPrimaryFactor(email: string, token: string, deviceTracking: boolean) {
    requireSupabase();

    // 1. Verify OTP with Supabase Auth
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      throw new Error("Invalid or expired verification code.");
    }

    // 2. Check Authorization post-OTP
    const { data: isAuthorized, error: authError } = await supabase.rpc('verify_admin_authorization', {
      p_email: email
    });

    if (authError || !isAuthorized) {
      // Unauthorized: Log event, sign out immediately, throw error
      await supabase.rpc('log_admin_auth_event', {
        p_email: email,
        p_action: 'UnauthorizedAttempt'
      });
      await supabase.auth.signOut();
      throw new Error("This account is not authorized to access StudioHQ.");
    }

    // 3. Authorized: Log event and register session metadata
    await supabase.rpc('log_admin_auth_event', {
      p_email: email,
      p_action: 'AdminSignedIn'
    });

    // In a real app, you'd extract real OS/Browser from userAgent
    const userAgent = navigator.userAgent;
    await supabase.rpc('register_admin_session', {
      p_email: email,
      p_session_id: crypto.randomUUID(),
      p_browser: userAgent.includes('Chrome') ? 'Chrome' : 'Browser',
      p_os: userAgent.includes('Windows') ? 'Windows' : userAgent.includes('Mac') ? 'macOS' : 'Unknown',
      p_ip: 'Client IP', // Usually captured via Supabase Edge Function or realtime header, mockup here
      p_country: 'Unknown',
      p_is_trusted: deviceTracking
    });

    return { success: true, user: data.user, session: data.session };
  },

  // ==============================================================================
  // CLIENT AUTHENTICATION (CLIENT PORTAL)
  // ==============================================================================

  async signUpWithEmail(email: string, password: string, fullName: string) {
    requireSupabase();

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
    requireSupabase();

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
    requireSupabase();

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

  async resendVerificationEmail(email: string) {
    requireSupabase();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return true;
  },

  async resetPasswordForEmail(email: string) {
    requireSupabase();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw error;
    }
    return true;
  },

  async updatePassword(newPassword: string) {
    requireSupabase();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }
    return true;
  },

  async fetchFullContext(userId: string, userEmail?: string): Promise<{
    profile: Profile | null;
    organization: Organization | null;
    workspace: Workspace | null;
    roles: AuthRoleName[];
    permissions: Set<PermissionId>;
  }> {
    requireSupabase();

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

    // Always ensure primary executive owner email has OWNER role
    const effectiveEmail = (userEmail || profile?.email || '').toLowerCase().trim();
    const EXECUTIVE_OWNERS = ['jaswanthreddyam@gmail.com', 'jeshu0069@gmail.com'];
    if (EXECUTIVE_OWNERS.includes(effectiveEmail) && !roles.includes("OWNER")) {
      roles.push("OWNER");
    }

    if (roles.length === 0) {
      if (import.meta.env.DEV) {
        roles.push("OWNER"); // Bypass restriction in local development
      } else {
        roles.push("CLIENT");
      }
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
