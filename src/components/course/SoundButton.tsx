import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SHOW_SOUND_BUTTONS } from "@/config/features";

interface SoundButtonProps {
  src?: string;
  size?: "sm" | "lg";
  className?: string;
}

/** Plays a recorded clip. Renders nothing until sound buttons are switched on. */
export function SoundButton({ src, size = "lg", className }: SoundButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => audioRef.current?.pause(), []);

  if (!SHOW_SOUND_BUTTONS || !src) return null;

  const play = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioRef.current?.pause();
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
    setPlaying(true);
    audio.play().catch(() => setPlaying(false));
  };

  return (
    <button
      type="button"
      onClick={play}
      aria-label="Play sound"
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_4px_0_0_hsl(var(--primary-dark))] transition-transform active:translate-y-1 active:shadow-none",
        size === "lg" ? "w-14 h-14" : "w-9 h-9 rounded-xl",
        playing && "brightness-110",
        className
      )}
    >
      <Volume2 className={size === "lg" ? "w-7 h-7" : "w-5 h-5"} />
    </button>
  );
}
