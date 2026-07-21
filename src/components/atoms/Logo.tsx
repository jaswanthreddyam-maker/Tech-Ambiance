import React from "react";
import logoImg from "../../assets/logo-opt.webp";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = "md", className = "" }) => {
  const dimensions = {
    sm: { height: "26px", width: "48px" },
    md: { height: "34px", width: "62px" },
    lg: { height: "50px", width: "90px" },
    xl: { height: "68px", width: "124px" },
  };

  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <img
        src={logoImg}
        alt="Tech Ambiance Logo"
        className="block object-contain mix-blend-multiply"
        style={dimensions[size]}
      />
    </div>
  );
};

