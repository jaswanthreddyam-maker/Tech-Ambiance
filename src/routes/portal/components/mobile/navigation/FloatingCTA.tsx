import React from 'react';
import { useLocation } from 'react-router-dom';
import { MOBILE_ROUTE_CONFIG } from '../../../registry/mobileRouteConfig';
import { motion } from 'framer-motion';

export const FloatingCTA: React.FC = () => {
  const location = useLocation();
  
  let routeKey = 'home';
  if (location.pathname.includes('/project')) routeKey = 'project';
  else if (location.pathname.includes('/updates')) routeKey = 'updates';

  const config = MOBILE_ROUTE_CONFIG[routeKey];

  if (!config) return null;

  const { label, icon: Icon } = config.fab;

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-[calc(var(--portal-bottom-nav-height)+var(--portal-safe-bottom)+20px)] right-4 h-[var(--portal-fab-size)] px-5 bg-[#0B3027] text-[#C9A56A] rounded-full shadow-lg flex items-center gap-2 border border-[#C9A56A]/20 z-40"
    >
      <Icon className="w-4 h-4" />
      <span className="text-[11px] uppercase tracking-widest font-bold">{label}</span>
    </motion.button>
  );
};
