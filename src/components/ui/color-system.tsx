import { cn } from "@/lib/utils";

// Standardized color classes using semantic design tokens
export const colorSystem = {
  // Text colors - using semantic tokens from design system
  text: {
    primary: "text-foreground",
    secondary: "text-muted-foreground", 
    accent: "text-accent",
    success: "text-primary", // Using green from design system
    warning: "text-yellow-400", // Custom warning color
    danger: "text-destructive",
    white: "text-white",
    muted: "text-muted-foreground",
    inherit: "text-inherit"
  },
  
  // Background colors
  bg: {
    primary: "bg-background",
    secondary: "bg-card",
    accent: "bg-accent",
    success: "bg-primary/10",
    warning: "bg-yellow-400/10", 
    danger: "bg-destructive/10",
    muted: "bg-muted",
    glass: "bg-glass",
    transparent: "bg-transparent"
  },
  
  // Border colors
  border: {
    primary: "border-border",
    accent: "border-accent",
    success: "border-primary",
    warning: "border-yellow-400",
    danger: "border-destructive",
    muted: "border-muted",
    transparent: "border-transparent"
  },
  
  // Gradient combinations using design system colors
  gradients: {
    primary: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
    secondary: "bg-gradient-to-r from-accent to-neon-purple bg-clip-text text-transparent", 
    hero: "bg-gradient-to-r from-foreground via-accent to-neon-purple bg-clip-text text-transparent",
    subtle: "bg-gradient-to-r from-muted-foreground to-foreground bg-clip-text text-transparent"
  },
  
  // Interactive states
  interactive: {
    hover: "hover:text-accent",
    active: "active:text-accent/80",
    focus: "focus:text-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
    disabled: "disabled:text-muted-foreground disabled:cursor-not-allowed"
  }
} as const;

// Utility function to get color classes
export const getColorClasses = (type: keyof typeof colorSystem, variant: string) => {
  const colorGroup = colorSystem[type] as Record<string, string>;
  return colorGroup[variant] || "";
};

// Helper component for applying color systems
interface ColorizedProps {
  children: React.ReactNode;
  textColor?: keyof typeof colorSystem.text;
  bgColor?: keyof typeof colorSystem.bg;
  borderColor?: keyof typeof colorSystem.border;
  gradient?: keyof typeof colorSystem.gradients;
  interactive?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Colorized = ({ 
  children, 
  textColor, 
  bgColor, 
  borderColor,
  gradient,
  interactive = false,
  className = "",
  as: Element = "div"
}: ColorizedProps) => {
  return (
    <Element className={cn(
      textColor && colorSystem.text[textColor],
      bgColor && colorSystem.bg[bgColor],
      borderColor && colorSystem.border[borderColor],
      gradient && colorSystem.gradients[gradient],
      interactive && [
        colorSystem.interactive.hover,
        colorSystem.interactive.focus
      ],
      className
    )}>
      {children}
    </Element>
  );
};

// Preset color combinations for common UI patterns
export const colorPresets = {
  card: cn(colorSystem.bg.secondary, colorSystem.text.primary, colorSystem.border.primary),
  hero: cn(colorSystem.gradients.hero),
  accent: cn(colorSystem.text.accent),
  muted: cn(colorSystem.text.muted),
  interactive: cn(colorSystem.text.secondary, colorSystem.interactive.hover, colorSystem.interactive.focus),
  danger: cn(colorSystem.text.danger, colorSystem.bg.danger, colorSystem.border.danger),
  success: cn(colorSystem.text.success, colorSystem.bg.success, colorSystem.border.success)
} as const;