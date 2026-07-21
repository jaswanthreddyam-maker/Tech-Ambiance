import React from 'react';
import { Overview } from '../../Overview';
import { Milestones } from '../../Milestones';

export const MobileHome: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-4">
        <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">Overview</h2>
        <Overview />
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">Next Milestone</h2>
        <Milestones />
      </div>
    </div>
  );
};
