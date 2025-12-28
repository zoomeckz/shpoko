import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface DuoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
}

export const DuoButton = forwardRef<HTMLButtonElement, DuoButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth = false, children, disabled, ...props }, ref) => {
    const baseStyles = "relative font-bold uppercase tracking-wide rounded-2xl transition-all duration-150 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0";
    
    const variants = {
      primary: "bg-primary text-primary-foreground shadow-[0_4px_0_0_hsl(var(--primary-dark))] hover:brightness-110",
      secondary: "bg-secondary text-secondary-foreground shadow-[0_4px_0_0_hsl(var(--border))] hover:bg-secondary/80",
      danger: "bg-destructive text-destructive-foreground shadow-[0_4px_0_0_hsl(0,70%,40%)] hover:brightness-110",
      success: "bg-success text-success-foreground shadow-[0_4px_0_0_hsl(142,76%,26%)] hover:brightness-110",
      ghost: "bg-transparent text-foreground hover:bg-accent shadow-none active:translate-y-0",
      outline: "bg-transparent text-primary border-2 border-primary shadow-none hover:bg-primary/10 active:translate-y-0"
    };
    
    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
      xl: "px-10 py-5 text-lg"
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

DuoButton.displayName = "DuoButton";
