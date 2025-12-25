import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Heart, Skull, Trophy, Lock, HelpCircle, Swords, Crown } from 'lucide-react';

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPremium: boolean;
}

export function InfoDialog({ open, onOpenChange, isPremium }: InfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Как се играе
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sm">
          {/* Node Types */}
          <section>
            <h3 className="font-semibold mb-3">Видове възли</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium">Съкровище</p>
                  <p className="text-muted-foreground text-xs">Стандартен урок с награда XP</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <Skull className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">Череп</p>
                  <p className="text-muted-foreground text-xs">
                    Труден възел: +1 живот при победа, -2 живота при провал
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0">
                  <Heart className="h-4 w-4 text-pink-500" />
                </div>
                <div>
                  <p className="font-medium">Сърце</p>
                  <p className="text-muted-foreground text-xs">
                    Безопасен възел: не губите живот при провал
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Swords className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Нормален</p>
                  <p className="text-muted-foreground text-xs">
                    Стандартен урок: -1 живот при провал
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center shrink-0">
                  <Lock className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium">Заключен</p>
                  <p className="text-muted-foreground text-xs">
                    Недостъпен в момента
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                  <HelpCircle className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Празен</p>
                  <p className="text-muted-foreground text-xs">
                    Изберете между 3 случайни теми
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                  <Crown className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium">Бос</p>
                  <p className="text-muted-foreground text-xs">
                    Финален възел - победете за следваща карта
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Lives System */}
          <section>
            <h3 className="font-semibold mb-3">Система на животите</h3>
            <div className="bg-secondary/50 rounded-lg p-3 space-y-2 text-xs">
              <p>• Имате {isPremium ? '5' : '3'} максимални живота</p>
              <p>• Под 80% правилни = -2 живота</p>
              <p>• 80%+ правилни, но провал = -1 живот</p>
              <p>• {isPremium ? '2' : '1'} живот{isPremium ? 'а' : ''} се възстановяват на всеки 24 часа</p>
            </div>
          </section>

          {/* Moves System */}
          <section>
            <h3 className="font-semibold mb-3">Ходове</h3>
            <div className="bg-secondary/50 rounded-lg p-3 space-y-2 text-xs">
              <p>• 5 хода на ден</p>
              <p>• Ходовете се нулират на всеки 24 часа</p>
              <p>• Всеки възел изисква 1 ход за достъп</p>
            </div>
          </section>

          {isPremium && (
            <section>
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
                <p className="font-medium text-primary flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Premium бонуси
                </p>
                <ul className="mt-2 text-xs space-y-1 text-muted-foreground">
                  <li>• 5 живота вместо 3</li>
                  <li>• 2 живота се възстановяват дневно вместо 1</li>
                </ul>
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
