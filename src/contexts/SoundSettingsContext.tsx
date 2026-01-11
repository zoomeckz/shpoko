import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SoundSettingsContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
}

const SoundSettingsContext = createContext<SoundSettingsContextType | undefined>(undefined);

const STORAGE_KEY = "shpoko-sound-enabled";

export const SoundSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "true";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(soundEnabled));
  }, [soundEnabled]);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
  };

  const toggleSound = () => {
    setSoundEnabledState(prev => !prev);
  };

  return (
    <SoundSettingsContext.Provider value={{ soundEnabled, setSoundEnabled, toggleSound }}>
      {children}
    </SoundSettingsContext.Provider>
  );
};

export const useSoundSettings = () => {
  const context = useContext(SoundSettingsContext);
  if (context === undefined) {
    throw new Error("useSoundSettings must be used within a SoundSettingsProvider");
  }
  return context;
};
