import { Volume2, VolumeX, SkipBack, SkipForward, Play, Pause, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useRadio } from '@/hooks/useRadio';
import { useState } from 'react';

export function RadioUI() {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    toggle,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute
  } = useRadio();

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className={`bg-card/95 backdrop-blur-sm border rounded-lg shadow-lg transition-all duration-300 ${
        isExpanded ? 'w-64 p-4' : 'w-12 h-12'
      }`}>
        {!isExpanded ? (
          <Button
            variant="ghost"
            size="icon"
            className="w-full h-full"
            onClick={() => setIsExpanded(true)}
          >
            <Radio className="h-5 w-5" />
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Radio className="h-4 w-4 text-primary" />
                Radio
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                ×
              </Button>
            </div>

            {currentTrack ? (
              <div className="text-xs text-muted-foreground truncate">
                {currentTrack.title}
                {currentTrack.artist && ` - ${currentTrack.artist}`}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Няма налични песни
              </div>
            )}

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={prevTrack}
                disabled={!currentTrack}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={toggle}
                disabled={!currentTrack}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={nextTrack}
                disabled={!currentTrack}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={([v]) => setVolume(v / 100)}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
