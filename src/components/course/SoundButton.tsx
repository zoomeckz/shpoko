import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { playSpeech, speechSrc, stopSpeech } from "@/lib/speech";
import { useT } from "@/i18n";

interface SoundButtonProps {
  /** The Bulgarian to say. No button when there's no clip for it. */
  text?: string;
  size?: "sm" | "lg";
  className?: string;
}

/** Says a piece of Bulgarian out loud from its recorded clip. */
export function SoundButton({ text, size = "lg", className }: SoundButtonProps) {
  const [playing, setPlaying] = useState(false);
  const t = useT();

  useEffect(() => () => {
    if (playing) stopSpeech();
  }, [playing]);

  if (!speechSrc(text)) return null;

  const play = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaying(playSpeech(text, () => setPlaying(false)));
  };

  return (
    <button
      type="button"
      onClick={play}
      aria-label={t("sound.play")}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_4px_0_0_hsl(var(--primary-dark))] transition-transform active:translate-y-1 active:shadow-none",
        size === "lg" ? "w-14 h-14" : "w-9 h-9 rounded-xl",
        playing && "brightness-110",
        className
      )}
    >
      <Volume2 className={cn(size === "lg" ? "w-7 h-7" : "w-5 h-5", playing && "animate-pulse")} />
    </button>
  );
}
