import React, { useState, useEffect } from 'react';
import { X, Building2, User, Globe, LayoutTemplate, Zap, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { workspaceRepository } from '../../../repositories/workspaceRepository';
import type { ProjectTemplate, ProvisionClientPayload } from '../../../types/studioHQ';
import { supabase } from '../../../lib/supabase';

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProvisionClientWizard: React.FC<WizardProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [adminId, setAdminId] = useState('');

  const [payload, setPayload] = useState<ProvisionClientPayload>({
    organization: { name: '', business_category: '', gst_number: '', website_url: '' },
    contact: { full_name: '', email: '', phone: '', position: '' },
    workspace: { name: '', country: '', timezone: '', is_primary: true },
    projects: { template_ids: [] },
    activation: { method: 'INVOICE_PAID', portal_visibility: 'IMMEDIATELY', invite_now: true }
  });

  useEffect(() => {
    if (isOpen) {
      workspaceRepository.getProjectTemplates().then(setTemplates).catch(console.error);
      supabase.auth.getUser().then(({ data }) => setAdminId(data.user?.id || ''));
      setStep(1);
      setPayload({
        organization: { name: '', business_category: '', gst_number: '', website_url: '' },
        contact: { full_name: '', email: '', phone: '', position: '' },
        workspace: { name: '', country: '', timezone: '', is_primary: true },
        projects: { template_ids: [] },
        activation: { method: 'INVOICE_PAID', portal_visibility: 'IMMEDIATELY', invite_now: true }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const nextStep = () => setStep(s => Math.min(6, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!adminId) return;
    setIsSubmitting(true);
    try {
      const idempotencyKey = `prov_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await workspaceRepository.provisionClient(payload, adminId, idempotencyKey);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Provisioning failed. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Organization', icon: Building2 },
    { num: 2, title: 'Contact', icon: User },
    { num: 3, title: 'Delivery', icon: Globe },
    { num: 4, title: 'Projects', icon: LayoutTemplate },
    { num: 5, title: 'Activation', icon: Zap },
    { num: 6, title: 'Review', icon: CheckCircle2 },
  ];

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0B3027] mb-1">Organization Name *</label>
              <input type="text" value={payload.organization.name} onChange={e => setPayload({...payload, organization: {...payload.organization, name: e.target.value}})} className="w-full bg-white/50 border border-[#0B3027]/10 rounded-lg p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0B3027] mb-1">Business Category *</label>
              <input type="text" value={payload.organization.business_category} onChange={e => setPayload({...payload, organization: {...payload.organization, business_category: e.target.value}})} className="w-full bg-white/50 border border-[#0B3027]/10 rounded-lg p-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B3027] mb-1">GST Number (Optional)</label>
                <input type="text" value={payload.organization.gst_number} onChange={e => setPayload({...payload, organization: {...payload.organization, gst_number: e.target.value}})} className="w-full bg-white/50 border border-[#0B3027]/10 rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0B3027] mb-1">Website URL (Optional)</label>
                <input type="text" value={payload.organization.website_url} onChange={e => setPayload({...payload, organization: {...payload.organization, website_url: e.target.value}})} className="w-full bg-white/50 border border-[#0B3027]/10 rounded-lg p-2 text-sm" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0B3027] mb-1">Full Name *</label>
              <input type="text" value={payload.contact.full_name} onChange={e => setPayload({...payload, contact: {...payload.contact, full_name: e.target.value}})} className="w-full bg-white/50 border border-[#0B3027]/10 rounded-lg p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0B3027] mb-1">Email Address *</label>
              <input type="email" value={payload.contact.email} onChange={e => setPayload({...payload, contact: {...payload.contact, email: e.target.value}})} className="w-full bg-white/50 border border-[#0B3027]/10 rounded-lg p-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B3027] mb-1">Phone (Optional)</label>
                <input type="text" value={payload.contact.phone} onChange={e => setPayload({...payload, contact: {...payload.contact, phone: e.target.value}})} className="w-full bg-white/50 border border-[#0B3027]/10 rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0B3027] mb-1">Position (Optional)</label>
                <input type="text" value={payload.contact.position} onChange={e => setPayload({...payload, contact: {...payload.contact, position: e.target.value}})} className="w-full bg-white/50 border border-[#0B3027]/10 rounded-lg p-2 text-sm" />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0B3027] mb-1">Workspace Name *</label>
              <input type="text" value={payload.workspace.name} onChange={e => setPayload({...payload, workspace: {...payload.workspace, name: e.target.value}})} className="w-full bg-white/50 border border-[#0B3027]/10 rounded-lg p-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B3027] mb-1">Country *</label>
                <select value={payload.workspace.country} onChange={e => setPayload({...payload, workspace: {...payload.workspace, country: e.target.value, timezone: e.target.value === 'US' ? 'America/New_York' : 'UTC'}})} className="w-full bg-white/50 border border-[#0B3027]/10 rounded-lg p-2 text-sm">
                  <option value="">Select...</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="IN">India</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0B3027] mb-1">Timezone *</label>
                <input type="text" value={payload.workspace.timezone} readOnly className="w-full bg-white/50 border border-[#0B3027]/10 rounded-lg p-2 text-sm opacity-50" />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-3">
            <p className="text-xs text-[#0B3027]/60 mb-2">Select the project templates to provision for this client.</p>
            <div className="grid grid-cols-2 gap-3">
              {templates.map(t => {
                const isSelected = payload.projects.template_ids.includes(t.id);
                return (
                  <button key={t.id} onClick={() => {
                    setPayload(p => ({
                      ...p, 
                      projects: {
                        template_ids: isSelected 
                          ? p.projects.template_ids.filter(id => id !== t.id) 
                          : [...p.projects.template_ids, t.id]
                      }
                    }));
                  }} className={`p-4 rounded-xl border text-left transition-all ${isSelected ? 'bg-[#0B3027] border-[#0B3027] text-white shadow-md' : 'bg-white/50 border-[#0B3027]/10 text-[#0B3027] hover:border-[#C9A56A]/50'}`}>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className={`text-xs mt-1 ${isSelected ? 'text-white/70' : 'text-[#0B3027]/60'}`}>{t.description}</div>
                  </button>
                )
              })}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#0B3027] mb-2">Activation Method</label>
              <select value={payload.activation.method} onChange={e => setPayload({...payload, activation: {...payload.activation, method: e.target.value as any}})} className="w-full bg-white/50 border border-[#0B3027]/10 rounded-lg p-2 text-sm">
                <option value="INVOICE_PAID">Invoice Paid</option>
                <option value="EXECUTIVE_OVERRIDE">Executive Override (Owner Only)</option>
                <option value="INTERNAL_PROJECT">Internal Project</option>
                <option value="MIGRATION">Existing Client Migration</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0B3027] mb-2">Portal Visibility</label>
              <select value={payload.activation.portal_visibility} onChange={e => setPayload({...payload, activation: {...payload.activation, portal_visibility: e.target.value as any}})} className="w-full bg-white/50 border border-[#0B3027]/10 rounded-lg p-2 text-sm">
                <option value="IMMEDIATELY">Immediately</option>
                <option value="AFTER_FIRST_PROJECT_SETUP">After First Project Setup</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-[#0B3027] cursor-pointer">
                <input type="checkbox" checked={payload.activation.invite_now} onChange={e => setPayload({...payload, activation: {...payload.activation, invite_now: e.target.checked}})} className="w-4 h-4 rounded text-[#0B3027] focus:ring-[#0B3027]" />
                Send Welcome Email & Invitation Now
              </label>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/50 border border-[#0B3027]/10 space-y-3">
              <div><span className="text-xs text-[#0B3027]/60 uppercase tracking-wider font-bold">Organization</span><div className="font-semibold text-[#0B3027]">{payload.organization.name}</div></div>
              <div><span className="text-xs text-[#0B3027]/60 uppercase tracking-wider font-bold">Primary Contact</span><div className="font-semibold text-[#0B3027]">{payload.contact.full_name} ({payload.contact.email})</div></div>
              <div><span className="text-xs text-[#0B3027]/60 uppercase tracking-wider font-bold">Workspace</span><div className="font-semibold text-[#0B3027]">{payload.workspace.name} ({payload.workspace.country})</div></div>
              <div><span className="text-xs text-[#0B3027]/60 uppercase tracking-wider font-bold">Projects to Provision</span><div className="font-semibold text-[#0B3027]">{payload.projects.template_ids.length} Templates Selected</div></div>
              <div><span className="text-xs text-[#0B3027]/60 uppercase tracking-wider font-bold">Activation</span><div className="font-semibold text-[#0B3027]">{payload.activation.method.replace('_', ' ')}</div></div>
            </div>
          </div>
        );
    }
  };

  const canProceed = () => {
    if (step === 1) return payload.organization.name && payload.organization.business_category;
    if (step === 2) return payload.contact.full_name && payload.contact.email;
    if (step === 3) return payload.workspace.name && payload.workspace.country;
    if (step === 4) return payload.projects.template_ids.length > 0;
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#F8F6F1] rounded-3xl shadow-2xl overflow-hidden border border-[#0B3027]/10">
        <div className="p-6 border-b border-[#0B3027]/10 flex items-center justify-between bg-white/50">
          <div>
            <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">Activate Client</h2>
            <p className="text-xs text-[#0B3027]/60 mt-1">Enterprise multi-tenant provisioning</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#0B3027]/5 rounded-full transition-colors"><X className="w-5 h-5 text-[#0B3027]" /></button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-48 bg-white/30 border-r border-[#0B3027]/5 p-4 space-y-1">
            {steps.map(s => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isPast = step > s.num;
              return (
                <div key={s.num} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? 'bg-[#0B3027] text-white shadow-md' : isPast ? 'text-[#0B3027] bg-white/50' : 'text-[#0B3027]/40'}`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-bold">{s.title}</span>
                </div>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-[400px]">
            <div className="flex-1 p-8">
              {renderStep()}
            </div>
            
            <div className="p-6 bg-white/50 border-t border-[#0B3027]/5 flex justify-between">
              <button onClick={prevStep} disabled={step === 1 || isSubmitting} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#0B3027] hover:bg-[#0B3027]/5 rounded-lg transition-colors ${step === 1 ? 'opacity-0' : ''}`}>
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              
              {step < 6 ? (
                <button onClick={nextStep} disabled={!canProceed()} className="flex items-center gap-2 px-6 py-2 bg-[#0B3027] text-white text-sm font-bold rounded-lg hover:bg-[#0E3A2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 bg-[#C9A56A] text-white text-sm font-bold rounded-lg hover:bg-[#B89459] transition-colors disabled:opacity-50 shadow-md">
                  {isSubmitting ? 'Provisioning...' : 'Provision Client'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
