import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useAuthContext } from './AuthProvider';
import type { PermissionId } from './permissions';

export interface PermissionContextState {
  permissions: PermissionId[] | '*';
  isLoading: boolean;
}

export const PermissionContext = createContext<PermissionContextState | null>(null);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authUser, isLoading: authLoading } = useAuthContext();
  const [permissions, setPermissions] = useState<PermissionId[] | '*'>(([]));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      setPermissions([]);
      setIsLoading(false);
      return;
    }

    // =========================================================================
    // PHASE A: COMPATIBILITY LAYER
    // =========================================================================
    // Temporarily map the hardcoded 'OWNER' role to a wildcard permission set.
    // In Phase D, this will be replaced by fetching actual explicit permissions
    // dynamically based on the user's role assignments via JWT or DB.
    if (authUser.role === 'OWNER') {
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
