import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface MediaAsset {
  id: string;
  name: string;
  storage_key: string;
  size: string;
  type: string;
  uploaded_at: string;
  public_url?: string;
}

const BUCKET = 'media-vault';

export const mediaRepository = {
  /**
   * Upload an asset to the media storage bucket.
   * All uploads go through this repository — UI stays ignorant of Supabase Storage.
   */
  async uploadAsset(file: File): Promise<MediaAsset | null> {
    if (!isSupabaseConfigured) return null;

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const storagePath = `assets/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { upsert: false });

    if (uploadError) {
      console.error('[mediaRepository] uploadAsset error:', uploadError.message);
      throw uploadError;
    }

    // Build public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatType = (ext: string): string => {
      const typeMap: Record<string, string> = {
        webp: 'IMAGE (WEBP)', png: 'IMAGE (PNG)', jpg: 'IMAGE (JPG)', jpeg: 'IMAGE (JPEG)',
        gif: 'GIF ANIMATION', svg: 'LOGO VECTOR',
        mp4: 'VIDEO EDGE ASSET', mov: 'VIDEO EDGE ASSET', webm: 'VIDEO (WEBM)',
        pdf: 'DOCUMENT (PDF)',
      };
      return typeMap[ext] || `FILE (${ext.toUpperCase()})`;
    };

    return {
      id: `asset-${Date.now()}`,
      name: file.name,
      storage_key: `r2://${BUCKET}/${storagePath}`,
      size: formatFileSize(file.size),
      type: formatType(fileExt),
      uploaded_at: new Date().toISOString(),
      public_url: urlData?.publicUrl,
    };
  },

  /**
   * List all assets from the media storage bucket.
   */
  async listAssets(): Promise<MediaAsset[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list('assets', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

    if (error) {
      console.error('[mediaRepository] listAssets error:', error.message);
      return [];
    }

    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (data || []).map(item => {
      const ext = item.name.split('.').pop()?.toLowerCase() || '';
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(`assets/${item.name}`);
      
      return {
        id: item.id || item.name,
        name: item.name,
        storage_key: `r2://${BUCKET}/assets/${item.name}`,
        size: formatFileSize(item.metadata?.size || 0),
        type: ext.toUpperCase(),
        uploaded_at: item.created_at || new Date().toISOString(),
        public_url: urlData?.publicUrl,
      };
    });
  },
};
