import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Globe, Calendar, DollarSign, Target, FileText, CheckCircle2 } from 'lucide-react';
import type { CrmLead } from '../../repositories/crmRepository';
import { workspaceRepository } from '../../repositories/workspaceRepository';
import { useAuthContext } from '../../auth/providers/AuthProvider';

interface LeadDetailsPanelProps {
  lead: CrmLead | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LeadDetailsPanel: React.FC<LeadDetailsPanelProps> = ({ lead, isOpen, onClose }) => {
  const { authUser } = useAuthContext();
  const [isConverting, setIsConverting] = useState(false);

  if (!lead) return null;

  const snapshot = lead.consultation_snapshot || {};

  const handleWinDeal = async () => {
    if (!authUser) return;
    setIsConverting(true);
    try {
      await workspaceRepository.convertLeadToWorkspace(lead.id, authUser.id);
      onClose();
    } catch (err) {
      console.error('Failed to convert lead:', err);
      alert('Failed to convert lead to workspace');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B3027]/40 backdrop-blur-sm z-[100]"
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-[#FAF7F0] shadow-2xl z-[101] border-l border-[#C9A56A]/20 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#0B3027]/10 bg-white">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#C9A56A]/15 text-[10px] font-mono font-bold text-[#9A7B4F]">
                    {lead.lead_number || 'LEAD'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#0B3027]/5 text-[10px] font-mono font-bold text-[#0B3027]/70 uppercase">
                    {lead.status}
                  </span>
                </div>
                <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">
                  {lead.business_name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#0B3027]/5 flex items-center justify-center hover:bg-[#0B3027]/10 transition-colors"
              >
                <X className="w-4 h-4 text-[#0B3027]" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Contact Info */}
              <section className="space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#0B3027]/50">Contact Information</h3>
                <div className="bg-white rounded-2xl p-5 border border-[#0B3027]/5 space-y-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#0B3027]/40">Work Email</div>
                      <div className="text-sm font-medium text-[#0B3027]">{lead.contact_email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#0B3027]/40">Phone / WhatsApp</div>
                      <div className="text-sm font-medium text-[#0B3027]">{snapshot.contact_phone || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#0B3027]/40">Website / Instagram</div>
                      <div className="text-sm font-medium text-[#0B3027]">{snapshot.website || snapshot.instagram || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Project Scope */}
              <section className="space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#0B3027]/50">Project Scope</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-[#0B3027]/5 shadow-sm">
                    <DollarSign className="w-5 h-5 text-[#C9A56A] mb-2" />
                    <div className="text-[10px] uppercase font-bold text-[#0B3027]/40">Budget Range</div>
                    <div className="text-sm font-bold text-[#0B3027] mt-1">{lead.budget_range}</div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-[#0B3027]/5 shadow-sm">
                    <Calendar className="w-5 h-5 text-indigo-500 mb-2" />
                    <div className="text-[10px] uppercase font-bold text-[#0B3027]/40">Timeline</div>
                    <div className="text-sm font-bold text-[#0B3027] mt-1">{lead.timeline}</div>
                  </div>
                </div>
              </section>

              {/* Goals & Message */}
              <section className="space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#0B3027]/50">Consultation Details</h3>
                <div className="bg-white rounded-2xl p-6 border border-[#0B3027]/5 shadow-sm space-y-6">
                  
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-rose-500" />
                      <span className="text-xs font-bold text-[#0B3027]">Primary Goals</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {snapshot.goals?.map((goal: string, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg bg-[#FAF7F0] border border-[#0B3027]/10 text-xs font-medium text-[#0B3027]">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>

                  {snapshot.message && (
                    <div className="pt-4 border-t border-[#0B3027]/5">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold text-[#0B3027]">Client Message</span>
                      </div>
                      <p className="text-sm text-[#0B3027]/70 leading-relaxed italic border-l-2 border-[#C9A56A] pl-3">
                        "{snapshot.message}"
                      </p>
                    </div>
                  )}

                </div>
              </section>

            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-[#0B3027]/10 bg-white flex items-center justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-[#0B3027] hover:bg-[#0B3027]/5 transition-colors"
              >
                Close
              </button>
              {lead.status !== 'WON' && (
                <button 
                  onClick={handleWinDeal}
                  disabled={isConverting}
                  className="px-5 py-2.5 rounded-full bg-[#0B3027] text-[#F8F6F1] text-xs font-bold shadow-md hover:bg-[#0E3A2F] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isConverting ? 'Provisioning...' : 'Mark as Won & Provision'}
                </button>
              )}
              {lead.status === 'WON' && (
                <div className="px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Workspace Provisioned
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
