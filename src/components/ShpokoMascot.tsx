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

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <div className={cn(
        "relative inline-flex items-center justify-center",
        sizeClasses[size],
        animate && expressionAnimations[expression],
      )}>
        <img 
          src={raccoonMascot} 
          alt="Shpoko mascot" 
          className="w-full h-full object-contain"
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
