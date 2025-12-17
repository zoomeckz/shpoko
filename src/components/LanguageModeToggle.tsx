import React from 'react';
import { useLanguageMode } from '@/contexts/LanguageModeContext';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

const LanguageModeToggle: React.FC = () => {
  const { languageMode, setLanguageMode, uiLanguage } = useLanguageMode();

  const toggleMode = () => {
    setLanguageMode(languageMode === 'bulgarian' ? 'spanish' : 'bulgarian');
  };

  const labels = {
    bulgarian: {
      current: 'Learning Bulgarian',
      switch: 'Switch to Spanish'
    },
    spanish: {
      current: 'Учиш испански',
      switch: 'Превключи на български'
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleMode}
      className="flex items-center gap-2"
    >
      <Languages className="h-4 w-4" />
      <span className="hidden sm:inline">
        {languageMode === 'bulgarian' ? '🇬🇧 → 🇧🇬' : '🇧🇬 → 🇪🇸'}
      </span>
    </Button>
  );
};

export default LanguageModeToggle;
