import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { AuthRoleName } from './types';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: AuthRoleName[];
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/admin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
