import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useAuthContext } from '../providers/AuthProvider';
import type { PermissionId } from '../registry/permissions';

export interface PermissionContextState {
  permissions: PermissionId[] | '*';
  isLoading: boolean;
}

export const PermissionContext = createContext<PermissionContextState | null>(null);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { authUser, user, roles, isLoading: authLoading } = useAuthContext();
  const [permissions, setPermissions] = useState<PermissionId[] | '*'>(([]));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!authUser && !user) {
      setPermissions([]);
      setIsLoading(false);
      return;
    }

    // =========================================================================
    // PHASE A: COMPATIBILITY LAYER
    // =========================================================================
    // Temporarily map the hardcoded 'OWNER' and 'ADMIN' roles to a wildcard permission set.
    // In Phase D, this will be replaced by fetching actual explicit permissions
    // dynamically based on the user's role assignments via JWT or DB.
    if (roles?.includes('OWNER') || roles?.includes('ADMIN') || user?.role === 'owner' || user?.role === 'admin') {
      setPermissions('*');
    } else {
      setPermissions([]); 
    }
    
    setIsLoading(false);
  }, [authUser, authLoading]);

  const value = useMemo(() => ({
    permissions,
    isLoading
  }), [permissions, isLoading]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};
