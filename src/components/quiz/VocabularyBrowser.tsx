import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VOCABULARY_LIST, VOCAB_CATEGORIES, VocabWord, searchWords } from "@/data/vocabularyList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Trash2, GraduationCap, BookOpen, Rocket, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VocabularyBrowserProps {
  selectedWords: VocabWord[];
  onWordSelect: (word: VocabWord) => void;
  onWordRemove: (wordId: string) => void;
  onAddCustomWord?: (word: Omit<VocabWord, "id">) => void;
  maxWords?: number;
}

export const VocabularyBrowser = ({
  selectedWords,
  onWordSelect,
  onWordRemove,
  onAddCustomWord,
  maxWords = 50,
}: VocabularyBrowserProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  
  // Custom word form
  const [customWord, setCustomWord] = useState("");
  const [customRomanization, setCustomRomanization] = useState("");
  const [customTranslation, setCustomTranslation] = useState("");

  const selectedWordIds = new Set(selectedWords.map(w => w.id));

  // Filter words
  const filteredWords = useMemo(() => {
    let words = VOCABULARY_LIST.filter(w => w.difficulty === activeTab);
    
    if (selectedCategory) {
      words = words.filter(w => w.category === selectedCategory);
    }
    
    if (searchQuery) {
      words = searchWords(searchQuery).filter(w => w.difficulty === activeTab);
    }
    
    return words;
  }, [activeTab, selectedCategory, searchQuery]);

  // Categories for current difficulty
  const categoriesForTab = useMemo(() => {
    return [...new Set(VOCABULARY_LIST.filter(w => w.difficulty === activeTab).map(w => w.category))].sort();
  }, [activeTab]);

  const handleAddCustomWord = () => {
    if (!customWord || !customTranslation || !onAddCustomWord) return;
    
    onAddCustomWord({
      word: customWord,
      romanization: customRomanization || customWord,
      translation: customTranslation,
      category: "Custom",
      difficulty: activeTab,
      emoji: "📝",
    });
    
    setCustomWord("");
    setCustomRomanization("");
    setCustomTranslation("");
    setShowCustomForm(false);
  };

  const getDifficultyIcon = (diff: string) => {
    switch (diff) {
      case "beginner": return <BookOpen className="w-4 h-4" />;
      case "intermediate": return <GraduationCap className="w-4 h-4" />;
      case "advanced": return <Rocket className="w-4 h-4" />;
      default: return null;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "beginner": return "bg-green-500/10 text-green-500 border-green-500/30";
      case "intermediate": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      case "advanced": return "bg-red-500/10 text-red-500 border-red-500/30";
      default: return "";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Vocabulary Browser</CardTitle>
          <Badge variant="secondary">
            {selectedWords.length}/{maxWords} selected
          </Badge>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Difficulty Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setSelectedCategory(null); }}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="beginner" className="gap-1">
              <BookOpen className="w-3 h-3" />
              <span className="hidden sm:inline">Beginner</span>
            </TabsTrigger>
            <TabsTrigger value="intermediate" className="gap-1">
              <GraduationCap className="w-3 h-3" />
              <span className="hidden sm:inline">Intermediate</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-1">
              <Rocket className="w-3 h-3" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="h-7 text-xs"
          >
            All
          </Button>
          {categoriesForTab.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="h-7 text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Custom Word Form */}
        <AnimatePresence>
          {showCustomForm && onAddCustomWord && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-dashed">
                <CardContent className="p-3 space-y-2">
                  <Input
                    placeholder="Bulgarian word (Cyrillic)"
                    value={customWord}
                    onChange={(e) => setCustomWord(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="Romanization (optional)"
                    value={customRomanization}
                    onChange={(e) => setCustomRomanization(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="English translation"
                    value={customTranslation}
                    onChange={(e) => setCustomTranslation(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddCustomWord}
                      disabled={!customWord || !customTranslation}
                      className="flex-1 h-7"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowCustomForm(false)}
                      className="h-7"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {onAddCustomWord && !showCustomForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomForm(true)}
            className="w-full gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Custom Word
          </Button>
        )}

        {/* Word List */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-1">
            <AnimatePresence>
              {filteredWords.map((word, index) => {
                const isSelected = selectedWordIds.has(word.id);
                const isDisabled = !isSelected && selectedWords.length >= maxWords;
                
                return (
                  <motion.div
                    key={word.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.01 }}
                  >
                    <div
                      onClick={() => {
                        if (isDisabled) return;
                        if (isSelected) {
                          onWordRemove(word.id);
                        } else {
                          onWordSelect(word);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all",
                        isSelected
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-accent border-transparent",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Checkbox checked={isSelected} disabled={isDisabled} />
                      <span className="text-xl">{word.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{word.word}</span>
                          <span className="text-xs text-muted-foreground">({word.romanization})</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{word.translation}</p>
                      </div>
                      <Badge variant="outline" className={cn("text-xs", getDifficultyColor(word.difficulty))}>
                        {word.category}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filteredWords.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No words found</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Selected Words Summary */}
        {selectedWords.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-sm font-medium mb-2">Selected Words:</p>
            <div className="flex flex-wrap gap-1">
              {selectedWords.slice(0, 10).map(word => (
                <Badge
                  key={word.id}
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-destructive/20"
                  onClick={() => onWordRemove(word.id)}
                >
                  {word.emoji} {word.word}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
              {selectedWords.length > 10 && (
                <Badge variant="secondary">+{selectedWords.length - 10} more</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
