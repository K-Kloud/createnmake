// Design tokens and utility functions for consistent styling
import { cn } from "@/lib/utils";

// Standardized spacing system
export const spacing = {
  none: "0",
  xs: "0.25rem", // 4px
  sm: "0.5rem",  // 8px
  md: "1rem",    // 16px
  lg: "1.5rem",  // 24px
  xl: "2rem",    // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
  "4xl": "6rem", // 96px
} as const;

// Standardized font sizes with responsive behavior
export const fontSizes = {
  xs: "text-xs",      // 12px
  sm: "text-sm",      // 14px
  base: "text-base",  // 16px
  lg: "text-lg",      // 18px
  xl: "text-xl",      // 20px
  "2xl": "text-2xl",  // 24px
  "3xl": "text-3xl",  // 30px
  "4xl": "text-4xl",  // 36px
  "5xl": "text-5xl",  // 48px
  "6xl": "text-6xl",  // 60px
  "7xl": "text-7xl",  // 72px
} as const;

// Semantic color classes using design system
export const semanticColors = {
  // Text colors
  primary: "text-foreground",
  secondary: "text-muted-foreground",
  accent: "text-accent",
  muted: "text-muted-foreground",
  success: "text-primary", // Using primary green as success
  warning: "text-yellow-400",
  danger: "text-destructive",
  
  // Background colors
  "bg-primary": "bg-background",
  "bg-secondary": "bg-card",
  "bg-accent": "bg-accent",
  "bg-muted": "bg-muted",
  "bg-glass": "bg-glass",
  
  // Border colors
  "border-primary": "border-border",
  "border-accent": "border-accent",
  "border-muted": "border-muted",
} as const;

// Animation presets
export const animations = {
  "fade-in": "animate-slide-up",
  "float": "animate-float", 
  "glow": "animate-glow",
  "pulse": "animate-neon-pulse",
  "bounce": "animate-bounce",
} as const;

// Component size presets
export const componentSizes = {
  sm: {
    padding: "px-3 py-1.5",
    text: "text-sm",
    height: "h-8"
  },
  md: {
    padding: "px-4 py-2", 
    text: "text-base",
    height: "h-10"
  },
  lg: {
    padding: "px-6 py-3",
    text: "text-lg", 
    height: "h-12"
  },
  xl: {
    padding: "px-8 py-4",
    text: "text-xl",
    height: "h-14"
  }
} as const;

// Helper functions for consistent styling
export const getResponsiveText = (baseSize: keyof typeof fontSizes, responsiveSizes?: Partial<Record<'sm' | 'md' | 'lg' | 'xl', keyof typeof fontSizes>>) => {
  const classes = [fontSizes[baseSize]];
  
  if (responsiveSizes?.sm) classes.push(`sm:${fontSizes[responsiveSizes.sm].replace('text-', '')}`);
  if (responsiveSizes?.md) classes.push(`md:${fontSizes[responsiveSizes.md].replace('text-', '')}`);
  if (responsiveSizes?.lg) classes.push(`lg:${fontSizes[responsiveSizes.lg].replace('text-', '')}`);
  if (responsiveSizes?.xl) classes.push(`xl:${fontSizes[responsiveSizes.xl].replace('text-', '')}`);
  
  return cn(...classes);
};

export const getComponentSize = (size: keyof typeof componentSizes) => {
  const sizeConfig = componentSizes[size];
  return cn(sizeConfig.padding, sizeConfig.text, sizeConfig.height);
};

// Preset class combinations for common patterns
export const presets = {
  "hero-text": "font-orbitron font-bold gradient-text",
  "body-text": "font-inter leading-relaxed text-foreground",
  "muted-text": "font-inter text-muted-foreground",
  "accent-text": "font-monoton text-accent",
  "label-text": "font-rajdhani font-medium text-sm",
  "card-title": "font-rajdhani font-semibold text-lg text-foreground",
  "section-title": "font-orbitron font-bold text-2xl sm:text-3xl md:text-4xl gradient-text",
} as const;

// Utility function to get preset classes
export const getPreset = (preset: keyof typeof presets) => presets[preset];