import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export const AiCenterPage: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('https://cafevistaara.com');

  // ScoutAI scanning engine is not yet deployed — button is intentionally disabled
  const isScoutAvailable = false;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="pb-6 border-b border-[#0B3027]/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#C9A56A]" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#9A7B4F]">
            Autonomous Diagnostic Command Center
          </span>
        </div>
        <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027] mt-1">
          ScoutAI Audit & SOW Generator
        </h1>
      </div>

      <div className="p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/30 shadow-[0_8px_30px_rgba(11,48,39,0.06)] space-y-6">
        <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">
          Run Autonomous Diagnostic Scan (`POST /api/v1/ai/scout/scan`)
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="Enter target website URL..."
            className="flex-1 px-5 py-3.5 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/15 text-sm font-medium text-[#0B3027] focus:outline-none focus:border-[#C9A56A] shadow-inner"
          />
          <div className="relative group">
            <button
              disabled={!isScoutAvailable}
              className="px-6 py-3.5 rounded-full bg-[#0B3027] text-white font-semibold text-xs shadow-[0_4px_16px_rgba(11,48,39,0.25)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isScoutAvailable ? 'Execute ScoutAI Scan →' : 'ScoutAI — Coming Soon'}
            </button>
            {!isScoutAvailable && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2.5 bg-[#0B3027] text-[#F8F6F1] text-xs rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-[#C9A56A]/30">
                ScoutAI scanning will become available after the scanning engine is deployed.
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0B3027] rotate-45 -mt-1" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          <div className="p-5 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/10 space-y-1.5 shadow-sm">
            <div className="text-[10px] font-mono font-bold text-[#9A7B4F]">
              TELEMETRY MODULE 1
            </div>
            <div className="text-sm font-bold text-[#0B3027]">
              WCAG AA Accessibility Audit
            </div>
            <div className="text-xs text-[#0B3027]/50 font-mono font-bold italic">AWAITING ENGINE DEPLOYMENT</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/10 space-y-1.5 shadow-sm">
            <div className="text-[10px] font-mono font-bold text-[#9A7B4F]">
              TELEMETRY MODULE 2
            </div>
            <div className="text-sm font-bold text-[#0B3027]">
              Lighthouse Core Web Vitals
            </div>
            <div className="text-xs text-[#0B3027]/50 font-mono font-bold italic">AWAITING ENGINE DEPLOYMENT</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#0B3027] text-[#F8F6F1] border border-[#C9A56A]/30 space-y-1.5 shadow-md">
            <div className="text-[10px] font-mono font-bold text-[#C9A56A]">
              TELEMETRY MODULE 3
            </div>
            <div className="text-sm font-bold text-[#F8F6F1]">
              SOW Executive Summary AI
            </div>
            <div className="text-xs text-[#C9A56A]/70 font-mono font-bold italic">AWAITING ENGINE DEPLOYMENT</div>
          </div>
        </div>
      </div>
    </div>
  );
};
