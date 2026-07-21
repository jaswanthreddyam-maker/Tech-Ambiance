import React, { useState } from 'react';
import { GlobalProjectHero } from '../hero/GlobalProjectHero';
import { BottomNav } from '../navigation/BottomNav';
import { FloatingCTA } from '../navigation/FloatingCTA';

export const PortalMobileLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProjectSwitchOpen, setIsProjectSwitchOpen] = useState(false);

  return (
    <div className="portal-mobile-shell">
      <GlobalProjectHero onSwitchProject={() => setIsProjectSwitchOpen(true)} />
      
      {/* Route Outlet Area */}
      <main className="flex-1 flex flex-col relative pb-[calc(var(--portal-fab-size)+20px)]">
        {children}
      </main>

      <FloatingCTA />
      
      <BottomNav onOpenProfile={() => setIsProfileOpen(true)} />

      {/* Bottom Sheets (To be implemented) */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-[#0B3027]/40 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)} />
          <div className="relative w-full bg-white rounded-t-[var(--portal-sheet-radius)] p-6 pb-[var(--portal-safe-bottom)]">
            <h3 className="text-xl font-bold font-['Cormorant_Garamond'] mb-4">Profile</h3>
            <p className="text-sm text-gray-500">More options coming soon...</p>
          </div>
        </div>
      )}

      {isProjectSwitchOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-[#0B3027]/40 backdrop-blur-sm" onClick={() => setIsProjectSwitchOpen(false)} />
          <div className="relative w-full bg-white rounded-t-[var(--portal-sheet-radius)] p-6 pb-[var(--portal-safe-bottom)]">
            <h3 className="text-xl font-bold font-['Cormorant_Garamond'] mb-4">Switch Project</h3>
            <p className="text-sm text-gray-500">Project list coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
};
