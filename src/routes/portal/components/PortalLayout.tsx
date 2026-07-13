import React from 'react';
import { useProjectContext } from './ProjectContext';
import { ChevronDown, Sparkles, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsultationModal } from '../../../providers/ConsultationModalProvider';

export const PortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { projects, isLoading, activeProjectId, setActiveProjectId } = useProjectContext();
  const { openConsultationModal } = useConsultationModal();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Sparkles className="w-8 h-8 text-[#C9A56A] mb-4" />
          <div className="font-mono text-sm text-[#0B3027]/50">Loading Workspace...</div>
        </div>
      </div>
    );
  }

  // Enterprise Empty State
  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-[#0B3027]/10 p-10 rounded-[2rem] shadow-2xl text-center">
          <div className="w-16 h-16 bg-[#0B3027]/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-[#C9A56A]" />
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027] mb-3">
            Workspace Pending Setup
          </h1>
          <p className="text-[#0B3027]/70 text-sm leading-relaxed mb-8">
            Your workspace will be updated after your consultation request is reviewed and accepted.
          </p>
          <button 
            onClick={() => openConsultationModal()}
            className="w-full py-3.5 px-6 bg-[#0B3027] text-[#FAF7F0] rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-[#0B3027]/90 transition-all shadow-lg"
          >
            Book Consultation
          </button>
        </div>
      </div>
    );
  }

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const organizationName = activeProject?.workspaces?.organizations?.name || 'Organization';

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      {/* Enterprise Project Switcher Header */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/80 backdrop-blur-xl border-b border-[#0B3027]/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="font-['Cormorant_Garamond'] font-bold text-2xl text-[#0B3027] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C9A56A]" />
            StudioHQ Portal
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-[#0B3027]/5 transition-colors border border-transparent hover:border-[#0B3027]/10"
            >
              <div className="text-left">
                <div className="text-[10px] font-mono text-[#0B3027]/50 uppercase tracking-widest">{organizationName}</div>
                <div className="text-sm font-bold text-[#0B3027]">{activeProject.name}</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#0B3027]/50 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-[#0B3027]/10 overflow-hidden py-2"
                >
                  <div className="px-4 py-2 border-b border-[#0B3027]/5">
                    <span className="text-[10px] font-mono text-[#0B3027]/50 uppercase tracking-widest">{organizationName}</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2">
                    {projects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActiveProjectId(p.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                          p.id === activeProjectId 
                            ? 'bg-[#0B3027]/5 font-bold text-[#0B3027]' 
                            : 'text-[#0B3027]/70 hover:bg-[#0B3027]/5 hover:text-[#0B3027]'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-[#0B3027]/5">
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        openConsultationModal();
                      }}
                      className="text-xs font-semibold text-[#9A7B4F] flex items-center gap-2 hover:opacity-80"
                    >
                      <span>+</span> Request Future Project
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
};
