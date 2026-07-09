import React from "react";
import { cn } from "../../lib/utils"; // Assuming a classnames utility exists, I'll create it later if needed

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id: string; // ID is required for deep linking
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType; // allow rendering as <header> or <footer> etc
  padding?: "none" | "small" | "normal" | "large";
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ id, children, className, as: Component = "section", padding = "normal", ...props }, ref) => {
    
    // Vertical padding mapped from DESIGN_RULES.md (160px desktop, 120px tablet, 80px mobile)
    const paddingClasses = {
      none: "py-0",
      small: "py-12 md:py-16 lg:py-20",
      normal: "py-20 md:py-[100px] lg:py-[140px]",
      large: "py-28 md:py-[140px] lg:py-[180px]",
    };

    return (
      <Component
        id={id}
        ref={ref}
        className={cn(
          "w-full relative", 
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Section.displayName = "Section";
