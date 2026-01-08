import { cn } from "@/lib/utils";

interface StoryStatsProps {
  newWords: number;
  learningWords: number;
  knownWords: number;
  totalWords: number;
}

export const StoryStats = ({
  newWords,
  learningWords,
  knownWords,
  totalWords,
}: StoryStatsProps) => {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-blue-500" />
        <span className="text-muted-foreground">New:</span>
        <span className="font-semibold">{newWords}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-yellow-500" />
        <span className="text-muted-foreground">Learning:</span>
        <span className="font-semibold">{learningWords}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-muted border" />
        <span className="text-muted-foreground">Known:</span>
        <span className="font-semibold">{knownWords}</span>
      </div>
      <div className="ml-auto text-muted-foreground">
        Total: <span className="font-semibold text-foreground">{totalWords}</span>
      </div>
    </div>
  );
};