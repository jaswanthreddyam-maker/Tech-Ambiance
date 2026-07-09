import React from 'react';

export const MediaPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="pb-6 border-b border-[#0B3027]/10 flex items-center justify-between">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027]">
            Universal CDN Media Vault
          </h1>
          <p className="text-sm text-[#0B3027]/70 mt-1">
            Cloudflare R2 Object Storage (`storage_key: r2://bucket/key`) connected to global edge CDN.
          </p>
        </div>
        <button className="px-5 py-2.5 rounded-full bg-[#0B3027] hover:bg-[#0E3A2F] text-white font-semibold text-xs shadow-[0_4px_16px_rgba(11,48,39,0.25)] transition-all">
          + Upload Edge Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            name: 'luxury-hero-bg.webp',
            storageKey: 'r2://techambiance-assets/luxury-hero-bg.webp',
            size: '248 KB',
            type: 'IMAGE (WEBP)',
          },
          {
            name: 'cafevistaara-logo-gold.svg',
            storageKey: 'r2://techambiance-assets/cafevistaara-logo-gold.svg',
            size: '18 KB',
            type: 'LOGO VECTOR',
          },
          {
            name: 'brand-showreel-4k.mp4',
            storageKey: 'r2://techambiance-assets/brand-showreel-4k.mp4',
            size: '14.2 MB',
            type: 'VIDEO EDGE ASSET',
          },
        ].map((asset, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 space-y-3.5 shadow-[0_8px_30px_rgba(11,48,39,0.06)] hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#C9A56A]/15 text-[#9A7B4F]">
                {asset.type}
              </span>
              <span className="text-xs text-[#0B3027]/60 font-mono font-semibold">{asset.size}</span>
            </div>
            <div className="font-['Cormorant_Garamond'] font-bold text-xl text-[#0B3027]">
              {asset.name}
            </div>
            <div className="text-[11px] font-mono text-[#0B3027] break-all bg-[#F8F6F1] p-3 rounded-xl border border-[#0B3027]/10">
              {asset.storageKey}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
