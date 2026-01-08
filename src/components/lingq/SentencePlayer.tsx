import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  SkipBack,
  SkipForward,
  Repeat
} from "lucide-react";

interface SentencePlayerProps {
  currentSentence: number;
  totalSentences: number;
  onPrevious: () => void;
  onNext: () => void;
  onPlayAudio?: () => void;
  onRepeat?: () => void;
  isPlaying?: boolean;
}

export const SentencePlayer = ({
  currentSentence,
  totalSentences,
  onPrevious,
  onNext,
  onPlayAudio,
  onRepeat,
  isPlaying = false,
}: SentencePlayerProps) => {
  return (
    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-muted/50 rounded-xl">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={currentSentence === 0}
        className="h-10 w-10"
      >
        <SkipBack className="h-5 w-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={currentSentence === 0}
        className="h-10 w-10"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {onPlayAudio && (
        <Button
          variant="default"
          size="icon"
          onClick={onPlayAudio}
          className="h-12 w-12 rounded-full"
        >
          <Volume2 className={`h-6 w-6 ${isPlaying ? "animate-pulse" : ""}`} />
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={currentSentence >= totalSentences - 1}
        className="h-10 w-10"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={currentSentence >= totalSentences - 1}
        className="h-10 w-10"
      >
        <SkipForward className="h-5 w-5" />
      </Button>

      {onRepeat && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRepeat}
          className="h-10 w-10 ml-2"
        >
          <Repeat className="h-5 w-5" />
        </Button>
      )}

      <div className="ml-4 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{currentSentence + 1}</span>
        <span> / {totalSentences}</span>
      </div>
    </div>
  );
};