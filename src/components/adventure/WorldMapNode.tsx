import { cn } from "@/lib/utils";
import { Lock, Check, Skull, Zap, Star } from "lucide-react";
import { ShpokoMascot } from "@/components/ShpokoMascot";
import { AdventureNode } from "@/hooks/useAdventure";

interface WorldMapNodeProps {
  node: AdventureNode;
  index: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  isSelected: boolean;
  isShpokoHere: boolean;
  position: { x: number; y: number };
  onClick: () => void;
}

export const WorldMapNode = ({
  node,
  index,
  isUnlocked,
  isCompleted,
  isSelected,
  isShpokoHere,
  position,
  onClick,
}: WorldMapNodeProps) => {
  const isDungeon = node.is_dungeon;

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      onClick={onClick}
    >
      {/* Glow effect for selected node */}
      {isSelected && (
        <div className="absolute inset-0 -m-4 animate-pulse">
          <div className={cn(
            "w-20 h-20 rounded-full blur-xl",
            isDungeon ? "bg-purple-500/40" : "bg-primary/40"
          )} />
        </div>
      )}

      {/* Node base */}
      <div
        className={cn(
          "relative w-14 h-14 rounded-full flex items-center justify-center",
          "border-4 transition-all duration-300 shadow-lg",
          // States
          isCompleted && "bg-green-500 border-green-400 shadow-green-500/30",
          !isCompleted && isUnlocked && !isDungeon && "bg-primary border-primary-foreground shadow-primary/30 hover:scale-110",
          !isCompleted && isUnlocked && isDungeon && "bg-purple-600 border-purple-400 shadow-purple-500/40 hover:scale-110",
          !isUnlocked && "bg-muted border-muted-foreground/30 opacity-60",
          isSelected && "ring-4 ring-yellow-400 ring-offset-2 ring-offset-background"
        )}
      >
        {/* Node icon/content */}
        {isCompleted ? (
          <Check className="w-6 h-6 text-green-100" />
        ) : !isUnlocked ? (
          <Lock className="w-5 h-5 text-muted-foreground" />
        ) : isDungeon ? (
          <Skull className="w-6 h-6 text-purple-100 animate-pulse" />
        ) : (
          <span className="text-lg font-bold text-primary-foreground">
            {node.node_number}
          </span>
        )}

        {/* Shpoko mascot on current position */}
        {isShpokoHere && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ShpokoMascot size="sm" />
          </div>
        )}

        {/* XP badge */}
        <div className={cn(
          "absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded-full text-xs font-bold",
          "flex items-center gap-0.5",
          isCompleted ? "bg-green-600 text-green-100" :
          isDungeon ? "bg-purple-700 text-purple-100" :
          "bg-yellow-500 text-yellow-900"
        )}>
          <Star className="w-3 h-3" />
          {node.xp_reward}
        </div>
      </div>

      {/* Node label on hover */}
      <div className={cn(
        "absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1.5 rounded-lg",
        "bg-card/95 backdrop-blur-sm border shadow-lg",
        "text-center whitespace-nowrap z-10",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        isSelected && "opacity-100"
      )}>
        <p className="font-semibold text-sm">{node.title}</p>
        {node.description && (
          <p className="text-xs text-muted-foreground">{node.description}</p>
        )}
      </div>
    </div>
  );
};
