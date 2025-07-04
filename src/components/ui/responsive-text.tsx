import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveTextProps {
  children: ReactNode;
  variant?: "h1" | "h2" | "h3" | "h4" | "body" | "small" | "caption";
  className?: string;
}

const textVariantClasses = {
  h1: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-orbitron font-bold leading-tight",
  h2: "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-orbitron font-bold leading-tight",
  h3: "text-lg sm:text-xl md:text-2xl lg:text-3xl font-rajdhani font-semibold leading-tight",
  h4: "text-base sm:text-lg md:text-xl lg:text-2xl font-rajdhani font-medium leading-tight",
  body: "text-sm sm:text-base md:text-lg leading-relaxed",
  small: "text-xs sm:text-sm leading-normal",
  caption: "text-xs leading-tight"
};

export const ResponsiveText = ({ 
  children, 
  variant = "body",
  className = "" 
}: ResponsiveTextProps) => {
  const Component = variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'p';
  
  return (
    <Component className={cn(
      textVariantClasses[variant],
      className
    )}>
      {children}
    </Component>
  );
};