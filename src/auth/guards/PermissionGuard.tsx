import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { useAuthContext } from '../../auth/providers/AuthProvider';
import type { PermissionId } from '../../auth/registry/permissions';
import { Lock } from 'lucide-react';

interface PermissionGuardProps {
  permission: PermissionId;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  children 
}) => {
  const { authUser, isLoading: authLoading } = useAuthContext();
  const { can, isLoading: permsLoading } = usePermissions();

  const isLoading = authLoading || permsLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8F6F1]">
        <div className="h-8 w-8 rounded-full border-2 border-[#0B3027]/20 border-t-[#0B3027] animate-spin" />
      </div>
    );
  }

  // Not authenticated? Send to login.
  if (!authUser) {
    return <Navigate to="/auth/admin" replace />;
  }

  // Authenticated but no permission? Show 403 Access Denied.
  if (!can(permission)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-[#F8F6F1] px-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#0B3027]/10 max-w-md w-full flex flex-col items-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#0B3027] mb-2 font-serif">Access Restricted</h1>
          <p className="text-[#0B3027]/70 mb-6">
            You don't have permission to access this module.
          </p>
          <div className="bg-[#0B3027]/5 px-4 py-3 rounded-lg w-full mb-8 text-sm flex justify-between items-center">
            <span className="text-[#0B3027]/60">Required Permission:</span>
            <code className="text-[#C9A56A] font-mono font-medium">{permission}</code>
          </div>
          <Link 
            to="/admin" 
            className="bg-[#0B3027] text-[#F8F6F1] px-6 py-3 rounded-xl font-medium hover:bg-[#0B3027]/90 transition-all w-full"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
