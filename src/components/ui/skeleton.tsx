import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'default' | 'circular' | 'rectangular' | 'text';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'default',
  width,
  height,
  animation = 'pulse',
  style: customStyle,
  ...props
}) => {
  const baseClasses = 'bg-muted';
  
  const variantClasses = {
    default: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    text: 'rounded-sm h-4'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] animate-[wave_1.5s_ease-in-out_infinite]',
    none: ''
  };

  const style: React.CSSProperties = { ...customStyle };
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      {...props}
    />
  );
};

// Predefined skeleton components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3 p-4 border rounded-lg', className)}>
    <Skeleton variant="rectangular" height={200} />
    <div className="space-y-2">
      <Skeleton height={20} width="75%" />
      <Skeleton height={16} width="50%" />
    </div>
  </div>
);

export const SkeletonText: React.FC<{ 
  lines?: number; 
  className?: string;
  lastLineWidth?: string;
}> = ({ 
  lines = 3, 
  className,
  lastLineWidth = "60%" 
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? lastLineWidth : "100%"}
      />
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeClasses[size], className)}
    />
  );
};

export const SkeletonButton: React.FC<{ 
  variant?: 'default' | 'wide' | 'icon';
  className?: string;
}> = ({ 
  variant = 'default', 
  className 
}) => {
  const variantStyles = {
    default: 'h-10 w-24',
    wide: 'h-10 w-32',
    icon: 'h-10 w-10'
  };

  return (
    <Skeleton
      className={cn(variantStyles[variant], className)}
    />
  );
};

export const SkeletonForm: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-4', className)}>
    <div className="space-y-2">
      <Skeleton height={16} width="25%" />
      <Skeleton height={40} />
    </div>
    <div className="space-y-2">
      <Skeleton height={16} width="30%" />
      <Skeleton height={40} />
    </div>
    <div className="space-y-2">
      <Skeleton height={16} width="20%" />
      <Skeleton height={80} />
    </div>
    <div className="flex gap-2 pt-2">
      <SkeletonButton />
      <SkeletonButton variant="wide" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ 
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => (
  <div className={cn('space-y-3', className)}>
    {/* Header */}
    <div className="flex gap-4 pb-2 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} height={16} width="80px" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex gap-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={`cell-${rowIndex}-${colIndex}`} 
            height={14} 
            width={colIndex === 0 ? "120px" : "80px"} 
          />
        ))}
      </div>
    ))}
  </div>
);