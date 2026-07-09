import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const roles = [
    { name: 'Owner', permissions: 'ALL_PERMISSIONS (Full multi-tenant control)' },
    { name: 'Admin', permissions: 'workspaces:*, crm:*, cms:*, ai:*, media:*' },
    { name: 'Project Manager', permissions: 'workspaces:write, tasks:*, crm:read' },
    { name: 'Developer', permissions: 'projects:*, tasks:*, vault:read' },
    { name: 'Designer', permissions: 'projects:read, cms:write, media:*' },
    { name: 'Strategist', permissions: 'crm:*, ai:*, proposals:*' },
    { name: 'Sales', permissions: 'crm:*, proposals:*' },
    { name: 'Client', permissions: 'portal:read, proposals:view' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="pb-6 border-b border-[#0B3027]/10">
        <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027]">
          Granular 8-Role RBAC & Permissions Matrix
        </h1>
        <p className="text-sm text-[#0B3027]/70 mt-1">
          Composite role assignments (users ⇄ user_roles ⇄ roles ⇄ role_permissions ⇄ permissions).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {roles.map((role) => (
          <div
            key={role.name}
            className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 space-y-2.5 shadow-[0_8px_30px_rgba(11,48,39,0.06)] hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-['Cormorant_Garamond'] font-bold text-2xl text-[#0B3027]">
                {role.name}
              </span>
              <ShieldCheck className="w-5 h-5 text-[#C9A56A]" />
            </div>
            <div className="text-xs font-mono font-semibold text-[#0B3027]/75 bg-[#F8F6F1] p-3 rounded-xl border border-[#0B3027]/10">
              {role.permissions}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
