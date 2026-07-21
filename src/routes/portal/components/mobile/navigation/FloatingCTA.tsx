import React from 'react';
import { useLocation } from 'react-router-dom';
import { MOBILE_ROUTE_CONFIG } from '../../../registry/mobileRouteConfig';
import { motion } from 'framer-motion';
import { useConsultationModal } from '../../../../../providers/ConsultationModalProvider';

export const FloatingCTA: React.FC = () => {
  const location = useLocation();
  const { openConsultationModal } = useConsultationModal();
  
  let routeKey = 'home';
  if (location.pathname.includes('/project')) routeKey = 'project';
  else if (location.pathname.includes('/updates')) routeKey = 'updates';

  const config = MOBILE_ROUTE_CONFIG[routeKey];

  if (!config) return null;

  const { label, icon: Icon, action } = config.fab;

  const handleAction = () => {
    if (action === 'open_consultation') {
      openConsultationModal();
    } else {
      alert(`${label} feature coming in Phase P1!`);
    }
  };

  return (
    <motion.button
      onClick={handleAction}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-[calc(var(--portal-bottom-nav-height)+var(--portal-safe-bottom)+20px)] right-4 h-[var(--portal-fab-size)] px-5 bg-[#0B3027] text-[#C9A56A] rounded-full shadow-lg flex items-center gap-2 border border-[#C9A56A]/20 z-40"
    >
      <Icon className="w-4 h-4" />
      <span className="text-[11px] uppercase tracking-widest font-bold">{label}</span>
    </motion.button>
  );
};
