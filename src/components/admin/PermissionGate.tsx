import React from 'react';
import { usePermissions } from '../../auth/usePermissions';
import type { PermissionId } from '../../auth/permissions';

interface PermissionGateProps {
  permission: PermissionId;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ 
  permission, 
  children, 
  fallback = null 
}) => {
  const { can, isLoading } = usePermissions();

  if (isLoading) {
    // Avoid blocking UI renders with large spinners for component-level gates
    return <>{fallback}</>;
  }

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
