import { cn } from "@/lib/utils";
import raccoonMascot from "@/assets/raccoon-mascot.png";

export type ShpokoExpression = 
  | "happy" 
  | "thinking" 
  | "excited" 
  | "confused" 
  | "celebrating" 
  | "sleeping"
  | "waving"
  | "studying";

interface ShpokoMascotProps {
  expression?: ShpokoExpression;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

const expressionAnimations: Record<ShpokoExpression, string> = {
  happy: "animate-bounce",
  thinking: "animate-pulse",
  excited: "animate-wiggle",
  confused: "animate-tilt",
  celebrating: "animate-jump",
  sleeping: "animate-float opacity-80",
  waving: "animate-wave",
  studying: "animate-nod",
};

export const ShpokoMascot = ({ 
  expression = "happy", 
  size = "md", 
  className,
  animate = true 
}: ShpokoMascotProps) => {
  return (
    <div className={cn(
      "relative inline-flex items-center justify-center",
      sizeClasses[size],
      animate && expressionAnimations[expression],
      className
    )}>
      <img 
        src={raccoonMascot} 
        alt="Shpoko mascot" 
        className="w-full h-full object-contain"
      />
      
      {/* Expression overlays */}
      {expression === "thinking" && (
        <div className="absolute -top-2 -right-2 text-lg">💭</div>
      )}
      {expression === "excited" && (
        <div className="absolute -top-1 -right-1 text-sm animate-ping">✨</div>
      )}
      {expression === "celebrating" && (
        <>
          <div className="absolute -top-2 left-0 text-sm animate-bounce delay-100">🎉</div>
          <div className="absolute -top-2 right-0 text-sm animate-bounce delay-200">🎊</div>
        </>
      )}
      {expression === "sleeping" && (
        <div className="absolute -top-1 right-0 text-lg animate-pulse">💤</div>
      )}
      {expression === "studying" && (
        <div className="absolute -bottom-1 -right-1 text-sm">📚</div>
      )}
      {expression === "confused" && (
        <div className="absolute -top-1 right-0 text-lg">❓</div>
      )}
    </div>
  );
};
