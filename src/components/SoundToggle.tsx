import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSoundSettings } from "@/contexts/SoundSettingsContext";
import { useT } from "@/i18n";

/** Turns all sound effects on or off. The choice is remembered in this browser. */
export const SoundToggle = () => {
  const { soundEnabled, toggleSound } = useSoundSettings();
  const t = useT();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSound}
      aria-pressed={!soundEnabled}
      aria-label={soundEnabled ? t("sound.mute") : t("sound.unmute")}
    >
      {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </Button>
  );
};
