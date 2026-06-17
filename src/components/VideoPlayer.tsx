import React, { useState } from 'react';
import { Play, RotateCcw, AlertTriangle, ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  primaryUrl: string;
  backupUrl: string;
  title: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ primaryUrl, backupUrl, title }) => {
  const [useBackup, setUseBackup] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeUrl = useBackup ? backupUrl : primaryUrl;

  // Extract ID for thumbnail preview placeholder
  const getYouTubeId = (url: string) => {
    try {
      const match = url.match(/\/embed\/([^/?]+)/) || url.match(/v=([^&]+)/);
      return match ? match[1] : '';
    } catch {
      return '';
    }
  };

  const videoId = getYouTubeId(activeUrl);
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%231a1a22"%3E%3Crect width="100" height="100"/%3E%3C/svg%3E';

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/5 bg-dark-950 flex flex-col justify-between group">
      
      {!isPlaying ? (
        // Preview Thumbnail state
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          <img 
            src={thumbnailUrl} 
            alt={`${title} Preview`}
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%231a1a22"%3E%3Crect width="100" height="100"/%3E%3C/svg%3E';
            }}
          />
          <div className="absolute inset-0 bg-dark-950/40 group-hover:bg-dark-950/20 transition-colors" />
          
          {/* Play Overlay trigger */}
          <button
            onClick={() => setIsPlaying(true)}
            className="relative p-4 rounded-full bg-gradient-to-r from-brand-violet to-brand-cyan text-white shadow-glow-purple hover:scale-110 transition-transform z-10 flex items-center justify-center"
          >
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </button>
        </div>
      ) : (
        // Iframe Player state
        <iframe
          src={`${activeUrl}?autoplay=1&rel=0`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      {/* Backup Mirror controller bar overlay (always visible on hover or during play) */}
      <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-dark-950/90 backdrop-blur border border-white/5 px-3 py-1.5 rounded-lg">
        <div className="flex items-center space-x-1">
          <AlertTriangle className="h-3 w-3 text-amber-400" />
          <span className="text-[9px] text-zinc-400 font-semibold">Video error?</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch Backup */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setUseBackup(!useBackup);
            }}
            className="flex items-center gap-1 text-[9px] font-black text-brand-cyan hover:underline bg-white/5 px-2 py-1 rounded"
          >
            <RotateCcw className="h-2.5 w-2.5" /> {useBackup ? "Standard Mirror" : "Switch Backup Video"}
          </button>

          {/* Launch external */}
          <a
            href={activeUrl.replace('embed/', 'watch?v=')}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 bg-white/5 hover:bg-white/10 rounded text-zinc-400 hover:text-white"
            title="Open on YouTube"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
