import React from 'react';
import { Timeline } from '../../Timeline';

export const MobileUpdates: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">Timeline & Updates</h2>
      <Timeline />
    </div>
  );
};
