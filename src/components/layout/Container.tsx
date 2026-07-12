import React from "react";
import { cn } from "../../lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide" | "full";
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className, size = "default", ...props }, ref) => {
    
    // Max-widths based on DESIGN_RULES.md (1440px)
    const sizeClasses = {
      default: "max-w-[1440px] px-4 sm:px-6 md:px-12 lg:px-20 mx-auto w-full",
      narrow: "max-w-[960px] px-4 sm:px-6 md:px-12 mx-auto w-full",
      wide: "max-w-[1920px] px-4 sm:px-6 md:px-12 lg:px-20 mx-auto w-full",
      full: "w-full px-0", // Edge-to-edge
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";
