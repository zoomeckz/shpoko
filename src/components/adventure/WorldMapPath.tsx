import { cn } from "@/lib/utils";

interface PathSegment {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isCompleted: boolean;
  isDungeonPath: boolean;
}

interface WorldMapPathProps {
  segments: PathSegment[];
}

export const WorldMapPath = ({ segments }: WorldMapPathProps) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        {/* Gradient for completed path */}
        <linearGradient id="completedPath" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(142, 76%, 36%)" />
          <stop offset="100%" stopColor="hsl(142, 76%, 46%)" />
        </linearGradient>
        
        {/* Gradient for active path */}
        <linearGradient id="activePath" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(214, 89%, 52%)" />
          <stop offset="100%" stopColor="hsl(214, 89%, 62%)" />
        </linearGradient>

        {/* Gradient for dungeon path */}
        <linearGradient id="dungeonPath" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(270, 70%, 50%)" />
          <stop offset="100%" stopColor="hsl(330, 70%, 50%)" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Dotted pattern for locked paths */}
        <pattern id="dots" patternUnits="userSpaceOnUse" width="10" height="10">
          <circle cx="5" cy="5" r="2" fill="hsl(214, 20%, 45%)" opacity="0.5" />
        </pattern>
      </defs>

      {segments.map((segment, index) => {
        const { from, to, isCompleted, isDungeonPath } = segment;
        
        // Calculate control points for curved path
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        
        // Add some curve based on direction
        const curveOffset = Math.abs(dx) > Math.abs(dy) ? dy * 0.3 : dx * 0.3;
        const cx = midX + (index % 2 === 0 ? curveOffset : -curveOffset);
        const cy = midY + (index % 2 === 0 ? -curveOffset : curveOffset);
        
        const path = `M ${from.x}% ${from.y}% Q ${cx}% ${cy}% ${to.x}% ${to.y}%`;

        return (
          <g key={index}>
            {/* Path shadow/glow for completed */}
            {isCompleted && (
              <path
                d={path}
                fill="none"
                stroke={isDungeonPath ? "url(#dungeonPath)" : "url(#completedPath)"}
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.3"
                filter="url(#pathGlow)"
              />
            )}
            
            {/* Main path */}
            <path
              d={path}
              fill="none"
              stroke={
                isCompleted 
                  ? (isDungeonPath ? "url(#dungeonPath)" : "url(#completedPath)")
                  : "url(#dots)"
              }
              strokeWidth={isCompleted ? 6 : 4}
              strokeLinecap="round"
              className={cn(
                "transition-all duration-500",
                !isCompleted && "opacity-40"
              )}
            />
            
            {/* Animated dots on active path */}
            {isCompleted && (
              <circle r="4" fill="white" opacity="0.8">
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  path={path.replace(/%/g, '')}
                />
              </circle>
            )}
          </g>
        );
      })}
    </svg>
  );
};
