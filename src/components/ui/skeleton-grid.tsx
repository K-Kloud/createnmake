
import { SkeletonCard } from "./skeleton-card";

interface SkeletonGridProps {
  columns?: number;
  rows?: number;
  className?: string;
}

export const SkeletonGrid = ({ 
  columns = 3, 
  rows = 2,
  className 
}: SkeletonGridProps) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-6 ${className}`}>
      {Array.from({ length: columns * rows }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
