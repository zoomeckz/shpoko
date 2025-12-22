import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LanguageMode = 'bulgarian' | 'spanish' | 'swedish';

interface LanguageModeContextType {
  languageMode: LanguageMode;
  setLanguageMode: (mode: LanguageMode) => void;
  // UI language (what the interface shows)
  uiLanguage: 'english' | 'bulgarian' | 'swedish';
  // Target language (what user is learning)
  targetLanguage: 'bulgarian' | 'spanish';
}

const LanguageModeContext = createContext<LanguageModeContextType | undefined>(undefined);

export const LanguageModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [languageMode, setLanguageModeState] = useState<LanguageMode>(() => {
    const saved = localStorage.getItem('languageMode');
    return (saved as LanguageMode) || 'bulgarian';
  });

  const setLanguageMode = (mode: LanguageMode) => {
    setLanguageModeState(mode);
    localStorage.setItem('languageMode', mode);
  };

  // When learning Bulgarian (English UI): UI is English, target is Bulgarian
  // When learning Spanish (Bulgarian UI): UI is Bulgarian, target is Spanish  
  // When learning Bulgarian (Swedish UI): UI is Swedish, target is Bulgarian
  const uiLanguage = languageMode === 'bulgarian' ? 'english' : 
                     languageMode === 'swedish' ? 'swedish' : 'bulgarian';
  const targetLanguage = languageMode === 'spanish' ? 'spanish' : 'bulgarian';

  return (
    <LanguageModeContext.Provider value={{ 
      languageMode, 
      setLanguageMode, 
      uiLanguage, 
      targetLanguage 
    }}>
      {children}
    </LanguageModeContext.Provider>
  );
};

export const useLanguageMode = (): LanguageModeContextType => {
  const context = useContext(LanguageModeContext);
  if (!context) {
    throw new Error('useLanguageMode must be used within a LanguageModeProvider');
  }
  return context;
};
