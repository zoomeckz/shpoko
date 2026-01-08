import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_TEXT_COLORS, VocabularyWord } from "@/hooks/useLingqVocabulary";
import { WordPopup } from "./WordPopup";

interface LingqWordProps {
  word: string;
  translation: string;
  romanization?: string;
  existingVocab?: VocabularyWord;
  onSave: (word: string, translation: string, romanization?: string, notes?: string, status?: number) => void;
  onUpdateStatus: (word: string, status: number) => void;
  onMarkKnown: (word: string) => void;
  onDelete?: (word: string) => void;
  onPlayAudio?: (text: string) => void;
  isHighlighted?: boolean;
}

export const LingqWord = ({
  word,
  translation,
  romanization,
  existingVocab,
  onSave,
  onUpdateStatus,
  onMarkKnown,
  onDelete,
  onPlayAudio,
  isHighlighted = false,
}: LingqWordProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const wordRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        wordRef.current &&
        !wordRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  const status = existingVocab?.status || 0;
  const isNew = !existingVocab;
  const isKnown = status === 5;

  // Get background color based on status
  const getBgClass = () => {
    if (isKnown) return ""; // No highlight for known words
    if (isNew) return "bg-blue-400/60 hover:bg-blue-400/80"; // Blue for new
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] + "/60 hover:" + STATUS_COLORS[status as keyof typeof STATUS_COLORS] + "/80";
  };

  const getTextClass = () => {
    if (isKnown) return "text-foreground";
    if (isNew) return "text-blue-900 dark:text-blue-100";
    if (status <= 2) return "text-white dark:text-white";
    return "text-foreground";
  };

  return (
    <span className="relative inline">
      <span
        ref={wordRef}
        onClick={() => setShowPopup(true)}
        className={cn(
          "cursor-pointer rounded px-0.5 transition-all duration-150",
          isNew && "bg-blue-400/60 hover:bg-blue-400/80 text-blue-900 dark:text-blue-100",
          status === 1 && "bg-blue-500/60 hover:bg-blue-500/80 text-white",
          status === 2 && "bg-yellow-400/60 hover:bg-yellow-400/80 text-yellow-900",
          status === 3 && "bg-orange-400/60 hover:bg-orange-400/80 text-white",
          status === 4 && "bg-green-400/60 hover:bg-green-400/80 text-white",
          status === 5 && "hover:bg-muted",
          isHighlighted && "ring-2 ring-primary ring-offset-1",
          showPopup && "ring-2 ring-primary"
        )}
      >
        {word}
      </span>
      
      {showPopup && (
        <div 
          ref={popupRef}
          className="absolute z-50 left-0 top-full mt-1"
          style={{ minWidth: "300px" }}
        >
          <WordPopup
            word={word}
            translation={translation}
            romanization={romanization}
            existingVocab={existingVocab}
            onSave={onSave}
            onUpdateStatus={onUpdateStatus}
            onMarkKnown={onMarkKnown}
            onDelete={onDelete}
            onClose={() => setShowPopup(false)}
            onPlayAudio={onPlayAudio}
          />
        </div>
      )}
    </span>
  );
};