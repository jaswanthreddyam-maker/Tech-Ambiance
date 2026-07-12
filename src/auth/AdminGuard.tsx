import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { AuthRoleName } from './types';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: AuthRoleName[];
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, hasRole, user, checkSession } = useAuth();
  const location = useLocation();
  
  const [isValidating, setIsValidating] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(false);

  useEffect(() => {
    let mounted = true;

    const validateSession = async () => {
      // 1. Check basic Auth
      if (!isAuthenticated || !user) {
        if (mounted) {
          setIsSessionValid(false);
          setIsValidating(false);
        }
        return;
      }

      // 2. Check Roles
      if (requiredRole && !hasRole(requiredRole)) {
        if (mounted) {
          setIsSessionValid(false);
          setIsValidating(false);
        }
        return;
      }

      // Grant access if user is authenticated with Supabase OR has admin PIN session
      if (mounted) {
        setIsSessionValid(true);
        setIsValidating(false);
      }
    };

    validateSession();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, hasRole, user, checkSession, requiredRole]);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#0B3027] mb-4" />
          <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">Verifying Executive Session...</h2>
          <p className="text-[#0B3027]/60 text-sm mt-2">Zero Trust validation in progress.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isSessionValid || (requiredRole && !hasRole(requiredRole))) {
    // Save intended URL for post-login redirect
    return <Navigate to="/auth/admin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
