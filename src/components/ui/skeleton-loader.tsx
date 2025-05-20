
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  type: "card" | "list" | "table" | "profile" | "image" | "text" | "custom";
  count?: number;
  className?: string;
  height?: number | string;
  width?: number | string;
  roundedFull?: boolean;
  children?: React.ReactNode;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type,
  count = 1,
  className,
  height,
  width,
  roundedFull = false,
  children
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[60%]" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        );

      case "list":
        return (
          <div className="space-y-3">
            {Array(count).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-[70%]" />
                  <Skeleton className="h-3 w-[40%]" />
                </div>
              </div>
            ))}
          </div>
        );

      case "table":
        return (
          <div className="rounded border border-border p-1 space-y-3">
            <div className="flex gap-2 p-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            {Array(count).fill(0).map((_, i) => (
              <div key={i} className="flex gap-2 p-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        );

      case "profile":
        return (
          <div className="flex flex-col items-center space-y-2">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        );

      case "image":
        return (
          <div className="relative overflow-hidden">
            <Skeleton className={cn("w-full", height ? `h-${height}` : "h-64")} />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-muted-foreground opacity-30"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        );

      case "text":
        return (
          <div className="space-y-2">
            {Array(count).fill(0).map((_, i) => (
              <React.Fragment key={i}>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[80%]" />
              </React.Fragment>
            ))}
          </div>
        );

      case "custom":
        return children;

      default:
        return <Skeleton className={cn("h-10 w-full", className)} />;
    }
  };

  // For multiple items
  if (count > 1 && type !== "list" && type !== "table" && type !== "text") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(count).fill(0).map((_, i) => (
          <div key={i}>{renderSkeleton()}</div>
        ))}
      </div>
    );
  }

  return renderSkeleton();
};
