import { useContext, useMemo } from 'react';
import { PermissionContext } from '../providers/PermissionProvider';
import type { PermissionId } from '../registry/permissions';

export const usePermissions = () => {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }

  const { permissions, isLoading } = context;

  const can = useMemo(() => {
    return (permission: PermissionId): boolean => {
      if (permissions === '*') return true;
      return permissions.includes(permission);
    };
  }, [permissions]);

  const canAny = useMemo(() => {
    return (requiredPermissions: PermissionId[]): boolean => {
      if (permissions === '*') return true;
      return requiredPermissions.some(p => permissions.includes(p));
    };
  }, [permissions]);

  const canAll = useMemo(() => {
    return (requiredPermissions: PermissionId[]): boolean => {
      if (permissions === '*') return true;
      return requiredPermissions.every(p => permissions.includes(p));
    };
  }, [permissions]);

  return {
    permissions,
    isLoading,
    can,
    canAny,
    canAll
  };
};
