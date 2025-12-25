import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Map, ArrowRight } from 'lucide-react';

interface NextMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextMapIds: string[];
  onSelectMap: (mapId: string) => void;
}

const MAP_NAMES: Record<string, string> = {
  'map_01': 'Гората на началото',
  'map_02': 'Градските улици',
  'map_03': 'Канализацията',
  'map_04': 'Тъмната гора',
  'map_05': 'Космическа станция',
};

export function NextMapDialog({ open, onOpenChange, nextMapIds, onSelectMap }: NextMapDialogProps) {
  const handleSelect = (mapId: string) => {
    onSelectMap(mapId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Победа!
          </DialogTitle>
          <DialogDescription>
            Завършихте тази карта! Изберете следващата дестинация.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-2">
          {nextMapIds.length > 0 ? (
            nextMapIds.map(mapId => (
              <Button
                key={mapId}
                variant="outline"
                className="w-full justify-between h-auto py-3"
                onClick={() => handleSelect(mapId)}
              >
                <span>{MAP_NAMES[mapId] || mapId}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Поздравления! 🎉</p>
              <p className="text-sm mt-2">Завършихте всички налични карти!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
