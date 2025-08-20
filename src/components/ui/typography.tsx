import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Typography variant definitions with consistent sizing and responsive behavior
export const typographyVariants = {
  // Display text - for hero sections and major headings
  display: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-orbitron font-bold leading-tight tracking-tight",
  
  // Headings - hierarchical with proper semantic sizing
  h1: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-orbitron font-bold leading-tight tracking-tight",
  h2: "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-orbitron font-bold leading-tight tracking-tight", 
  h3: "text-lg sm:text-xl md:text-2xl lg:text-3xl font-rajdhani font-semibold leading-tight",
  h4: "text-base sm:text-lg md:text-xl lg:text-2xl font-rajdhani font-medium leading-tight",
  h5: "text-sm sm:text-base md:text-lg font-rajdhani font-medium leading-tight",
  h6: "text-xs sm:text-sm md:text-base font-rajdhani font-medium leading-tight",
  
  // Body text variants
  body: "text-sm sm:text-base leading-relaxed font-inter",
  "body-large": "text-base sm:text-lg leading-relaxed font-inter",
  "body-small": "text-xs sm:text-sm leading-normal font-inter",
  
  // UI text variants
  label: "text-sm font-medium font-rajdhani leading-none",
  caption: "text-xs font-inter leading-tight text-muted-foreground",
  overline: "text-xs font-rajdhani font-medium uppercase tracking-wider leading-none",
  
  // Special variants
  accent: "font-monoton text-accent",
  gradient: "gradient-text",
  muted: "text-muted-foreground"
} as const;

// Color variant definitions using semantic tokens
export const colorVariants = {
  default: "text-foreground",
  primary: "text-primary", 
  secondary: "text-secondary-foreground",
  muted: "text-muted-foreground",
  accent: "text-accent",
  destructive: "text-destructive",
  success: "text-green-500", // TODO: Add success color to design system
  warning: "text-yellow-500", // TODO: Add warning color to design system
  gradient: "gradient-text",
  "gradient-primary": "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
  "gradient-secondary": "bg-gradient-to-r from-accent to-neon-purple bg-clip-text text-transparent",
  white: "text-white",
  inherit: "text-inherit"
} as const;

export type TypographyVariant = keyof typeof typographyVariants;
export type ColorVariant = keyof typeof colorVariants;

interface TypographyProps {
  children: ReactNode;
  variant?: TypographyVariant;
  color?: ColorVariant;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Typography = ({ 
  children, 
  variant = "body",
  color = "default",
  className = "",
  as
}: TypographyProps) => {
  // Determine the semantic HTML element to use
  const getElement = (): keyof JSX.IntrinsicElements => {
    if (as) return as;
    
    // Auto-determine semantic element based on variant
    if (variant === "display" || variant === "h1") return "h1";
    if (variant === "h2") return "h2";
    if (variant === "h3") return "h3";
    if (variant === "h4") return "h4";
    if (variant === "h5") return "h5";
    if (variant === "h6") return "h6";
    if (variant === "label") return "label";
    
    return "p"; // Default for body text and other variants
  };
  
  const Element = getElement();
  
  return (
    <Element className={cn(
      typographyVariants[variant],
      colorVariants[color],
      className
    )}>
      {children}
    </Element>
  );
};

// Convenience components for common use cases
export const Heading = ({ level = 1, ...props }: Omit<TypographyProps, 'variant'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) => {
  const variantMap = { 1: "h1", 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6" } as const;
  return <Typography variant={variantMap[level]} {...props} />;
};

export const Body = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body" {...props} />
);

export const Caption = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="caption" {...props} />
);

export const Label = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="label" {...props} />
);

export const Display = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="display" {...props} />
);

// Utility functions for dynamic typography
export const getTypographyClasses = (variant: TypographyVariant, color: ColorVariant = "default") => {
  return cn(typographyVariants[variant], colorVariants[color]);
};