import React from 'react';
import { useLanguageMode, LanguageMode } from '@/contexts/LanguageModeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages, Check } from 'lucide-react';

const languageOptions: { mode: LanguageMode; label: string; flags: string; description: string }[] = [
  { 
    mode: 'bulgarian', 
    label: 'English → Bulgarian',
    flags: '🇬🇧 → 🇧🇬',
    description: 'Learn Bulgarian (English UI)'
  },
  { 
    mode: 'swedish', 
    label: 'Svenska → Bulgariska',
    flags: '🇸🇪 → 🇧🇬',
    description: 'Lär dig bulgariska (Svenskt gränssnitt)'
  },
  { 
    mode: 'tunisian', 
    label: 'تونسي → بلغاري',
    flags: '🇹🇳 → 🇧🇬',
    description: 'تعلّم البلغاري (واجهة تونسية)'
  },
  { 
    mode: 'spanish', 
    label: 'Български → Испански',
    flags: '🇧🇬 → 🇪🇸',
    description: 'Учи испански (Български интерфейс)'
  },
];

const LanguageModeToggle: React.FC = () => {
  const { languageMode, setLanguageMode } = useLanguageMode();

  const currentOption = languageOptions.find(opt => opt.mode === languageMode) || languageOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{currentOption.flags}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.mode}
            onClick={() => setLanguageMode(option.mode)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium">{option.flags} {option.label}</span>
              <span className="text-xs text-muted-foreground">{option.description}</span>
            </div>
            {languageMode === option.mode && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageModeToggle;
