import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Volume2, 
  Check, 
  Trash2,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Filter
} from "lucide-react";
import { 
  VocabularyWord, 
  STATUS_LABELS, 
  STATUS_COLORS 
} from "@/hooks/useLingqVocabulary";
import { cn } from "@/lib/utils";

interface VocabularyPanelProps {
  vocabulary: VocabularyWord[];
  onUpdateStatus: (word: string, status: number) => void;
  onMarkKnown: (word: string) => void;
  onDelete: (word: string) => void;
  onPlayAudio?: (text: string) => void;
}

export const VocabularyPanel = ({
  vocabulary,
  onUpdateStatus,
  onMarkKnown,
  onDelete,
  onPlayAudio,
}: VocabularyPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "alphabetical" | "status">("recent");

  // Filter and sort vocabulary
  const filteredVocab = vocabulary
    .filter(word => {
      if (searchQuery && !word.word.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !word.translation?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (statusFilter !== null && word.status !== statusFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "alphabetical") return a.word.localeCompare(b.word);
      if (sortBy === "status") return a.status - b.status;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  // Stats
  const stats = {
    total: vocabulary.length,
    new: vocabulary.filter(w => w.status === 1).length,
    learning: vocabulary.filter(w => w.status >= 2 && w.status <= 4).length,
    known: vocabulary.filter(w => w.status === 5).length,
  };

  return (
    <div className="h-full flex flex-col bg-card border-l">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">Vocabulary</h3>
          <span className="text-sm text-muted-foreground ml-auto">
            {vocabulary.length} words
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <button 
            onClick={() => setStatusFilter(null)}
            className={cn(
              "p-2 rounded-lg text-center transition-all",
              statusFilter === null ? "bg-primary/10 ring-2 ring-primary" : "bg-muted hover:bg-muted/80"
            )}
          >
            <div className="text-lg font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">All</div>
          </button>
          <button 
            onClick={() => setStatusFilter(1)}
            className={cn(
              "p-2 rounded-lg text-center transition-all",
              statusFilter === 1 ? "bg-blue-500/20 ring-2 ring-blue-500" : "bg-muted hover:bg-muted/80"
            )}
          >
            <div className="text-lg font-bold text-blue-600">{stats.new}</div>
            <div className="text-xs text-muted-foreground">New</div>
          </button>
          <button 
            onClick={() => setStatusFilter(statusFilter === 2 ? null : 2)}
            className={cn(
              "p-2 rounded-lg text-center transition-all",
              statusFilter && statusFilter >= 2 && statusFilter <= 4 ? "bg-yellow-500/20 ring-2 ring-yellow-500" : "bg-muted hover:bg-muted/80"
            )}
          >
            <div className="text-lg font-bold text-yellow-600">{stats.learning}</div>
            <div className="text-xs text-muted-foreground">Learning</div>
          </button>
          <button 
            onClick={() => setStatusFilter(5)}
            className={cn(
              "p-2 rounded-lg text-center transition-all",
              statusFilter === 5 ? "bg-green-500/20 ring-2 ring-green-500" : "bg-muted hover:bg-muted/80"
            )}
          >
            <div className="text-lg font-bold text-green-600">{stats.known}</div>
            <div className="text-xs text-muted-foreground">Known</div>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vocabulary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Word list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredVocab.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No words found</p>
              <p className="text-sm">Click on words in the text to add them</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredVocab.map((word) => (
                <VocabWordItem
                  key={word.id}
                  word={word}
                  onUpdateStatus={onUpdateStatus}
                  onMarkKnown={onMarkKnown}
                  onDelete={onDelete}
                  onPlayAudio={onPlayAudio}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

interface VocabWordItemProps {
  word: VocabularyWord;
  onUpdateStatus: (word: string, status: number) => void;
  onMarkKnown: (word: string) => void;
  onDelete: (word: string) => void;
  onPlayAudio?: (text: string) => void;
}

const VocabWordItem = ({
  word,
  onUpdateStatus,
  onMarkKnown,
  onDelete,
  onPlayAudio,
}: VocabWordItemProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "rounded-lg border p-2 transition-all",
      word.status === 1 && "border-l-4 border-l-blue-500",
      word.status === 2 && "border-l-4 border-l-yellow-500",
      word.status === 3 && "border-l-4 border-l-orange-500",
      word.status === 4 && "border-l-4 border-l-green-500",
      word.status === 5 && "border-l-4 border-l-green-300 opacity-60",
    )}>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{word.word}</span>
            {onPlayAudio && (
              <button 
                onClick={() => onPlayAudio(word.word)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Volume2 className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {word.translation}
          </div>
        </div>

        {/* Quick status buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdateStatus(word.word, Math.min(word.status + 1, 4))}
            disabled={word.status >= 4}
            className="p-1 rounded hover:bg-muted disabled:opacity-30"
            title="Increase status"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => onUpdateStatus(word.word, Math.max(word.status - 1, 1))}
            disabled={word.status <= 1}
            className="p-1 rounded hover:bg-muted disabled:opacity-30"
            title="Decrease status"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            onClick={() => onMarkKnown(word.word)}
            className={cn(
              "p-1 rounded",
              word.status === 5 
                ? "bg-green-500 text-white" 
                : "hover:bg-green-100 text-green-600"
            )}
            title="Mark as known"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(word.word)}
            className="p-1 rounded hover:bg-red-100 text-red-600"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex gap-1 mt-2">
        {[1, 2, 3, 4].map((s) => (
          <button
            key={s}
            onClick={() => onUpdateStatus(word.word, s)}
            className={cn(
              "flex-1 h-1.5 rounded-full transition-all",
              s <= word.status
                ? s === 1 ? "bg-blue-500" : s === 2 ? "bg-yellow-500" : s === 3 ? "bg-orange-500" : "bg-green-500"
                : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
};