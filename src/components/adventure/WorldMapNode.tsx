import { cn } from "@/lib/utils";
import { AdventureNode } from "@/hooks/useAdventure";
import castleIcon from "@/assets/castle-icon.png";
import dungeonIcon from "@/assets/dungeon-icon.png";

interface WorldMapNodeProps {
  node: AdventureNode;
  index: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  isSelected: boolean;
  position: { x: number; y: number };
  onClick: () => void;
}

export const WorldMapNode = ({
  node,
  index,
  isUnlocked,
  isCompleted,
  isSelected,
  position,
  onClick,
}: WorldMapNodeProps) => {
  const isDungeon = node.is_dungeon;

  return (
    <div
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group",
        "transition-all duration-300",
        isUnlocked ? "hover:scale-110" : "cursor-not-allowed",
        isSelected && "scale-125 z-30"
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      onClick={onClick}
    >
      {/* Glow effect for selected/unlocked nodes */}
      {isSelected && (
        <div className="absolute inset-0 -m-6 pointer-events-none">
          <div className={cn(
            "w-24 h-24 rounded-full blur-xl animate-pulse",
            isDungeon ? "bg-purple-500/60" : "bg-yellow-400/60"
          )} />
        </div>
      )}

      {/* Pulsing ring for current unlocked node */}
      {isUnlocked && !isCompleted && (
        <div className="absolute inset-0 -m-2 pointer-events-none">
          <div className={cn(
            "w-full h-full rounded-full border-4 animate-ping",
            isDungeon ? "border-purple-400" : "border-yellow-400"
          )} 
          style={{ animationDuration: "2s" }}
          />
        </div>
      )}

      {/* Node visual */}
      <div className={cn(
        "relative transition-all duration-300",
        !isUnlocked && "opacity-40 grayscale"
      )}>
        {isDungeon ? (
          // Dungeon portal
          <div className="relative w-16 h-16">
            <img 
              src={dungeonIcon} 
              alt="Dungeon" 
              className={cn(
                "w-full h-full object-contain drop-shadow-lg",
                isUnlocked && "animate-pulse"
              )}
            />
            {/* Magical particles */}
            {isUnlocked && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce opacity-70"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Regular level - castle
          <div className="relative w-14 h-14">
            <img 
              src={castleIcon} 
              alt="Level" 
              className={cn(
                "w-full h-full object-contain drop-shadow-lg transition-transform",
                isCompleted && "hue-rotate-90"
              )}
            />
            {/* Completed checkmark */}
            {isCompleted && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {/* Level number */}
            {!isCompleted && isUnlocked && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                {node.node_number}
              </div>
            )}
            {/* Lock icon for locked nodes */}
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gray-800/80 rounded-full p-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Node label tooltip */}
      <div className={cn(
        "absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 rounded-lg",
        "bg-gray-900/95 backdrop-blur-sm border border-white/20 shadow-xl",
        "text-center whitespace-nowrap z-40 pointer-events-none",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        isSelected && "opacity-100"
      )}>
        <p className="font-bold text-white text-sm">{node.title}</p>
        <div className="flex items-center justify-center gap-1 text-yellow-400 text-xs mt-1">
          <span>⭐</span>
          <span>+{node.xp_reward} XP</span>
        </div>
      </div>
    </div>
  );
};
