import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crown, Sparkles, BookOpen, Infinity } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VocabLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCount: number;
  limit: number;
}

export const VocabLimitDialog = ({
  open,
  onOpenChange,
  currentCount,
  limit,
}: VocabLimitDialogProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-6 h-6 text-primary" />
            Vocabulary Limit Reached
          </DialogTitle>
          <DialogDescription>
            You've saved {currentCount} of {limit} words available on the free plan.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="bg-gradient-to-br from-warning/20 to-warning/5 rounded-xl p-6 text-center mb-4">
            <Crown className="w-12 h-12 text-warning mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">Upgrade to Premium</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get unlimited vocabulary storage and unlock all premium features!
            </p>
            
            <div className="space-y-2 text-left mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Infinity className="w-4 h-4 text-warning" />
                <span>Unlimited vocabulary words</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-warning" />
                <span>Advanced SRS scheduling</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-warning" />
                <span>All stories & lessons unlocked</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate("/premium");
              }}
              className="flex-1 bg-gradient-to-r from-warning to-warning/80 text-black hover:from-warning/90 hover:to-warning/70"
            >
              <Crown className="w-4 h-4 mr-2" />
              Go Premium
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
