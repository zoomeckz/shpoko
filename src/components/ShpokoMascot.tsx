import { cn } from "@/lib/utils";
import raccoonExpressions from "@/assets/raccoon-expressions.png";

export type ShpokoExpression = 
  | "happy" 
  | "thinking" 
  | "excited" 
  | "confused" 
  | "celebrating" 
  | "sleeping"
  | "waving"
  | "studying"
  | "proud"
  | "sad"
  | "surprised"
  | "love"
  | "cool"
  | "nervous"
  | "angry"
  | "laughing"
  | "wink"
  | "determined"
  | "tired"
  | "hungry"
  | "cheering"
  | "pointing"
  | "question"
  | "correct"
  | "wrong"
  | "streak"
  | "levelup";

interface ShpokoMascotProps {
  expression?: ShpokoExpression;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
  showEmoji?: boolean;
  message?: string;
}

const sizeClasses = {
  xs: "w-8 h-8",
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
  proud: "animate-bounce-gentle",
  sad: "animate-nod",
  surprised: "animate-jump",
  love: "animate-pulse",
  cool: "",
  nervous: "animate-wiggle",
  angry: "animate-tilt",
  laughing: "animate-wiggle",
  wink: "",
  determined: "animate-pulse",
  tired: "animate-float",
  hungry: "animate-nod",
  cheering: "animate-jump",
  pointing: "",
  question: "animate-tilt",
  correct: "animate-jump",
  wrong: "animate-tilt",
  streak: "animate-bounce",
  levelup: "animate-jump",
};

// Sprite positions: 4 columns x 3 rows
// Row 1: surprised, thinking, excited, waving-shocked
// Row 2: disappointed, sad, waving, studying
// Row 3: reading, writing-sad, writing-confused, sleeping
const spritePositions: Record<ShpokoExpression, { x: number; y: number }> = {
  surprised: { x: 0, y: 0 },
  thinking: { x: 1, y: 0 },
  excited: { x: 2, y: 0 },
  happy: { x: 2, y: 0 },
  sad: { x: 1, y: 1 },
  waving: { x: 2, y: 1 },
  studying: { x: 3, y: 1 },
  confused: { x: 2, y: 2 },
  sleeping: { x: 3, y: 2 },
  celebrating: { x: 2, y: 0 },
  proud: { x: 3, y: 1 },
  love: { x: 2, y: 0 },
  cool: { x: 1, y: 0 },
  nervous: { x: 0, y: 0 },
  angry: { x: 0, y: 1 },
  laughing: { x: 2, y: 0 },
  wink: { x: 1, y: 0 },
  determined: { x: 0, y: 2 },
  tired: { x: 3, y: 2 },
  hungry: { x: 1, y: 1 },
  cheering: { x: 2, y: 1 },
  pointing: { x: 3, y: 0 },
  question: { x: 2, y: 2 },
  correct: { x: 2, y: 0 },
  wrong: { x: 1, y: 1 },
  streak: { x: 2, y: 0 },
  levelup: { x: 3, y: 1 },
};

const expressionEmojis: Record<ShpokoExpression, { emoji: string; position: string; animation?: string }[]> = {
  happy: [{ emoji: "😊", position: "absolute -top-1 -right-1 text-sm", animation: "animate-bounce" }],
  thinking: [{ emoji: "💭", position: "absolute -top-2 -right-2 text-lg", animation: "animate-pulse" }],
  excited: [
    { emoji: "✨", position: "absolute -top-1 -right-1 text-sm", animation: "animate-ping" },
    { emoji: "⭐", position: "absolute -top-1 -left-1 text-xs", animation: "animate-bounce" },
  ],
  confused: [{ emoji: "❓", position: "absolute -top-1 right-0 text-lg", animation: "animate-bounce" }],
  celebrating: [
    { emoji: "🎉", position: "absolute -top-2 left-0 text-sm", animation: "animate-bounce" },
    { emoji: "🎊", position: "absolute -top-2 right-0 text-sm", animation: "animate-bounce delay-100" },
    { emoji: "🥳", position: "absolute -bottom-1 right-0 text-xs", animation: "animate-jump" },
  ],
  sleeping: [{ emoji: "💤", position: "absolute -top-1 right-0 text-lg", animation: "animate-pulse" }],
  waving: [{ emoji: "👋", position: "absolute -right-2 top-1/2 text-sm", animation: "animate-wave" }],
  studying: [{ emoji: "📚", position: "absolute -bottom-1 -right-1 text-sm" }],
  proud: [
    { emoji: "🏆", position: "absolute -top-2 right-0 text-sm", animation: "animate-bounce" },
    { emoji: "✨", position: "absolute -top-1 left-0 text-xs", animation: "animate-ping" },
  ],
  sad: [{ emoji: "😢", position: "absolute -top-1 right-0 text-sm", animation: "animate-nod" }],
  surprised: [
    { emoji: "😮", position: "absolute -top-1 -right-1 text-sm", animation: "animate-jump" },
    { emoji: "!", position: "absolute -top-3 right-1 text-lg font-bold text-yellow-500", animation: "animate-bounce" },
  ],
  love: [
    { emoji: "❤️", position: "absolute -top-2 -right-1 text-sm", animation: "animate-pulse" },
    { emoji: "💕", position: "absolute -top-1 -left-1 text-xs", animation: "animate-bounce" },
  ],
  cool: [{ emoji: "😎", position: "absolute -top-1 -right-1 text-sm" }],
  nervous: [
    { emoji: "😰", position: "absolute -top-1 -right-1 text-sm", animation: "animate-wiggle" },
    { emoji: "💦", position: "absolute top-0 -left-1 text-xs", animation: "animate-bounce" },
  ],
  angry: [{ emoji: "😤", position: "absolute -top-1 -right-1 text-sm", animation: "animate-tilt" }],
  laughing: [
    { emoji: "😂", position: "absolute -top-1 -right-1 text-sm", animation: "animate-wiggle" },
    { emoji: "🤣", position: "absolute -bottom-1 right-0 text-xs", animation: "animate-bounce" },
  ],
  wink: [{ emoji: "😉", position: "absolute -top-1 -right-1 text-sm" }],
  determined: [
    { emoji: "💪", position: "absolute -right-2 top-1/2 text-sm", animation: "animate-bounce" },
    { emoji: "🔥", position: "absolute -top-1 -left-1 text-xs", animation: "animate-pulse" },
  ],
  tired: [
    { emoji: "😴", position: "absolute -top-1 -right-1 text-sm", animation: "animate-float" },
    { emoji: "💤", position: "absolute top-0 -left-1 text-xs", animation: "animate-pulse" },
  ],
  hungry: [
    { emoji: "🍕", position: "absolute -top-1 -right-1 text-sm", animation: "animate-bounce" },
    { emoji: "😋", position: "absolute -bottom-1 right-0 text-xs" },
  ],
  cheering: [
    { emoji: "🙌", position: "absolute -top-2 right-0 text-sm", animation: "animate-jump" },
    { emoji: "👏", position: "absolute -top-1 left-0 text-xs", animation: "animate-bounce" },
  ],
  pointing: [{ emoji: "👉", position: "absolute -right-3 top-1/2 text-lg" }],
  question: [
    { emoji: "🤔", position: "absolute -top-1 -right-1 text-sm", animation: "animate-pulse" },
    { emoji: "?", position: "absolute -top-3 right-1 text-lg font-bold text-primary", animation: "animate-bounce" },
  ],
  correct: [
    { emoji: "✅", position: "absolute -top-2 -right-1 text-sm", animation: "animate-jump" },
    { emoji: "🎯", position: "absolute -bottom-1 right-0 text-xs", animation: "animate-bounce" },
    { emoji: "⭐", position: "absolute -top-1 -left-1 text-xs", animation: "animate-ping" },
  ],
  wrong: [
    { emoji: "❌", position: "absolute -top-2 -right-1 text-sm", animation: "animate-tilt" },
    { emoji: "😅", position: "absolute -bottom-1 right-0 text-xs" },
  ],
  streak: [
    { emoji: "🔥", position: "absolute -top-2 -right-1 text-lg", animation: "animate-pulse" },
    { emoji: "⚡", position: "absolute -top-1 -left-1 text-xs", animation: "animate-bounce" },
  ],
  levelup: [
    { emoji: "🆙", position: "absolute -top-3 right-0 text-sm", animation: "animate-jump" },
    { emoji: "🌟", position: "absolute -top-1 -left-1 text-sm", animation: "animate-ping" },
    { emoji: "✨", position: "absolute -bottom-1 right-0 text-xs", animation: "animate-bounce" },
  ],
};

export const ShpokoMascot = ({ 
  expression = "happy", 
  size = "md", 
  className,
  animate = true,
  showEmoji = true,
  message
}: ShpokoMascotProps) => {
  const emojis = expressionEmojis[expression];
  const pos = spritePositions[expression] || spritePositions.happy;
  
  // Calculate background position percentages for sprite
  const bgPosX = pos.x * 33.33;
  const bgPosY = pos.y * 50;

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <div className={cn(
        "relative inline-flex items-center justify-center",
        sizeClasses[size],
        animate && expressionAnimations[expression],
      )}>
        <div 
          className="w-full h-full bg-no-repeat"
          style={{
            backgroundImage: `url(${raccoonExpressions})`,
            backgroundSize: "400% 300%",
            backgroundPosition: `${bgPosX}% ${bgPosY}%`,
          }}
          aria-label={`Shpoko mascot - ${expression}`}
        />
        
        {/* Expression emoji overlays */}
        {showEmoji && emojis.map((item, index) => (
          <div 
            key={index} 
            className={cn(item.position, item.animation)}
          >
            {item.emoji}
          </div>
        ))}
      </div>
      
      {/* Speech bubble message */}
      {message && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border rounded-lg px-3 py-1 text-sm shadow-md whitespace-nowrap animate-fade-in">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
            <div className="border-8 border-transparent border-t-border" />
          </div>
          {message}
        </div>
      )}
    </div>
  );
};

// Helper component for inline Shpoko reactions
export const ShpokoReaction = ({ 
  type,
  className 
}: { 
  type: "correct" | "wrong" | "streak" | "thinking" | "celebrating";
  className?: string;
}) => {
  const messages: Record<typeof type, string[]> = {
    correct: ["Great job! 🎉", "Perfect! ✨", "You got it! 🌟", "Amazing! 💪", "Excellent! 🏆"],
    wrong: ["Try again! 💪", "Almost! 🤔", "Keep going! ⭐", "You can do it! 🔥"],
    streak: ["On fire! 🔥", "Unstoppable! ⚡", "Keep it up! 💪"],
    thinking: ["Hmm... 🤔", "Let me think... 💭", "Interesting... 🧐"],
    celebrating: ["Woohoo! 🎉", "Amazing! 🥳", "You did it! 🎊"],
  };
  
  const randomMessage = messages[type][Math.floor(Math.random() * messages[type].length)];
  
  return (
    <ShpokoMascot 
      expression={type === "correct" ? "correct" : type === "wrong" ? "wrong" : type}
      size="sm"
      message={randomMessage}
      className={className}
    />
  );
};