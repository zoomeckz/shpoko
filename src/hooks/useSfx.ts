import { useMemo } from "react";
import { useSoundSettings } from "@/contexts/SoundSettingsContext";
import { sfx, type Sfx } from "@/lib/sfx";

const silent = Object.fromEntries(Object.keys(sfx).map((k) => [k, () => {}])) as unknown as Sfx;

/** Sound effects that respect the user's sound on/off setting. */
export const useSfx = (): Sfx => {
  const { soundEnabled } = useSoundSettings();
  return useMemo(() => (soundEnabled ? sfx : silent), [soundEnabled]);
};
