import React from "react";
import { cn } from "../../lib/utils";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  as?: React.ElementType;
}

export const Heading: React.FC<HeadingProps> = ({ 
  level = 2, 
  children, 
  className, 
  as,
  ...props 
}) => {
  const Component = as || (`h${level}` as React.ElementType);
  
  const sizeClasses = {
    1: "text-[36px] md:text-[50px] lg:text-[64px] font-medium leading-[1.12] tracking-tight",
    2: "text-[28px] md:text-[38px] lg:text-[48px] font-medium leading-[1.15] tracking-tight",
    3: "text-[22px] md:text-[28px] lg:text-[34px] font-medium leading-[1.2]",
    4: "text-[18px] md:text-[22px] font-medium leading-snug",
    5: "text-[15px] md:text-[18px] font-medium leading-snug",
    6: "text-[13px] md:text-[15px] font-medium leading-snug",
  };

  return (
    <Component 
      className={cn("text-text-primary font-serif", sizeClasses[level], className)}
      {...props}
    >
      {children}
    </Component>
  );
};

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "sm" | "base" | "lg" | "xl";
  children: React.ReactNode;
  as?: React.ElementType;
  muted?: boolean;
}

export const Text: React.FC<TextProps> = ({
  size = "base",
  children,
  className,
  as: Component = "p",
  muted = false,
  ...props
}) => {
  const sizeClasses = {
    sm: "text-[13px] md:text-[14px]", // Metadata scale
    base: "text-[15px] md:text-[16px]", // Secondary / standard text scale
    lg: "text-[17px] md:text-[18px] lg:text-[19px]", // Primary body text scale
    xl: "text-[20px] md:text-[22px]",
  };

  return (
    <Component
      className={cn(
        "font-sans font-light leading-relaxed",
        muted ? "text-text-secondary" : "text-text-primary",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
