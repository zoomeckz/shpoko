import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Check, 
  Volume2, 
  ChevronUp, 
  ChevronDown, 
  X,
  Trash2,
  BookOpen
} from "lucide-react";
import { 
  STATUS_LABELS, 
  STATUS_COLORS, 
  VocabularyWord 
} from "@/hooks/useLingqVocabulary";
import { cn } from "@/lib/utils";

interface WordPopupProps {
  word: string;
  translation: string;
  romanization?: string;
  existingVocab?: VocabularyWord;
  onSave: (word: string, translation: string, romanization?: string, notes?: string, status?: number) => void;
  onUpdateStatus: (word: string, status: number) => void;
  onMarkKnown: (word: string) => void;
  onDelete?: (word: string) => void;
  onClose: () => void;
  onPlayAudio?: (text: string) => void;
}

export const WordPopup = ({
  word,
  translation,
  romanization,
  existingVocab,
  onSave,
  onUpdateStatus,
  onMarkKnown,
  onDelete,
  onClose,
  onPlayAudio,
}: WordPopupProps) => {
  const [editedTranslation, setEditedTranslation] = useState(
    existingVocab?.translation || translation
  );
  const [notes, setNotes] = useState(existingVocab?.notes || "");
  const [showNotes, setShowNotes] = useState(false);

  const currentStatus = existingVocab?.status || 0;
  const isNew = !existingVocab;

  const handleSave = () => {
    onSave(word, editedTranslation, romanization, notes, 1);
    onClose();
  };

  const handleStatusChange = (newStatus: number) => {
    if (isNew) {
      onSave(word, editedTranslation, romanization, notes, newStatus);
    } else {
      onUpdateStatus(word, newStatus);
    }
  };

  const handleMarkKnown = () => {
    onMarkKnown(word);
    onClose();
  };

  return (
    <div className="bg-card border rounded-xl shadow-xl p-4 min-w-[300px] max-w-[400px] animate-bounce-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">{word}</h3>
            {onPlayAudio && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8"
                onClick={() => onPlayAudio(word)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          {romanization && (
            <p className="text-muted-foreground text-sm italic">{romanization}</p>
          )}
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Translation input */}
      <div className="mb-4">
        <Input
          value={editedTranslation}
          onChange={(e) => setEditedTranslation(e.target.value)}
          placeholder="Enter translation..."
          className="font-medium"
        />
      </div>

      {/* Status bar - LingQ style */}
      <div className="mb-4">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs text-muted-foreground mr-2">Status:</span>
          {[1, 2, 3, 4].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold transition-all",
                currentStatus === status 
                  ? `${STATUS_COLORS[status as keyof typeof STATUS_COLORS]} ring-2 ring-offset-2 ring-primary text-white`
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
              title={STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
            >
              {status}
            </button>
          ))}
          <button
            onClick={handleMarkKnown}
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center transition-all ml-1",
              currentStatus === 5
                ? "bg-green-500 text-white ring-2 ring-offset-2 ring-green-500"
                : "bg-green-100 hover:bg-green-200 text-green-600"
            )}
            title="Mark as Known"
          >
            <Check className="h-4 w-4" />
          </button>
          {existingVocab && onDelete && (
            <button
              onClick={() => {
                onDelete(word);
                onClose();
              }}
              className="w-8 h-8 rounded-md flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 ml-1"
              title="Ignore/Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-5 gap-1 text-[10px] text-muted-foreground text-center mt-1">
          <span>New</span>
          <span>Recognized</span>
          <span>Familiar</span>
          <span>Learned</span>
          <span className="text-green-600">Known</span>
        </div>
      </div>

      {/* Notes section */}
      <div className="mb-4">
        <button 
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <BookOpen className="h-3 w-3" />
          Notes
          {showNotes ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {showNotes && (
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this word..."
            className="mt-2 text-sm"
            rows={2}
          />
        )}
      </div>

      {/* Stats if existing */}
      {existingVocab && (
        <div className="text-xs text-muted-foreground border-t pt-3 mb-3">
          <div className="flex justify-between">
            <span>Times seen: {existingVocab.times_seen}</span>
            <span>Added: {new Date(existingVocab.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {isNew ? (
          <Button onClick={handleSave} className="flex-1 gap-2">
            Save to Vocabulary
          </Button>
        ) : (
          <Button onClick={onClose} variant="outline" className="flex-1">
            Done
          </Button>
        )}
      </div>
    </div>
  );
};