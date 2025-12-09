import { cn } from "@/lib/utils";
import shpokoHappy from "@/assets/shpoko-happy.png";
interface ShpokoMascotProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
}
const sizeClasses = {
  xs: "w-8 h-8",
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-32 h-32",
  xl: "w-48 h-48"
};
export const ShpokoMascot = ({
  size = "md",
  className,
  animate = true
}: ShpokoMascotProps) => {
  return <div className={cn("relative inline-flex flex-col items-center", className)}>
      
    </div>;
};