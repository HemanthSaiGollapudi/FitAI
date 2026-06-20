import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, AlertTriangle, ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  primaryUrl: string;
  backupUrl: string;
  title: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Global script loading state
let isScriptLoaded = false;
const loadYouTubeAPI = () => {
  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }
  return new Promise<any>((resolve) => {
    if (isScriptLoaded) {
      const checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          resolve(window.YT);
        }
      }, 100);
      return;
    }

    isScriptLoaded = true;
    const tag = document.createElement('script');
    tag.id = 'youtube-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    const oldReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (oldReady) oldReady();
      resolve(window.YT);
    };
  });
};

// Strict list of approved video IDs from Jeff Nippard and Jeremy Ethier
const APPROVED_VIDEO_IDS = [
  'vcBig73ojpE', // Bench Press (Jeff Nippard)
  'fGm-ef-4PVk', // Chest compilation (Jeff Nippard)
  'gcNh17Ckjgg', // Squat (Jeremy Ethier)
  'ZaTM37cfiDs', // Deadlift (Jeff Nippard)
  'XxWcirHIwVo', // Deadlift (Jeremy Ethier)
  'kBWAon7ItDw', // Barbell Row (Jeremy Ethier)
  'jLvqKgW-_G8', // Back compilation (Jeff Nippard)
  'syS4M1G-rII', // Pull-ups (Jeremy Ethier)
  '_RlRDWO2jfg', // Overhead Press (Jeff Nippard)
  'SgyUoY0IZ7A', // Shoulders compilation (Jeff Nippard)
  'GNO4OtYoCYk', // Biceps compilation (Jeff Nippard)
  'lp6Mx6rCifA', // Biceps compilation backup (Jeremy Ethier)
  '9BH4GAiqEpg', // Biceps width (Jeremy Ethier)
  '20ibpB635Rw', // Biceps dumbbell (Jeremy Ethier)
  'OpRMRhr0Ycc', // Triceps compilation (Jeff Nippard)
  'osUnjgwoh_Y', // Triceps compilation backup (Jeremy Ethier)
  'tmgfpdpQ5sk', // Triceps exercises (Jeremy Ethier)
  'kIXcoivzGf8', // Quads (Jeff Nippard)
  'hRZ5MM6gmlE', // Legs compilation (Jeff Nippard)
  'Y4Vv2ASsyhs', // Legs compilation backup (Jeff Nippard)
  'QdIutxfm_hU', // Abs compilation (Jeremy Ethier)
  'JC2jw2HobIc', // Abs backup (Jeremy Ethier)
  'sOuKeVuej9E', // Flexibility (Jeremy Ethier)
  'E81GN-3A8XM', // Warm Up / Mobility (Jeff Nippard)
  '-MRNjTr6xrE', // Calisthenics (Jeff Nippard)
  '95846CBGU0M', // Calisthenics backup (Jeremy Ethier)
  'hJh4ze7s3GQ', // Calisthenics jacked (Jeremy Ethier)
  'SvqDGLT21sg', // Calisthenics methods (Jeremy Ethier)
  'b6ouj88iBZs', // Push workout (Jeff Nippard)
  'LwHoNk-sjgs'  // Push science (Jeff Nippard)
];

// Validation Helper
export const validateVideoUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  if (!url.startsWith('https://www.youtube.com/') && !url.startsWith('https://youtu.be/')) return false;
  
  let videoId = '';
  try {
    if (url.startsWith('https://youtu.be/')) {
      const match = url.match(/youtu\.be\/([^/?]+)/);
      videoId = match ? match[1] : '';
    } else {
      const matchV = url.match(/v=([^&]+)/);
      const matchEmbed = url.match(/\/embed\/([^/?]+)/);
      const matchShorts = url.match(/\/shorts\/([^/?]+)/);
      videoId = matchV ? matchV[1] : (matchEmbed ? matchEmbed[1] : (matchShorts ? matchShorts[1] : ''));
    }
  } catch (e) {
    return false;
  }
  return APPROVED_VIDEO_IDS.includes(videoId);
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ primaryUrl, backupUrl, title }) => {
  const isPrimaryValid = validateVideoUrl(primaryUrl);
  const isBackupValid = validateVideoUrl(backupUrl);
  const hasValidVideo = isPrimaryValid || isBackupValid;

  const [useBackup, setUseBackup] = useState(!isPrimaryValid && isBackupValid);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoadFailed, setVideoLoadFailed] = useState(false);
  
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstance = useRef<any>(null);

  const activeUrl = useBackup ? backupUrl : primaryUrl;

  const getYouTubeId = (url: string) => {
    try {
      if (url.startsWith('https://youtu.be/')) {
        const match = url.match(/youtu\.be\/([^/?]+)/);
        return match ? match[1] : '';
      }
      const matchV = url.match(/v=([^&]+)/);
      const matchEmbed = url.match(/\/embed\/([^/?]+)/);
      const matchShorts = url.match(/\/shorts\/([^/?]+)/);
      return matchV ? matchV[1] : (matchEmbed ? matchEmbed[1] : (matchShorts ? matchShorts[1] : ''));
    } catch {
      return '';
    }
  };

  const videoId = getYouTubeId(activeUrl);
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%231a1a22"%3E%3Crect width="100" height="100"/%3E%3C/svg%3E';

  // Instantiate YouTube Player
  useEffect(() => {
    if (!isPlaying || !videoId || videoLoadFailed || !hasValidVideo) return;

    let destroyed = false;
    loadYouTubeAPI().then((YT) => {
      if (destroyed || !playerRef.current) return;

      try {
        playerInstance.current = new YT.Player(playerRef.current, {
          videoId: videoId,
          playerVars: { 
            autoplay: 1, 
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin
          },
          events: {
            onError: (event: any) => {
              console.warn(`YouTube Player error (${event.data}) for ID: ${videoId}`);
              if ([2, 5, 100, 101, 150].includes(event.data)) {
                if (!useBackup && isBackupValid) {
                  console.info(`Primary video failed. Trying backup video...`);
                  setUseBackup(true);
                } else {
                  console.error(`Backup video failed as well. Demo video unavailable.`);
                  setVideoLoadFailed(true);
                }
              }
            }
          }
        });
      } catch (err) {
        console.error("Failed to construct YouTube player:", err);
        if (!useBackup && isBackupValid) {
          setUseBackup(true);
        } else {
          setVideoLoadFailed(true);
        }
      }
    });

    return () => {
      destroyed = true;
      if (playerInstance.current && typeof playerInstance.current.destroy === 'function') {
        try {
          playerInstance.current.destroy();
        } catch (e) {
          // ignore destroy errors
        }
        playerInstance.current = null;
      }
    };
  }, [isPlaying, videoId, useBackup, videoLoadFailed, hasValidVideo, isBackupValid]);

  const handleExternalWatch = () => {
    if (!hasValidVideo) return;
    const id = getYouTubeId(activeUrl);
    const watchUrl = `https://www.youtube.com/watch?v=${id}`;
    console.log("Opening video:", title, watchUrl);
    window.open(watchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/5 bg-dark-950 flex flex-col justify-between group">
      
      {!hasValidVideo ? (
        // Premium placeholder for "Demo video coming soon."
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 bg-dark-900/90 text-center space-y-3 z-20">
          <AlertTriangle className="h-8 w-8 text-zinc-500" />
          <h4 className="text-sm font-bold text-white">Demo Video Coming Soon</h4>
          <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
            Our team is preparing high-quality technique tutorials by Jeff Nippard and Jeremy Ethier for this movement.
          </p>
        </div>
      ) : videoLoadFailed ? (
        // Error state: "Demo video temporarily unavailable."
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 bg-dark-900/90 border border-red-500/20 text-center space-y-3 z-20">
          <AlertTriangle className="h-10 w-10 text-red-400" />
          <h4 className="text-sm font-bold text-white">Demo video temporarily unavailable.</h4>
          <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
            Both the primary and backup demonstration links encountered a playback error. You can still watch the tutorial directly.
          </p>
          <button
            onClick={handleExternalWatch}
            className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:border-brand-cyan hover:bg-brand-cyan/10 rounded-lg text-xs font-bold text-brand-cyan hover:text-white transition-all flex items-center gap-1.5"
          >
            Watch on YouTube <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      ) : !isPlaying ? (
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
          <div className="relative z-10 flex flex-col items-center gap-2">
            <button
              onClick={() => setIsPlaying(true)}
              className="p-4 rounded-full bg-gradient-to-r from-brand-violet to-brand-cyan text-white shadow-glow-purple hover:scale-110 transition-transform flex items-center justify-center"
              aria-label="Play video"
            >
              <Play className="h-6 w-6 fill-current ml-0.5" />
            </button>
            <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider bg-dark-950/80 px-2 py-0.5 rounded">
              Play Demo
            </span>
          </div>
        </div>
      ) : (
        // Iframe Player element container
        <div className="absolute inset-0 w-full h-full object-cover z-0">
          <div ref={playerRef} className="w-full h-full" />
        </div>
      )}

      {/* Backup Mirror controller bar overlay (always visible on hover or during play) */}
      {hasValidVideo && !videoLoadFailed && (
        <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-dark-950/90 backdrop-blur border border-white/5 px-3 py-1.5 rounded-lg">
          <div className="flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            <span className="text-[9px] text-zinc-400 font-semibold">Video error?</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Switch Backup */}
            {isPrimaryValid && isBackupValid && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUseBackup(!useBackup);
                }}
                className="flex items-center gap-1 text-[9px] font-black text-brand-cyan hover:underline bg-white/5 px-2 py-1 rounded"
              >
                <RotateCcw className="h-2.5 w-2.5" /> {useBackup ? "Standard Mirror" : "Switch Backup Video"}
              </button>
            )}

            {/* Launch external */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleExternalWatch();
              }}
              className="p-1 bg-white/5 hover:bg-white/10 rounded text-zinc-400 hover:text-white"
              title="Open on YouTube"
            >
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
