import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { AuthRoleName } from './types';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
    let refreshInterval: number;

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

      // 3. Call Edge Function to validate HTTP-only cookie
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error("No token");

        const adminSessionId = sessionStorage.getItem('admin_session_id') || '';
        const response = await fetch('/functions/v1/admin-auth?action=validate', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'x-admin-session-id': adminSessionId
          },
          body: JSON.stringify({ action: 'validate', sessionId: adminSessionId })
        });

        const result = await response.json();
        
        if (mounted) {
          if (result.success) {
            setIsSessionValid(true);
            
            // Set up sliding window refresh every 5 minutes
            refreshInterval = window.setInterval(async () => {
              try {
                await fetch('/functions/v1/admin-auth?action=refresh', {
                  method: 'POST',
                  credentials: 'include',
                  headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                    'x-admin-session-id': adminSessionId
                  },
                  body: JSON.stringify({ action: 'refresh', sessionId: adminSessionId })
                });
              } catch {
                console.error("Failed to refresh admin session");
              }
            }, 5 * 60 * 1000);
            
          } else {
            setIsSessionValid(false);
          }
          setIsValidating(false);
        }
      } catch (err) {
        console.error("Admin session validation failed:", err);
        if (mounted) {
          setIsSessionValid(false);
          setIsValidating(false);
        }
      }
    };

    validateSession();

    return () => {
      mounted = false;
      if (refreshInterval) clearInterval(refreshInterval);
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
