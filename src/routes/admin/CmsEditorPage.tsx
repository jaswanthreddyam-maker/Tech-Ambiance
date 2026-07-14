import React, { useState } from 'react';
import { Globe, RotateCcw, Send, History, CheckCircle } from 'lucide-react';
import { ActionButton } from '../../components/admin/ActionButton';

export const CmsEditorPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'hero' | 'services' | 'portfolio'>('hero');
  const [publishingStatus, setPublishingStatus] = useState<'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED'>('REVIEW');
  const [mainHeading, setMainHeading] = useState(
    'We architect digital flagships that command authority.'
  );
  const [highlightedWord, setHighlightedWord] = useState('authority');
  const [subtitle, setSubtitle] = useState(
    'Bespoke software engineering and cinematic brand experiences built for luxury market leaders.'
  );

  const previousV1Heading = 'We build digital flagships that command authority.';

  const handleRollback = () => {
    if (!confirm('Are you sure you want to rollback to v1? Any unsaved changes will be lost.')) return;
    setMainHeading(previousV1Heading);
    setPublishingStatus('DRAFT');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title & Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#0B3027]/10">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#C9A56A]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#9A7B4F] font-bold">
              Website Engine CMS • Schema Version v2
            </span>
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027] mt-1">
            Section Snapshot Editor & Diff Manager
          </h1>
        </div>

        {/* Workflow State Selector & Actions */}
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-[#C9A56A]/15 border border-[#C9A56A]/35 text-xs font-mono font-bold text-[#9A7B4F]">
            Status: {publishingStatus}
          </span>
          <ActionButton
            actionId="cms.rollback"
            onAction={handleRollback}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-white/80 border border-[#0B3027]/15 text-xs font-semibold text-[#0B3027] shadow-sm transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C9A56A]" />
            <span>Rollback to v1</span>
          </ActionButton>
          <ActionButton
            actionId="cms.publish"
            onAction={async () => setPublishingStatus('PUBLISHED')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B3027] hover:bg-[#0E3A2F] text-white font-semibold text-xs shadow-[0_4px_16px_rgba(11,48,39,0.25)] transition-all"
          >
            <Send className="w-3.5 h-3.5 text-[#C9A56A]" />
            <span>Publish Snapshot (Live Cutover)</span>
          </ActionButton>
        </div>
      </div>

      {/* Section Selector Tabs */}
      <div className="flex items-center gap-3">
        {[
          { id: 'hero', label: 'Marketing Hero Section' },
          { id: 'services', label: 'Services Pillars' },
          { id: 'portfolio', label: 'Flagship Portfolio Carousel' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
              activeSection === tab.id
                ? 'bg-[#0B3027] text-[#F8F6F1] shadow-md'
                : 'bg-white text-[#0B3027]/70 hover:text-[#0B3027] border border-[#0B3027]/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Split Screen Editor: Left Form Fields vs Right Diff Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Form Field Editor (Draft v2) */}
        <div className="p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#0B3027]/10">
            <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">
              Content Snapshot (Draft v2)
            </h2>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              Auto-saves to Outbox
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#9A7B4F] mb-2 uppercase tracking-wider">
                Main Heading Text
              </label>
              <textarea
                rows={2}
                value={mainHeading}
                onChange={(e) => setMainHeading(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/15 text-[#0B3027] text-sm font-medium focus:outline-none focus:border-[#C9A56A] shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9A7B4F] mb-2 uppercase tracking-wider">
                Highlighted Word (Gold Accent)
              </label>
              <input
                type="text"
                value={highlightedWord}
                onChange={(e) => setHighlightedWord(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/15 text-[#0B3027] text-sm font-medium focus:outline-none focus:border-[#C9A56A] shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9A7B4F] mb-2 uppercase tracking-wider">
                Subtitle Description
              </label>
              <textarea
                rows={3}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/15 text-[#0B3027] text-sm font-medium focus:outline-none focus:border-[#C9A56A] shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Right Version Comparison Diff Inspector */}
        <div className="p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#0B3027]/10">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#C9A56A]" />
              <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">
                Snapshot Version Comparison Diff (v1 to v2)
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              SCHEMA_V1 COMPATIBLE
            </span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="p-5 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/10 space-y-3 shadow-sm">
              <div className="text-[11px] font-bold text-[#9A7B4F] mb-1">
                DIFF: MAIN HEADING
              </div>
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-800 font-medium">
                - We build digital flagships that command authority.
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-600/30 text-emerald-900 font-bold">
                + {mainHeading}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/10 space-y-3 shadow-sm">
              <div className="text-[11px] font-bold text-[#9A7B4F] mb-1">
                DIFF: HIGHLIGHTED WORD
              </div>
              <div className="p-3 rounded-xl bg-white text-[#0B3027]/80">
                = "{highlightedWord}" (UNCHANGED)
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B3027] text-[#F8F6F1] border border-[#C9A56A]/30 flex items-start gap-3.5 shadow-md">
            <CheckCircle className="w-5 h-5 text-[#C9A56A] shrink-0 mt-0.5" />
            <div className="text-xs text-[#F8F6F1]/90 leading-relaxed">
              Publishing this snapshot triggers an immediate zero-downtime cache invalidation event (`website.published`) on Cloudflare CDN edge nodes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
