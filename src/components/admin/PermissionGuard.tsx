import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../auth/usePermissions';
import type { PermissionId } from '../../auth/permissions';

interface PermissionGuardProps {
  permission: PermissionId;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  children, 
  fallback = <Navigate to="/admin" replace /> 
}) => {
  const { can, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8F6F1]">
        <div className="h-8 w-8 rounded-full border-2 border-[#0B3027]/20 border-t-[#0B3027] animate-spin" />
      </div>
    );
  }

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
