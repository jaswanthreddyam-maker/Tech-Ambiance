import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Folder, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const BottomNav: React.FC<{ onOpenProfile: () => void }> = ({ onOpenProfile }) => {
  const tabs = [
    { name: 'Home', path: '/portal', icon: Home, end: true },
    { name: 'Project', path: '/portal/project', icon: Folder },
    { name: 'Updates', path: '/portal/updates', icon: Clock }
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-[#0B3027]/10 z-50 pb-[var(--portal-safe-bottom)]">
      <div className="flex items-center justify-around h-[var(--portal-bottom-nav-height)] px-2">
        {tabs.map(tab => (
          <NavLink
            key={tab.name}
            to={tab.path}
            end={tab.end}
            className={({ isActive }) => 
              `relative flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${isActive ? 'text-[#0B3027]' : 'text-[#0B3027]/40'}`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={{ scale: isActive ? 1 : 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <tab.icon className="w-5 h-5" />
                </motion.div>
                <span className="text-[10px] font-semibold tracking-wider">{tab.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-[1px] w-8 h-[2px] bg-[#C9A56A] rounded-b-full"
                    transition={{ duration: 0.18 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
        
        {/* Profile Tab (Opens Bottom Sheet) */}
        <button 
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center w-16 h-full gap-1 text-[#0B3027]/40 hover:text-[#0B3027] transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider">Profile</span>
        </button>
      </div>
    </div>
  );
};
