import Lottie from "lottie-react";
import { cn } from "@/lib/utils";
import shpokoHappy from "@/assets/shpoko-happy.png";
import shpokoExcited from "@/assets/shpoko-excited.png";
import shpokoSad from "@/assets/shpoko-sad.png";
import shpokoThinking from "@/assets/shpoko-thinking.png";
import shpokoWriting from "@/assets/shpoko-writing.png";
import shpokoSmug from "@/assets/shpoko-smug.png";

// Since we don't have actual Lottie JSON files yet, we'll create a component
// that mimics Lottie-style animations using CSS and our existing images
// This can be upgraded to real Lottie animations later

type ShpokoMood = "happy" | "excited" | "sad" | "thinking" | "writing" | "smug" | "celebrating";

interface ShpokoLottieProps {
  mood?: ShpokoMood;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  autoplay?: boolean;
}

const moodImages: Record<ShpokoMood, string> = {
  happy: shpokoHappy,
  excited: shpokoExcited,
  sad: shpokoSad,
  thinking: shpokoThinking,
  writing: shpokoWriting,
  smug: shpokoSmug,
  celebrating: shpokoExcited,
};

const moodAnimations: Record<ShpokoMood, string> = {
  happy: "animate-float",
  excited: "animate-jump",
  sad: "animate-nod",
  thinking: "animate-tilt",
  writing: "animate-wiggle",
  smug: "animate-float",
  celebrating: "animate-jump",
};

const sizes = {
  sm: "w-12 h-12",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

export const ShpokoLottie = ({
  mood = "happy",
  size = "md",
  className,
  autoplay = true,
}: ShpokoLottieProps) => {
  const imageSrc = moodImages[mood];
  const animation = autoplay ? moodAnimations[mood] : "";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <img
        src={imageSrc}
        alt={`Shpoko ${mood}`}
        className={cn(
          sizes[size],
          "object-contain",
          animation
        )}
      />
      
      {/* Celebration particles */}
      {mood === "celebrating" && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                backgroundColor: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"][i],
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Export Lottie animation data placeholder for future use
// When you have actual Lottie JSON files, import them and use like:
// import happyAnimation from "@/assets/lottie/shpoko-happy.json";
// Then replace the image implementation with actual Lottie component

export const ShpokoLottieReal = ({
  animationData,
  loop = true,
  autoplay = true,
  className,
}: {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}) => {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  );
};
