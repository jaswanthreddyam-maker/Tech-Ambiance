import React from "react";
import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "glass" | "outline";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, variant = "default", padding = "md", ...props }, ref) => {
    const variants = {
      default: "bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_20px_50px_rgba(6,41,30,0.03)] border border-forest/[0.04] transition-all duration-500 ease-[0.16,1,0.3,1] hover:shadow-[inset_0_1px_1px_rgba(196,166,97,0.4),0_30px_70px_rgba(6,41,30,0.05)]",
      glass: "bg-white/40 backdrop-blur-2xl border border-white/20 shadow-md",
      outline: "bg-transparent border border-forest/10 transition-colors duration-500",
    };

    const paddings = {
      none: "p-0",
      sm: "p-5 md:p-7",
      md: "p-6 md:p-10 lg:p-12",
      lg: "p-8 md:p-14 lg:p-20", // Luxury generous padding
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-card overflow-hidden", // Use the custom radius-card token (rounded-card maps to --radius-card)
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
