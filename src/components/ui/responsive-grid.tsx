import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const getGridClasses = (cols: ResponsiveGridProps['cols']) => {
  const classes = [];
  
  if (cols?.default) classes.push(`grid-cols-${cols.default}`);
  if (cols?.sm) classes.push(`sm:grid-cols-${cols.sm}`);
  if (cols?.md) classes.push(`md:grid-cols-${cols.md}`);
  if (cols?.lg) classes.push(`lg:grid-cols-${cols.lg}`);
  if (cols?.xl) classes.push(`xl:grid-cols-${cols.xl}`);
  
  return classes.join(" ");
};

const gapClasses = {
  sm: "gap-3 sm:gap-4",
  md: "gap-4 sm:gap-6",
  lg: "gap-6 sm:gap-8",
  xl: "gap-8 sm:gap-10"
};

export const ResponsiveGrid = ({ 
  children, 
  cols = { default: 1, sm: 2, md: 3 },
  gap = "md",
  className = "" 
}: ResponsiveGridProps) => {
  return (
    <div className={cn(
      "grid",
      getGridClasses(cols),
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};