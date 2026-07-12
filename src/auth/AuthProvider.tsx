import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { authService } from "./authService";
import type {
  AuthContextState,
  AuthRoleName,
  Organization,
  Profile,
  Project,
  User,
  Workspace,
} from "./types";
import type { Session, User as SupabaseAuthUser } from "@supabase/supabase-js";

const AuthContext = createContext<AuthContextState | undefined>(undefined);

// Mock project for demonstration / staging portal view compatibility
const defaultMockProject: Project = {
  id: "proj-1",
  name: "Cafe Vistaara Premium Website",
  status: "Development",
  progress: 68,
  startDate: "2026-06-01",
  deliveryDate: "2026-08-15",
  budget: "$12,500 USD",
  activeMilestone: "Front-end Animations & Core Framework Implementation",
  milestones: [
    { id: "m1", name: "Discovery & Brand Identity Strategy", date: "2026-06-10", status: "completed" },
    { id: "m2", name: "High-Fidelity UI/UX Web Layout Designs", date: "2026-06-25", status: "completed" },
    { id: "m3", name: "Core Front-end React + Tailwind Setup", date: "2026-07-05", status: "completed" },
    { id: "m4", name: "Animations, Transitions & Motion Details", date: "2026-07-20", status: "active" },
    { id: "m5", name: "SEO Optimizations & Lighthouse Verification", date: "2026-08-01", status: "pending" },
    { id: "m6", name: "Launch & Production Server Handover", date: "2026-08-15", status: "pending" },
  ],
  invoices: [
    { id: "inv-001", amount: "$5,000.00", date: "2026-06-02", status: "Paid" },
    { id: "inv-002", amount: "$3,750.00", date: "2026-07-01", status: "Paid" },
    { id: "inv-003", amount: "$3,750.00", date: "2026-08-10", status: "Pending" },
  ],
  sourceCode: "https://github.com/techambiance/cafe-vistaara",
  demoUrl: "https://vistaara.experience.techambiance.com",
  supportTickets: [
    { id: "t-001", subject: "Integrate custom reservation widgets", status: "Resolved", date: "2026-06-28" },
    { id: "t-002", subject: "Review custom hover animation parameters on mobile viewports", status: "Open", date: "2026-07-07" },
  ],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [roles, setRoles] = useState<AuthRoleName[]>(["CLIENT"]);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Backward compatible states
  const [user, setUser] = useState<User | null>(null);
  const [project] = useState<Project | null>(defaultMockProject);

  const loadFullAuthContext = async (userId: string, activeSession: Session | null) => {
    try {
      const fullCtx = await authService.fetchFullContext(userId);
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
        const storedUser = localStorage.getItem("ta_user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setRoles(["OWNER"]);
        }
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
        async (_event, newSession) => {
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
            setPermissions({});
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
        const mockUser: User = {
          email,
          name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
          role: "owner",
        };
        setUser(mockUser);
        setRoles(["OWNER"]);
        localStorage.setItem("ta_user", JSON.stringify(mockUser));
        setIsLoading(false);
        return true;
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
    password: string
  ): Promise<{ success: boolean; requiresVerification: boolean }> => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        const mockUser: User = {
          email,
          name,
          role: "owner",
        };
        setUser(mockUser);
        setRoles(["OWNER"]);
        localStorage.setItem("ta_user", JSON.stringify(mockUser));
        setIsLoading(false);
        return { success: true, requiresVerification: false };
      }

      const res = await authService.signUpWithEmail(email, password, name);
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

  const loginWithGoogle = async (): Promise<void> => {
    if (!isSupabaseConfigured) {
      setIsLoading(true);
      const mockUser: User = {
        email: "google.user@techambiance.com",
        name: "Google Executive",
        role: "owner",
      };
      setUser(mockUser);
      setRoles(["OWNER"]);
      localStorage.setItem("ta_user", JSON.stringify(mockUser));
      setIsLoading(false);
      return;
    }
    await authService.signInWithGoogle();
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.signOut();
      localStorage.removeItem("ta_user");
      setUser(null);
      setSession(null);
      setAuthUser(null);
      setProfile(null);
      setOrganization(null);
      setWorkspace(null);
      setRoles([]);
      setPermissions({});
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

  const hasPermission = (permission: string): boolean => {
    return Boolean(permissions[permission]);
  };

  const checkSession = async (): Promise<void> => {
    setIsLoading(true);
    if (!isSupabaseConfigured) {
      const storedUser = localStorage.getItem("ta_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setRoles(["OWNER"]);
      }
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
        setPermissions({});
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
        project,
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
