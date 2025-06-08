
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SkeletonCardProps {
  hasHeader?: boolean;
  headerHeight?: "sm" | "md" | "lg";
  lines?: number;
  className?: string;
}

export const SkeletonCard = ({ 
  hasHeader = true, 
  headerHeight = "md",
  lines = 3,
  className 
}: SkeletonCardProps) => {
  const headerHeights = {
    sm: "h-4",
    md: "h-6", 
    lg: "h-8"
  };

  return (
    <Card className={className}>
      {hasHeader && (
        <CardHeader>
          <Skeleton className={`${headerHeights[headerHeight]} w-3/4`} />
          <Skeleton className="h-3 w-1/2" />
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
          />
        ))}
      </CardContent>
    </Card>
  );
};
