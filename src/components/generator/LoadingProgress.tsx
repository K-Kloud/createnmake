import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Image, Palette, Layers, Eye } from 'lucide-react';

interface LoadingProgressProps {
  stage: 'uploading' | 'analyzing' | 'processing' | 'generating' | 'complete';
  progress: number;
  message?: string;
  showStages?: boolean;
}

const stages = [
  { key: 'uploading', label: 'Uploading reference images', icon: Image },
  { key: 'analyzing', label: 'Analyzing visual content', icon: Eye },
  { key: 'processing', label: 'Processing style information', icon: Palette },
  { key: 'generating', label: 'Generating your image', icon: Layers },
];

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  stage,
  progress,
  message,
  showStages = true,
}) => {
  const currentStageIndex = stages.findIndex(s => s.key === stage);
  
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground">
              {message || stages[currentStageIndex]?.label || 'Processing...'}
            </div>
            <Progress value={progress} className="mt-2 h-2" />
          </div>
          <div className="text-sm text-muted-foreground font-mono">
            {Math.round(progress)}%
          </div>
        </div>
        
        {showStages && (
          <div className="space-y-2">
            {stages.map((stageInfo, index) => {
              const Icon = stageInfo.icon;
              const isComplete = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const isPending = index > currentStageIndex;
              
              return (
                <div
                  key={stageInfo.key}
                  className={`flex items-center gap-3 text-sm transition-colors ${
                    isComplete 
                      ? 'text-primary' 
                      : isCurrent 
                        ? 'text-foreground' 
                        : 'text-muted-foreground/50'
                  }`}
                >
                  <Icon 
                    className={`h-4 w-4 ${
                      isCurrent ? 'animate-pulse' : ''
                    }`} 
                  />
                  <span className={isComplete ? 'line-through' : ''}>
                    {stageInfo.label}
                  </span>
                  {isComplete && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                  {isCurrent && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};