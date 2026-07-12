import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProjectContext } from './ProjectContext';
import { portalRepository } from '../../../repositories/portalRepository';
import { KeyRound, Eye } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export const Credentials: React.FC = () => {
  const { activeProjectId } = useProjectContext();
  const [revealedSecrets, setRevealedSecrets] = React.useState<Record<string, string>>({});
  const [actorId, setActorId] = React.useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setActorId(data.user?.id || ''));
  }, []);

  const { data: credentials = [], isLoading } = useQuery({
    queryKey: ['credentials', activeProjectId],
    queryFn: () => portalRepository.getCredentials(activeProjectId!),
    enabled: !!activeProjectId
  });

  const handleReveal = async (credId: string) => {
    if (revealedSecrets[credId]) {
      const next = { ...revealedSecrets };
      delete next[credId];
      setRevealedSecrets(next);
      return;
    }
    try {
      const { data, error } = await supabase.rpc('reveal_project_credential', {
        p_credential_id: credId,
        p_actor_id: actorId
      });
      if (error) throw error;
      setRevealedSecrets(prev => ({ ...prev, [credId]: data.secret_value }));
      setTimeout(() => {
        setRevealedSecrets(prev => {
          const next = { ...prev };
          delete next[credId];
          return next;
        });
      }, data.reveal_token_expires_in * 1000);
    } catch (err) {
      console.error(err);
      alert("Unauthorized to reveal this credential.");
    }
  };

  if (isLoading) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <KeyRound className="w-6 h-6 text-[#C9A56A]" />
        <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">
          Credentials Vault
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {credentials.length === 0 ? (
          <div className="col-span-full py-8 text-center text-[#0B3027]/50 font-mono text-sm border border-dashed border-[#0B3027]/10 rounded-2xl">
            No credentials shared yet.
          </div>
        ) : (
          credentials.map(cred => {
            if (cred.visibility === 'AGENCY') {
              return (
                <div key={cred.id} className="p-5 bg-[#0B3027] rounded-xl text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold">{cred.name}</h4>
                      <div className="text-xs text-emerald-400 font-mono mt-1 font-bold flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Status: Connected
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/40 p-3 rounded-lg font-mono text-xs text-[#F8F6F1]/70 space-y-1">
                    <div><span className="text-[#C9A56A]">Owner:</span> Tech Ambiance</div>
                    <div><span className="text-[#C9A56A]">Last Rotated:</span> {new Date(cred.last_rotated_at).toLocaleDateString()}</div>
                  </div>
                </div>
              );
            }

            return (
              <div key={cred.id} className="p-5 bg-[#0B3027] rounded-xl text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold">{cred.name}</h4>
                    <div className="text-xs text-white/50 font-mono mt-1">{cred.username || 'No Username'}</div>
                  </div>
                  <button onClick={() => handleReveal(cred.id)} className="text-[#C9A56A] hover:text-white transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-black/40 p-3 rounded-lg font-mono text-xs text-[#C9A56A] break-all">
                  {revealedSecrets[cred.id] || '••••••••••••••••••••••••'}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
