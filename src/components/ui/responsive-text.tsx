import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Typography, TypographyVariant, ColorVariant } from "./typography";

interface ResponsiveTextProps {
  children: ReactNode;
  variant?: "h1" | "h2" | "h3" | "h4" | "body" | "small" | "caption";
  className?: string;
}

// Legacy mapping for backward compatibility
const legacyVariantMapping: Record<ResponsiveTextProps['variant'] & string, TypographyVariant> = {
  h1: "h1",
  h2: "h2", 
  h3: "h3",
  h4: "h4",
  body: "body",
  small: "body-small",
  caption: "caption"
};

export const ResponsiveText = ({ 
  children, 
  variant = "body",
  className = "" 
}: ResponsiveTextProps) => {
  // Use new Typography system with legacy support
  const mappedVariant = legacyVariantMapping[variant] || "body";
  
  return (
    <Typography 
      variant={mappedVariant}
      className={className}
    >
      {children}
    </Typography>
  );
};

// Re-export Typography system for new usage
export { Typography, type TypographyVariant, type ColorVariant } from "./typography";