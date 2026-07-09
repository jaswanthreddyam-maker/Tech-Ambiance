import React from "react";
import { cn } from "../../lib/utils";
import { m } from "framer-motion";
import { useMotion } from "../../providers/MotionProvider";

type BaseButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag" | "ref">;

interface ButtonProps extends BaseButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      icon,
      iconPosition = "right",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const { durations } = useMotion();

    const baseStyles =
      "inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-widest transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest disabled:opacity-50 disabled:pointer-events-none select-none relative group";

    const variants = {
      primary: "btn-emerald-stone !text-[#C5A572] font-bold",
      secondary: "bg-gold text-forest shadow-[0_4px_12px_rgba(197,165,114,0.15)] hover:bg-gold/95 hover:shadow-[0_6px_16px_rgba(197,165,114,0.2)]",
      outline: "border border-forest/15 text-forest hover:border-forest/40 hover:bg-forest/[0.02]",
      ghost: "text-forest hover:bg-forest/[0.04]",
    };

    const sizes = {
      sm: "h-8 px-4 text-[11px]",
      md: "h-11 px-5 text-[12px]",
      lg: "h-13 px-7 text-[13px]",
    };

    return (
      <m.button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        whileHover={{ filter: disabled || isLoading ? "brightness(1)" : "brightness(1.05)" }}
        whileTap={{ filter: disabled || isLoading ? "brightness(1)" : "brightness(0.98)" }}
        transition={{ duration: durations.fast, ease: [0.16, 1, 0.3, 1] }}
        {...props}
      >
        {variant === "primary" && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-0 group-hover:opacity-40 transition-opacity duration-[300ms] ease-[0.16,1,0.3,1] z-0" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 120 44">
            <path d="M -10,10 C 20,8 15,-5 35,-10" fill="none" stroke="#C4A661" strokeWidth="1" style={{ filter: "blur(0.5px) drop-shadow(0 0 5px rgba(196,166,97,0.06))" }} />
            <path d="M 85,54 C 100,34 95,44 130,34" fill="none" stroke="#C4A661" strokeWidth="1" style={{ filter: "blur(0.5px) drop-shadow(0 0 5px rgba(196,166,97,0.06))" }} />
          </svg>
        )}

        <span className="relative z-10 flex items-center justify-center">
          {isLoading ? (
            <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : icon && iconPosition === "left" ? (
            <span className="mr-2 inline-flex items-center">{icon}</span>
          ) : null}
          
          {children}
          
          {!isLoading && icon && iconPosition === "right" && (
            <span className="ml-2 inline-flex items-center">{icon}</span>
          )}
        </span>
      </m.button>
    );
  }
);

Button.displayName = "Button";
