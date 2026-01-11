import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, BookOpen, Check, X, Loader2, Languages } from "lucide-react";
import { useLingqVocabulary, STATUS_COLORS, STATUS_LABELS } from "@/hooks/useLingqVocabulary";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface SelectableTextProps {
  content: string;
}

interface TranslationSuggestion {
  translation: string;
  context?: string;
}

interface WordPopupState {
  word: string;
  isOpen: boolean;
  translation: string;
  romanization: string;
  isCyrillic: boolean;
  suggestions: TranslationSuggestion[];
  isLoadingSuggestions: boolean;
}

// Check if a word contains Cyrillic characters
function isCyrillicWord(word: string): boolean {
  return /[\u0400-\u04FF]/.test(word);
}

export function SelectableText({ content }: SelectableTextProps) {
  const { user } = useAuth();
  const { saveWord, getWordStatus, vocabulary, canAddWord, getRemainingSlots, isPremium } = useLingqVocabulary();
  const [selectedWord, setSelectedWord] = useState<WordPopupState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [openPopoverWord, setOpenPopoverWord] = useState<string | null>(null);

  // Fetch translation suggestions for English words
  const fetchTranslationSuggestions = async (word: string): Promise<TranslationSuggestion[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: {
          customPrompt: `Translate the English word "${word}" to Bulgarian. Provide 2-4 different translations if the word has multiple meanings in different contexts. Format your response as a JSON array of objects with "translation" (Bulgarian word in Cyrillic) and "context" (short English description of when to use this translation). Example: [{"translation":"кола","context":"vehicle"},{"translation":"вагон","context":"train car"}]. Only output valid JSON, no other text.`
        }
      });

      if (error) throw error;

      // Parse the AI response
      const responseText = data.analysis;
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return suggestions.slice(0, 4); // Max 4 suggestions
      }
      return [];
    } catch (error) {
      console.error('Error fetching translations:', error);
      return [];
    }
  };

  // Extract words while preserving structure
  const tokenizeContent = useCallback((text: string) => {
    const tokens: { type: 'word' | 'other'; value: string }[] = [];
    let current = '';
    let isWord = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const isAlpha = /[\p{L}\p{M}]/u.test(char);

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

  const handleWordClick = async (word: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;
    
    const cleanWord = word.toLowerCase().replace(/[.,!?;:'"]/g, "");
    if (cleanWord.length < 2) return;

    const isCyrillic = isCyrillicWord(cleanWord);
    
    // Close if clicking same word
    if (openPopoverWord === cleanWord) {
      setOpenPopoverWord(null);
      setSelectedWord(null);
      return;
    }

    setOpenPopoverWord(cleanWord);
    setSelectedWord({
      word: cleanWord,
      isOpen: true,
      translation: "",
      romanization: "",
      isCyrillic,
      suggestions: [],
      isLoadingSuggestions: !isCyrillic // Only load suggestions for English words
    });

    // If it's an English word, fetch Bulgarian translation suggestions
    if (!isCyrillic) {
      const suggestions = await fetchTranslationSuggestions(cleanWord);
      setSelectedWord(prev => prev ? {
        ...prev,
        suggestions,
        isLoadingSuggestions: false
      } : null);
    }
  };

  const handleSelectSuggestion = (suggestion: TranslationSuggestion) => {
    setSelectedWord(prev => prev ? {
      ...prev,
      translation: suggestion.translation
    } : null);
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
      setOpenPopoverWord(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClosePopover = () => {
    setSelectedWord(null);
    setOpenPopoverWord(null);
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
            return <span key={index} className="whitespace-pre-wrap">{token.value}</span>;
          }

          const cleanWord = token.value.toLowerCase().replace(/[.,!?;:'"]/g, "");
          const wordStatus = getWordStatus(token.value);
          const statusColor = wordStatus ? STATUS_COLORS[wordStatus.status as keyof typeof STATUS_COLORS] : undefined;
          const isInVocab = !!wordStatus;
          const isThisPopoverOpen = openPopoverWord === cleanWord;

          return (
            <Popover 
              key={index}
              open={isThisPopoverOpen}
              onOpenChange={(open) => {
                if (!open) {
                  handleClosePopover();
                }
              }}
            >
              <PopoverTrigger asChild>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleWordClick(token.value, e)}
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
              
              <PopoverContent 
                className="w-80 p-4 z-50 bg-popover border shadow-lg" 
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">{selectedWord?.word}</h4>
                    <div className="flex items-center gap-2">
                      {selectedWord && !selectedWord.isCyrillic && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          <Languages className="w-3 h-3 inline mr-1" />
                          EN → BG
                        </span>
                      )}
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
                          {/* Translation suggestions for English words */}
                          {selectedWord && !selectedWord.isCyrillic && (
                            <div className="space-y-2">
                              <Label className="text-xs flex items-center gap-1">
                                <Languages className="w-3 h-3" />
                                Bulgarian translations
                              </Label>
                              {selectedWord.isLoadingSuggestions ? (
                                <div className="flex items-center justify-center py-3">
                                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                  <span className="ml-2 text-sm text-muted-foreground">Finding translations...</span>
                                </div>
                              ) : selectedWord.suggestions.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {selectedWord.suggestions.map((suggestion, idx) => (
                                    <Button
                                      key={idx}
                                      variant={selectedWord.translation === suggestion.translation ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handleSelectSuggestion(suggestion)}
                                      className="text-sm"
                                      title={suggestion.context ? `Context: ${suggestion.context}` : undefined}
                                    >
                                      {suggestion.translation}
                                      {suggestion.context && (
                                        <span className="ml-1 text-xs opacity-70">({suggestion.context})</span>
                                      )}
                                    </Button>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">No suggestions found. Enter manually below.</p>
                              )}
                            </div>
                          )}

                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="translation" className="text-xs">
                                {selectedWord?.isCyrillic ? "Translation (English)" : "Bulgarian Translation"}
                              </Label>
                              <Input
                                id="translation"
                                placeholder={selectedWord?.isCyrillic ? "Enter English translation..." : "Enter Bulgarian translation..."}
                                value={selectedWord?.translation || ""}
                                onChange={(e) => setSelectedWord(prev => prev ? { ...prev, translation: e.target.value } : null)}
                                className="mt-1"
                                autoFocus={false}
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
                              onClick={handleClosePopover}
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
