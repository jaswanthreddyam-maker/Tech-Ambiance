import React, { useEffect, useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ABSOLUTE_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
const WARNING_BEFORE = 60 * 1000; // 60 seconds

export const SessionTimeout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const resetTimers = useCallback(() => {
    localStorage.setItem('admin_last_activity', Date.now().toString());
    if (showWarning) setShowWarning(false);
  }, [showWarning]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Set initial timestamps if not present
    if (!localStorage.getItem('admin_login_time')) {
      localStorage.setItem('admin_login_time', Date.now().toString());
    }
    resetTimers();

    const checkSession = () => {
      const lastActivity = parseInt(localStorage.getItem('admin_last_activity') || '0', 10);
      const loginTime = parseInt(localStorage.getItem('admin_login_time') || '0', 10);
      const now = Date.now();

      const inactiveTime = now - lastActivity;
      const totalSessionTime = now - loginTime;

      // Absolute Timeout Reached
      if (totalSessionTime >= ABSOLUTE_TIMEOUT) {
        handleLogout('Session expired due to 8-hour limit.');
        return;
      }

      // Inactivity Warning Trigger
      if (inactiveTime >= INACTIVITY_TIMEOUT - WARNING_BEFORE && inactiveTime < INACTIVITY_TIMEOUT) {
        if (!showWarning) setShowWarning(true);
        const remaining = Math.ceil((INACTIVITY_TIMEOUT - inactiveTime) / 1000);
        setCountdown(remaining);
      }

      // Inactivity Timeout Reached
      if (inactiveTime >= INACTIVITY_TIMEOUT) {
        handleLogout('Session expired due to 30 minutes of inactivity.');
      }
    };

    const handleLogout = async (reason: string) => {
      // Log audit event before logging out
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          await supabase.rpc('log_admin_auth_event', {
            p_email: user.email,
            p_action: 'AdminSignedOut',
            p_details: { reason }
          });
        }
      } catch (e) {}

      localStorage.removeItem('admin_last_activity');
      localStorage.removeItem('admin_login_time');
      await logout();
      navigate('/admin/login');
    };

    const interval = setInterval(checkSession, 1000);

    // Event listeners for activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => {
      // Only reset if we are not currently warning the user.
      // If warning is showing, they must explicitly click "Stay Signed In".
      if (!showWarning) {
        resetTimers();
      }
    };

    activityEvents.forEach(e => window.addEventListener(e, handleActivity));

    return () => {
      clearInterval(interval);
      activityEvents.forEach(e => window.removeEventListener(e, handleActivity));
    };
  }, [isAuthenticated, showWarning, resetTimers, logout, navigate]);

  const handleStaySignedIn = () => {
    resetTimers();
  };

  return (
    <>
      {children}
      
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-[9999] bg-[#0B3D2E] text-[#F8F6F1] p-6 rounded-2xl shadow-2xl border border-[#C5A572]/20 max-w-sm w-full"
          >
            <h3 className="font-['Cormorant_Garamond'] text-xl font-bold mb-2 text-[#C5A572]">
              Session Expiring
            </h3>
            <p className="text-sm font-medium opacity-80 mb-6">
              You will be automatically signed out in <span className="font-bold text-white">{countdown}</span> seconds due to inactivity.
            </p>
            <button
              onClick={handleStaySignedIn}
              className="w-full bg-[#C5A572] text-[#0B3D2E] py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
            >
              Stay Signed In
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
