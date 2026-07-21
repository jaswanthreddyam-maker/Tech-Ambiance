import React from 'react';
import { Documents } from '../../Documents';
import { Credentials } from '../../Credentials';
import { Environments } from '../../Environments';

export const MobileProject: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 p-4">
      <section>
        <h3 className="font-['Cormorant_Garamond'] text-xl font-bold text-[#0B3027] mb-4">Documents</h3>
        <Documents />
      </section>
      
      <section>
        <h3 className="font-['Cormorant_Garamond'] text-xl font-bold text-[#0B3027] mb-4">Credentials</h3>
        <Credentials />
      </section>
      
      <section>
        <h3 className="font-['Cormorant_Garamond'] text-xl font-bold text-[#0B3027] mb-4">Environments</h3>
        <Environments />
      </section>
    </div>
  );
};
