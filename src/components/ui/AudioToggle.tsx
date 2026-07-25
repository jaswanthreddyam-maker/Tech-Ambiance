import React, { useState } from 'react';
import { VolumeX } from 'lucide-react';
import { AmbientAudioEngine } from '../../audio/AmbientAudioEngine';

interface AudioToggleProps {
  className?: string;
}

export const AudioToggle: React.FC<AudioToggleProps> = ({ className = '' }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleToggle = () => {
    const engine = AmbientAudioEngine.getInstance();
    const active = engine.toggle();
    setIsPlaying(active);
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest/90 text-gold border border-gold/30 hover:border-gold text-[10px] uppercase tracking-widest font-bold transition-all shadow-sm ${className}`}
      title={isPlaying ? 'Mute Studio Ambient Audio' : 'Enable Studio Ambient Audio'}
      aria-label="Toggle ambient studio audio"
    >
      {isPlaying ? (
        <>
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 bg-gold h-3 animate-pulse" />
            <span className="w-0.5 bg-gold h-2 animate-pulse delay-75" />
            <span className="w-0.5 bg-gold h-3.5 animate-pulse delay-150" />
          </div>
          <span>Audio On</span>
        </>
      ) : (
        <>
          <VolumeX className="w-3 h-3 text-gold/70" />
          <span>Audio Off</span>
        </>
      )}
    </button>
  );
};
export default AudioToggle;
