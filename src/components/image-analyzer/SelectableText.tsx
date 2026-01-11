import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, BookOpen, Check, X } from "lucide-react";
import { useLingqVocabulary, STATUS_COLORS, STATUS_LABELS } from "@/hooks/useLingqVocabulary";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface SelectableTextProps {
  content: string;
}

interface WordPopupState {
  word: string;
  isOpen: boolean;
  translation: string;
  romanization: string;
}

export function SelectableText({ content }: SelectableTextProps) {
  const { user } = useAuth();
  const { saveWord, getWordStatus, vocabulary, canAddWord, getRemainingSlots, isPremium } = useLingqVocabulary();
  const [selectedWord, setSelectedWord] = useState<WordPopupState | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Extract words while preserving structure
  const tokenizeContent = useCallback((text: string) => {
    // Split by whitespace and punctuation, but keep track of what's a word vs punctuation/whitespace
    const tokens: { type: 'word' | 'other'; value: string }[] = [];
    let current = '';
    let isWord = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const isAlpha = /[\p{L}\p{M}]/u.test(char); // Unicode letters and marks (includes Cyrillic)

      if (isAlpha) {
        if (!isWord && current) {
          tokens.push({ type: 'other', value: current });
          current = '';
        }
        isWord = true;
        current += char;
      } else {
        if (isWord && current) {
          tokens.push({ type: 'word', value: current });
          current = '';
        }
        isWord = false;
        current += char;
      }
    }

    if (current) {
      tokens.push({ type: isWord ? 'word' : 'other', value: current });
    }

    return tokens;
  }, []);

  const handleWordClick = (word: string) => {
    if (!user) return;
    
    const cleanWord = word.toLowerCase().replace(/[.,!?;:'"]/g, "");
    if (cleanWord.length < 2) return; // Skip very short "words"

    setSelectedWord({
      word: cleanWord,
      isOpen: true,
      translation: "",
      romanization: ""
    });
  };

  const handleSaveWord = async () => {
    if (!selectedWord) return;
    
    setIsSaving(true);
    try {
      await saveWord(
        selectedWord.word,
        selectedWord.translation,
        selectedWord.romanization
      );
      setSelectedWord(null);
    } finally {
      setIsSaving(false);
    }
  };

  const tokens = tokenizeContent(content);

  return (
    <div className="relative">
      {/* Instructions banner */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-2 bg-primary/10 rounded-lg flex items-center gap-2 text-sm"
        >
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">
            Click any word to add it to your vocabulary
            {!isPremium && (
              <span className="ml-1 text-xs">
                ({getRemainingSlots()} slots remaining)
              </span>
            )}
          </span>
        </motion.div>
      )}

      {/* Selectable content */}
      <div className="bg-muted/50 rounded-xl p-4 max-h-[400px] overflow-y-auto leading-relaxed">
        {tokens.map((token, index) => {
          if (token.type === 'other') {
            // Preserve whitespace and punctuation
            return <span key={index} className="whitespace-pre-wrap">{token.value}</span>;
          }

          const wordStatus = getWordStatus(token.value);
          const statusColor = wordStatus ? STATUS_COLORS[wordStatus.status as keyof typeof STATUS_COLORS] : undefined;
          const isInVocab = !!wordStatus;

          return (
            <Popover 
              key={index}
              open={selectedWord?.word === token.value.toLowerCase() && selectedWord?.isOpen}
              onOpenChange={(open) => {
                if (!open) setSelectedWord(null);
              }}
            >
              <PopoverTrigger asChild>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleWordClick(token.value)}
                  className={cn(
                    "cursor-pointer rounded px-0.5 transition-all hover:bg-primary/20 inline",
                    isInVocab && statusColor,
                    isInVocab && "text-white",
                    !user && "cursor-default hover:bg-transparent"
                  )}
                  title={isInVocab ? `${STATUS_LABELS[wordStatus.status as keyof typeof STATUS_LABELS]}: ${wordStatus.translation || 'No translation'}` : 'Click to add to vocabulary'}
                >
                  {token.value}
                </motion.span>
              </PopoverTrigger>
              
              <PopoverContent className="w-72 p-4" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">{selectedWord?.word}</h4>
                    {isInVocab && (
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        statusColor,
                        "text-white"
                      )}>
                        {STATUS_LABELS[wordStatus.status as keyof typeof STATUS_LABELS]}
                      </span>
                    )}
                  </div>

                  {isInVocab ? (
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Translation:</span> {wordStatus.translation || 'None'}</p>
                      {wordStatus.romanization && (
                        <p><span className="text-muted-foreground">Romanization:</span> {wordStatus.romanization}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Seen {wordStatus.times_seen} times • {wordStatus.times_correct} correct
                      </p>
                      <div className="flex items-center gap-2 pt-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">Already in vocabulary</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {!canAddWord() ? (
                        <div className="text-center py-2">
                          <p className="text-sm text-destructive">
                            Vocabulary limit reached ({vocabulary.length} words)
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Upgrade to Premium for unlimited vocabulary
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="translation" className="text-xs">Translation (English)</Label>
                              <Input
                                id="translation"
                                placeholder="Enter translation..."
                                value={selectedWord?.translation || ""}
                                onChange={(e) => setSelectedWord(prev => prev ? { ...prev, translation: e.target.value } : null)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="romanization" className="text-xs">Romanization (optional)</Label>
                              <Input
                                id="romanization"
                                placeholder="e.g., zdravey"
                                value={selectedWord?.romanization || ""}
                                onChange={(e) => setSelectedWord(prev => prev ? { ...prev, romanization: e.target.value } : null)}
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={handleSaveWord}
                              disabled={!selectedWord?.translation || isSaving}
                              className="flex-1"
                            >
                              {isSaving ? (
                                "Saving..."
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add to Vocab
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedWord(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>

      {/* Vocabulary legend */}
      {user && vocabulary.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex flex-wrap gap-2 text-xs"
        >
          <span className="text-muted-foreground">Legend:</span>
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <span
              key={status}
              className={cn(
                "px-2 py-0.5 rounded",
                STATUS_COLORS[parseInt(status) as keyof typeof STATUS_COLORS],
                parseInt(status) < 5 ? "text-white" : "text-muted-foreground border"
              )}
            >
              {label}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
