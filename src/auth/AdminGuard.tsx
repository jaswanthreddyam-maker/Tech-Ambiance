import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { AuthRoleName } from './types';
import type { Permission } from './permissions';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  /** Legacy: check if user has any of these roles */
  requiredRole?: AuthRoleName[];
  /** Check a single permission */
  requiredPermission?: Permission;
  /** User must have ALL of these permissions */
  requiredAllPermissions?: Permission[];
  /** User must have at least ONE of these permissions */
  requiredAnyPermissions?: Permission[];
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
  requiredAllPermissions,
  requiredAnyPermissions,
}) => {
  const { isAuthenticated, isLoading, hasRole, can } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#FAF7F0] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0B3027]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/admin" state={{ from: location }} replace />;
  }

  // Legacy role check (backward compat)
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/auth/admin" state={{ from: location }} replace />;
  }

  // Single permission check
  if (requiredPermission && !can(requiredPermission)) {
    return (
      <div className="min-h-screen w-full bg-[#FAF7F0] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="font-heading font-bold text-2xl text-[#0B3027] mb-2">
          Access Restricted
        </h2>
        <p className="text-sm text-[#0B3027]/70 max-w-md">
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
        <h2 className="font-heading font-bold text-2xl text-[#0B3027] mb-2">
          Insufficient Permissions
        </h2>
        <p className="text-sm text-[#0B3027]/70 max-w-md">
          Missing capabilities: {missing.join(', ')}
        </p>
      </div>
    );
  }

  // Any permission required
  if (requiredAnyPermissions && !requiredAnyPermissions.some(p => can(p))) {
    return (
      <div className="min-h-screen w-full bg-[#FAF7F0] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="font-heading font-bold text-2xl text-[#0B3027] mb-2">
          Access Restricted
        </h2>
        <p className="text-sm text-[#0B3027]/70 max-w-md">
          You need at least one of: {requiredAnyPermissions.join(', ')}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
