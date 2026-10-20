import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";

// Chunky 3D button: a solid bottom "lip" (box-shadow) that collapses when pressed.
export const duoButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 select-none whitespace-nowrap font-extrabold uppercase tracking-[0.06em] rounded-2xl transition-[transform,box-shadow,filter,background-color] duration-100 active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[0_4px_0_0_hsl(var(--primary-dark))] hover:brightness-105",
        success:
          "bg-success text-success-foreground shadow-[0_4px_0_0_hsl(var(--success-dark))] hover:brightness-105",
        danger:
          "bg-error text-error-foreground shadow-[0_4px_0_0_hsl(var(--error-dark))] hover:brightness-105",
        secondary:
          "bg-accent-strong text-white shadow-[0_4px_0_0_hsl(var(--accent-dark))] hover:brightness-105",
        white:
          "bg-card text-primary border-2 border-border shadow-[0_4px_0_0_hsl(var(--border))] hover:bg-muted",
        outline:
          "bg-card text-foreground border-2 border-border shadow-[0_4px_0_0_hsl(var(--border))] hover:bg-muted",
        ghost:
          "bg-transparent text-primary shadow-none hover:bg-primary/10 active:translate-y-0",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-[15px]",
        xl: "h-14 px-10 text-base",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface DuoButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof duoButtonVariants> {
  asChild?: boolean;
}

export const DuoButton = forwardRef<HTMLButtonElement, DuoButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(duoButtonVariants({ variant, size, fullWidth }), className)}
        {...props}
      />
    );
  }
);

DuoButton.displayName = "DuoButton";
