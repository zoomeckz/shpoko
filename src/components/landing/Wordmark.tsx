import { cn } from "@/lib/utils";
import shpokoMascot from "@/assets/shpoko-mascot.png";

interface WordmarkProps {
  className?: string;
  /** Use on coloured backgrounds. */
  inverted?: boolean;
  size?: "sm" | "md";
}

export function Wordmark({ className, inverted = false, size = "md" }: WordmarkProps) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <img
        src={shpokoMascot}
        alt=""
        className={cn("object-contain", size === "sm" ? "w-8 h-8" : "w-10 h-10")}
      />
      <span
        className={cn(
          "leading-none font-black tracking-tight",
          size === "sm" ? "text-[22px]" : "text-[28px]",
          inverted ? "text-white" : "text-primary"
        )}
      >
        shpoko
      </span>
    </span>
  );
}
