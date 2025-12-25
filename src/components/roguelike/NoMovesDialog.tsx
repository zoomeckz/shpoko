import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Footprints } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NoMovesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeLeft: { hours: number; minutes: number } | null;
}

export function NoMovesDialog({ open, onOpenChange, timeLeft }: NoMovesDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Footprints className="h-5 w-5" />
            Няма повече ходове!
          </DialogTitle>
          <DialogDescription>
            Изчерпахте дневните си ходове. Върнете се утре за нови приключения!
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-1">Ходовете се нулират след:</p>
            {timeLeft ? (
              <p className="text-2xl font-mono font-bold">
                {timeLeft.hours}ч {timeLeft.minutes}м
              </p>
            ) : (
              <p className="text-lg font-bold text-primary">Скоро!</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/')}
          >
            Начало
          </Button>
          <Button
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Разгледай картата
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
