import { Heart, Footprints, Clock, Info, ArrowLeft, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfoDialog } from './InfoDialog';
import { NoMovesDialog } from './NoMovesDialog';
import { BacktrackWarning } from './BacktrackWarning';
import { NextMapDialog } from './NextMapDialog';
import type { RoguelikeProgress, RoguelikeMap } from '@/hooks/useRoguelike';

interface GameUIProps {
  progress: RoguelikeProgress | null;
  currentMap: RoguelikeMap | null;
  maxLives: number;
  isPremium: boolean;
  getTimeUntilReset: () => { hours: number; minutes: number } | null;
  isBossDefeated: boolean;
  onBacktrack: () => void;
  onProceedToNextMap: (mapId: string) => void;
  totalNodes: number;
  completedCount: number;
}

export function GameUI({
  progress,
  currentMap,
  maxLives,
  isPremium,
  getTimeUntilReset,
  isBossDefeated,
  onBacktrack,
  onProceedToNextMap,
  totalNodes,
  completedCount
}: GameUIProps) {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [showNoMoves, setShowNoMoves] = useState(false);
  const [showBacktrack, setShowBacktrack] = useState(false);
  const [showNextMap, setShowNextMap] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number } | null>(null);

  const noMoves = progress?.moves_today === 0;

  useEffect(() => {
    if (noMoves) {
      const update = () => setTimeLeft(getTimeUntilReset());
      update();
      const interval = setInterval(update, 60000);
      return () => clearInterval(interval);
    }
  }, [noMoves, getTimeUntilReset]);

  useEffect(() => {
    if (noMoves) {
      setShowNoMoves(true);
    }
  }, [noMoves]);

  return (
    <>
      {/* Top Left - Back & Map Name */}
      <div className="fixed top-4 left-4 z-30 flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/')}
          className="bg-card/90 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg border">
          <h2 className="font-semibold text-sm">{currentMap?.name || 'Карта'}</h2>
          <p className="text-xs text-muted-foreground">
            {completedCount}/{totalNodes} възли
          </p>
        </div>
      </div>

      {/* Top Center - Lives & Moves */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
        {/* Lives */}
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg border flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          <span className="font-bold">{progress?.lives ?? 3}</span>
          <span className="text-xs text-muted-foreground">/ {maxLives}</span>
        </div>

        {/* Moves */}
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg border flex items-center gap-2">
          <Footprints className="h-5 w-5 text-primary" />
          <span className="font-bold">{progress?.moves_today ?? 5}</span>
          <span className="text-xs text-muted-foreground">/ 5 хода</span>
        </div>

        {/* Timer (only if no moves) */}
        {noMoves && timeLeft && (
          <div className="bg-destructive/20 border-destructive px-4 py-2 rounded-lg border flex items-center gap-2">
            <Clock className="h-5 w-5 text-destructive" />
            <span className="font-mono text-sm text-destructive">
              {timeLeft.hours}ч {timeLeft.minutes}м
            </span>
          </div>
        )}
      </div>

      {/* Bottom Right - Info & Actions */}
      <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-2">
        {isBossDefeated && !progress?.is_backtracking && (
          <>
            <Button
              onClick={() => setShowNextMap(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Следваща карта
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowBacktrack(true)}
              className="border-red-500 text-red-500 hover:bg-red-500/10"
            >
              Върни се назад
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowInfo(true)}
          className="bg-card/90 backdrop-blur-sm self-end"
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>

      {/* Backtrack Warning */}
      {progress?.is_backtracking && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm">
            ⚠️ Режим на връщане - получавате 50% XP, без бонуси
          </div>
        </div>
      )}

      {/* Dialogs */}
      <InfoDialog open={showInfo} onOpenChange={setShowInfo} isPremium={isPremium} />
      <NoMovesDialog 
        open={showNoMoves} 
        onOpenChange={setShowNoMoves} 
        timeLeft={timeLeft}
      />
      <BacktrackWarning
        open={showBacktrack}
        onOpenChange={setShowBacktrack}
        onConfirm={onBacktrack}
      />
      <NextMapDialog
        open={showNextMap}
        onOpenChange={setShowNextMap}
        nextMapIds={currentMap?.next_map_ids || []}
        onSelectMap={onProceedToNextMap}
      />
    </>
  );
}
