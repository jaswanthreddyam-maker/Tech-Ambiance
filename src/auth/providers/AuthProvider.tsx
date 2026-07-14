import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { authService } from "../authService";
import type {
  AuthContextState,
  AuthRoleName,
  Organization,
  Profile,
  User,
  Workspace,
} from "../types";
import type { PermissionId } from "../registry/permissions";
import type { Session, User as SupabaseAuthUser } from "@supabase/supabase-js";

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [roles, setRoles] = useState<AuthRoleName[]>(["CLIENT"]);
  const [permissions, setPermissions] = useState<Set<PermissionId>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Backward compatible states
  const [user, setUser] = useState<User | null>(null);

  const loadFullAuthContext = async (userId: string, activeSession: Session | null) => {
    try {
      const fullCtx = await authService.fetchFullContext(userId, activeSession?.user?.email);
      setProfile(fullCtx.profile);
      setOrganization(fullCtx.organization);
      setWorkspace(fullCtx.workspace);
      setRoles(fullCtx.roles);
      setPermissions(fullCtx.permissions);

      const compatibleRole = fullCtx.roles.includes("OWNER")
        ? "owner"
        : fullCtx.roles.includes("ADMIN")
        ? "admin"
        : "client";

      const userObj: User = {
        email: fullCtx.profile?.email || activeSession?.user?.email || "user@techambiance.com",
        name:
          fullCtx.profile?.full_name ||
          activeSession?.user?.user_metadata?.full_name ||
          (activeSession?.user?.email ? activeSession.user.email.split("@")[0] : "Client"),
        avatarUrl: fullCtx.profile?.avatar_url || undefined,
        role: compatibleRole,
      };
      setUser(userObj);
    } catch (err) {
      console.error("[Enterprise Auth] Failed to load multi-tenant context:", err);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      setIsLoading(true);
      if (!isSupabaseConfigured) {
        setUser(null);
        setRoles([]);
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(currentSession);
          setAuthUser(currentSession?.user || null);

          if (currentSession?.user) {
            await loadFullAuthContext(currentSession.user.id, currentSession);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error("[Enterprise Auth] Session init error:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initSession();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event: string, newSession: Session | null) => {
          if (!mounted) return;

          setSession(newSession);
          setAuthUser(newSession?.user || null);

          if (newSession?.user) {
            await loadFullAuthContext(newSession.user.id, newSession);
          } else {
            setUser(null);
            setProfile(null);
            setOrganization(null);
            setWorkspace(null);
            setRoles([]);
            setPermissions(new Set());
          }
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string, _rememberMe = true): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase is not configured. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before signing in.");
      }

      const res = await authService.signInWithEmail(email, password);
      if (res.user) {
        await loadFullAuthContext(res.user.id, res.session || null);
      }
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const signup = async (
    email: string,
    name: string,
    password: string,
    redirectTo?: string
  ): Promise<{ success: boolean; requiresVerification: boolean }> => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase is not configured. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before creating accounts.");
      }

      const res = await authService.signUpWithEmail(email, password, name, redirectTo);
      setIsLoading(false);
      return {
        success: res.success,
        requiresVerification: res.requiresVerification,
      };
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async (redirectTo?: string): Promise<void> => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using Google sign-in.");
    }
    await authService.signInWithGoogle(redirectTo);
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setAuthUser(null);
      setProfile(null);
      setOrganization(null);
      setWorkspace(null);
      setRoles([]);
      setPermissions(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordForEmail = async (email: string): Promise<boolean> => {
    return await authService.resetPasswordForEmail(email);
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    return await authService.updatePassword(newPassword);
  };

  const hasRole = (targetRole: AuthRoleName | AuthRoleName[]): boolean => {
    if (Array.isArray(targetRole)) {
      return targetRole.some((r) => roles.includes(r));
    }
    return roles.includes(targetRole);
  };

  const hasPermission = (permission: PermissionId): boolean => {
    return permissions.has(permission);
  };

  const can = (permission: PermissionId): boolean => {
    return permissions.has(permission);
  };

  const canAny = (permissionsToCheck: PermissionId[]): boolean => {
    return permissionsToCheck.some((p) => permissions.has(p));
  };

  const canAll = (permissionsToCheck: PermissionId[]): boolean => {
    return permissionsToCheck.every((p) => permissions.has(p));
  };

  const checkSession = async (): Promise<void> => {
    setIsLoading(true);
    if (!isSupabaseConfigured) {
      setUser(null);
      setRoles([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setAuthUser(currentSession?.user || null);

      if (currentSession?.user) {
        await loadFullAuthContext(currentSession.user.id, currentSession);
      } else {
        setUser(null);
        setProfile(null);
        setOrganization(null);
        setWorkspace(null);
        setRoles([]);
        setPermissions(new Set());
      }
    } catch (err) {
      console.error("[Enterprise Auth] checkSession error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = Boolean(user || authUser);
  const isEmailVerified = Boolean(
    authUser ? authUser.email_confirmed_at : isAuthenticated
  );

  return (
    <AuthContext.Provider
      value={{
        session,
        authUser,
        profile,
        roles,
        permissions,
        organization,
        workspace,
        user,
        project: null,
        isAuthenticated,
        isLoading,
        isEmailVerified,
        login,
        signup,
        loginWithGoogle,
        logout,
        resetPasswordForEmail,
        updatePassword,
        hasRole,
        hasPermission,
        can,
        canAny,
        canAll,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextState => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
