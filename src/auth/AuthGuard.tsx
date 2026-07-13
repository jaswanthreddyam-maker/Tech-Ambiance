import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import type { AuthRoleName } from "./types";
import type { Permission } from "./permissions";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Legacy: check if user has any of these roles */
  requiredRole?: AuthRoleName | AuthRoleName[];
  /** Check a single permission */
  requiredPermission?: Permission;
  /** User must have ALL of these permissions */
  requiredAllPermissions?: Permission[];
  /** User must have at least ONE of these permissions */
  requiredAnyPermissions?: Permission[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
  requiredAllPermissions,
  requiredAnyPermissions,
}) => {
  const {
    isAuthenticated,
    isLoading,
    hasRole,
    can,
  } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#FAF7F0] flex flex-col items-center justify-center select-none relative overflow-hidden">
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-full border border-forest/20 bg-forest/5 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-forest animate-spin" />
          </div>
          <div className="text-center">
            <h3 className="font-heading font-bold text-sm uppercase tracking-[0.24em] text-forest">
              Checking Session...
            </h3>
            <p className="text-[10px] uppercase tracking-[0.18em] text-forest/60 mt-1 font-medium">
              Verifying Studio Environment
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Legacy role check
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen w-full bg-[#FAF7F0] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="font-heading font-bold text-2xl text-forest mb-2">
          Access Restricted
        </h2>
        <p className="text-sm text-forest/70 max-w-md">
          Your active studio membership does not have the required executive clearance ({Array.isArray(requiredRole) ? requiredRole.join(", ") : requiredRole}) for this environment.
        </p>
      </div>
    );
  }

  // Single permission check
  if (requiredPermission && !can(requiredPermission)) {
    return (
      <div className="min-h-screen w-full bg-[#FAF7F0] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="font-heading font-bold text-2xl text-forest mb-2">
          Permission Required
        </h2>
        <p className="text-sm text-forest/70 max-w-md">
          Missing required capability ({requiredPermission}). Please consult your organization owner.
        </p>
      </div>
    );
  }

  // All permissions required
  if (requiredAllPermissions && !requiredAllPermissions.every(p => can(p))) {
    const missing = requiredAllPermissions.filter(p => !can(p));
    return (
      <div className="min-h-screen w-full bg-[#FAF7F0] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="font-heading font-bold text-2xl text-forest mb-2">
          Insufficient Permissions
        </h2>
        <p className="text-sm text-forest/70 max-w-md">
          Missing capabilities: {missing.join(', ')}
        </p>
      </div>
    );
  }

  // Any permission required
  if (requiredAnyPermissions && !requiredAnyPermissions.some(p => can(p))) {
    return (
      <div className="min-h-screen w-full bg-[#FAF7F0] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="font-heading font-bold text-2xl text-forest mb-2">
          Access Restricted
        </h2>
        <p className="text-sm text-forest/70 max-w-md">
          You need at least one of: {requiredAnyPermissions.join(', ')}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
