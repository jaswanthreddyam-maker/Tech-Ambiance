import React, { useState, useRef, useEffect } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { mediaRepository, type MediaAsset } from '../../repositories/mediaRepository';
import { ActionButton } from '../../components/admin/ActionButton';

// Default mock assets (shown when no Supabase connection or no uploaded assets)
const DEFAULT_ASSETS: MediaAsset[] = [
  {
    id: 'mock-1',
    name: 'luxury-hero-bg.webp',
    storage_key: 'r2://techambiance-assets/luxury-hero-bg.webp',
    size: '248 KB',
    type: 'IMAGE (WEBP)',
    uploaded_at: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    name: 'cafevistaara-logo-gold.svg',
    storage_key: 'r2://techambiance-assets/cafevistaara-logo-gold.svg',
    size: '18 KB',
    type: 'LOGO VECTOR',
    uploaded_at: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    name: 'brand-showreel-4k.mp4',
    storage_key: 'r2://techambiance-assets/brand-showreel-4k.mp4',
    size: '14.2 MB',
    type: 'VIDEO EDGE ASSET',
    uploaded_at: new Date().toISOString(),
  },
];

export const MediaPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<MediaAsset[]>(DEFAULT_ASSETS);
  const [isUploading, setIsUploading] = useState(false);

  // Try to load real assets from storage on mount
  useEffect(() => {
    mediaRepository.listAssets().then(remoteAssets => {
      if (remoteAssets.length > 0) {
        setAssets(remoteAssets);
      }
    });
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await mediaRepository.uploadAsset(file);
      if (uploaded) {
        setAssets(prev => [uploaded, ...prev]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload asset. Check console for details.');
    } finally {
      setIsUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.svg,.pdf"
            onChange={handleFileSelected}
            className="hidden"
          />
          <ActionButton
            actionId="media.upload"
            onAction={handleUploadClick}
            disabled={isUploading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B3027] hover:bg-[#0E3A2F] text-white font-semibold text-xs shadow-[0_4px_16px_rgba(11,48,39,0.25)] transition-all disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-[#C9A56A]" />
                <span>+ Upload Edge Asset</span>
              </>
            )}
          </ActionButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <div
            key={asset.id}
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
              {asset.storage_key}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
