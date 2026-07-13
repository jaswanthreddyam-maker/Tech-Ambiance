import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { AuthRoleName } from './types';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: AuthRoleName[];
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
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

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/auth/admin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
