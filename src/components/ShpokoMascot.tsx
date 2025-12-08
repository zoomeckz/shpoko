import { cn } from "@/lib/utils";

// Import all expression images
import shpokoHappy from "@/assets/shpoko-happy.png";
import shpokoSad from "@/assets/shpoko-sad.png";
import shpokoExcited from "@/assets/shpoko-excited.png";
import shpokoThinking from "@/assets/shpoko-thinking.png";
import shpokoAngry from "@/assets/shpoko-angry.png";
import shpokoSmug from "@/assets/shpoko-smug.png";
import shpokoStudying from "@/assets/shpoko-studying.png";
import shpokoReading from "@/assets/shpoko-reading.png";
import shpokoWriting from "@/assets/shpoko-writing.png";
import shpokoWritingExcited from "@/assets/shpoko-writing-excited.png";
import shpokoSleeping from "@/assets/shpoko-sleeping.png";

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
  | "levelup"
  | "reading"
  | "writing";

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

// Map expressions to their corresponding images
const expressionImages: Record<ShpokoExpression, string> = {
  happy: shpokoHappy,
  thinking: shpokoThinking,
  excited: shpokoExcited,
  confused: shpokoThinking,
  celebrating: shpokoExcited,
  sleeping: shpokoSleeping,
  waving: shpokoExcited,
  studying: shpokoStudying,
  proud: shpokoSmug,
  sad: shpokoSad,
  surprised: shpokoExcited,
  love: shpokoHappy,
  cool: shpokoSmug,
  nervous: shpokoSad,
  angry: shpokoAngry,
  laughing: shpokoHappy,
  wink: shpokoSmug,
  determined: shpokoExcited,
  tired: shpokoSleeping,
  hungry: shpokoThinking,
  cheering: shpokoExcited,
  pointing: shpokoExcited,
  question: shpokoThinking,
  correct: shpokoHappy,
  wrong: shpokoSad,
  streak: shpokoExcited,
  levelup: shpokoExcited,
  reading: shpokoReading,
  writing: shpokoWriting,
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
  reading: "animate-nod",
  writing: "animate-nod",
};

const expressionEmojis: Record<ShpokoExpression, { emoji: string; position: string; animation?: string }[]> = {
  happy: [{ emoji: "✨", position: "absolute -top-1 -right-1 text-sm", animation: "animate-bounce" }],
  thinking: [{ emoji: "💭", position: "absolute -top-2 -right-2 text-lg", animation: "animate-pulse" }],
  excited: [
    { emoji: "✨", position: "absolute -top-1 -right-1 text-sm", animation: "animate-ping" },
    { emoji: "⭐", position: "absolute -top-1 -left-1 text-xs", animation: "animate-bounce" },
  ],
  confused: [{ emoji: "❓", position: "absolute -top-1 right-0 text-lg", animation: "animate-bounce" }],
  celebrating: [
    { emoji: "🎉", position: "absolute -top-2 left-0 text-sm", animation: "animate-bounce" },
    { emoji: "🎊", position: "absolute -top-2 right-0 text-sm", animation: "animate-bounce delay-100" },
  ],
  sleeping: [{ emoji: "💤", position: "absolute -top-1 right-0 text-lg", animation: "animate-pulse" }],
  waving: [{ emoji: "👋", position: "absolute -right-2 top-1/2 text-sm", animation: "animate-wave" }],
  studying: [{ emoji: "📖", position: "absolute -bottom-1 -right-1 text-sm" }],
  proud: [
    { emoji: "🏆", position: "absolute -top-2 right-0 text-sm", animation: "animate-bounce" },
  ],
  sad: [{ emoji: "💧", position: "absolute -top-1 right-0 text-sm", animation: "animate-nod" }],
  surprised: [
    { emoji: "!", position: "absolute -top-3 right-1 text-lg font-bold text-yellow-500", animation: "animate-bounce" },
  ],
  love: [
    { emoji: "❤️", position: "absolute -top-2 -right-1 text-sm", animation: "animate-pulse" },
    { emoji: "💕", position: "absolute -top-1 -left-1 text-xs", animation: "animate-bounce" },
  ],
  cool: [{ emoji: "😎", position: "absolute -top-1 -right-1 text-sm" }],
  nervous: [
    { emoji: "💦", position: "absolute top-0 -left-1 text-xs", animation: "animate-bounce" },
  ],
  angry: [{ emoji: "💢", position: "absolute -top-1 -right-1 text-sm", animation: "animate-tilt" }],
  laughing: [
    { emoji: "😂", position: "absolute -top-1 -right-1 text-sm", animation: "animate-wiggle" },
  ],
  wink: [{ emoji: "✨", position: "absolute -top-1 -right-1 text-sm" }],
  determined: [
    { emoji: "💪", position: "absolute -right-2 top-1/2 text-sm", animation: "animate-bounce" },
    { emoji: "🔥", position: "absolute -top-1 -left-1 text-xs", animation: "animate-pulse" },
  ],
  tired: [
    { emoji: "💤", position: "absolute top-0 -left-1 text-xs", animation: "animate-pulse" },
  ],
  hungry: [
    { emoji: "🍕", position: "absolute -top-1 -right-1 text-sm", animation: "animate-bounce" },
  ],
  cheering: [
    { emoji: "🙌", position: "absolute -top-2 right-0 text-sm", animation: "animate-jump" },
  ],
  pointing: [{ emoji: "👉", position: "absolute -right-3 top-1/2 text-lg" }],
  question: [
    { emoji: "?", position: "absolute -top-3 right-1 text-lg font-bold text-primary", animation: "animate-bounce" },
  ],
  correct: [
    { emoji: "✅", position: "absolute -top-2 -right-1 text-sm", animation: "animate-jump" },
    { emoji: "⭐", position: "absolute -top-1 -left-1 text-xs", animation: "animate-ping" },
  ],
  wrong: [
    { emoji: "❌", position: "absolute -top-2 -right-1 text-sm", animation: "animate-tilt" },
  ],
  streak: [
    { emoji: "🔥", position: "absolute -top-2 -right-1 text-lg", animation: "animate-pulse" },
    { emoji: "⚡", position: "absolute -top-1 -left-1 text-xs", animation: "animate-bounce" },
  ],
  levelup: [
    { emoji: "🆙", position: "absolute -top-3 right-0 text-sm", animation: "animate-jump" },
    { emoji: "🌟", position: "absolute -top-1 -left-1 text-sm", animation: "animate-ping" },
  ],
  reading: [{ emoji: "📚", position: "absolute -bottom-1 -right-1 text-sm" }],
  writing: [{ emoji: "✏️", position: "absolute -bottom-1 -right-1 text-sm" }],
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
  const imageSrc = expressionImages[expression];

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <div className={cn(
        "relative inline-flex items-center justify-center",
        sizeClasses[size],
        animate && expressionAnimations[expression],
      )}>
        <img 
          src={imageSrc} 
          alt={`Shpoko mascot - ${expression}`} 
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
