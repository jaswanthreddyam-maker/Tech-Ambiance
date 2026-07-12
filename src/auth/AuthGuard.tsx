import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import type { AuthRoleName } from "./types";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: AuthRoleName | AuthRoleName[];
  requiredPermission?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
}) => {
  const {
    isAuthenticated,
    isLoading,
    hasRole,
    hasPermission,
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

  if (requiredPermission && !hasPermission(requiredPermission)) {
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

  return <>{children}</>;
};
