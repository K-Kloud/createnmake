import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Shuffle, Copy, Download, Star, History } from 'lucide-react';

interface QuickActionsProps {
  onRandomPrompt: () => void;
  onCopyPrompt: () => void;
  onExportImage?: () => void;
  onRateImage?: () => void;
  onViewHistory?: () => void;
  hasGeneratedImage: boolean;
  className?: string;
}

const randomPrompts = [
  "A vintage leather jacket with brass buckles, worn by a model in dramatic studio lighting",
  "A flowing silk evening gown in deep emerald with intricate beadwork",
  "A casual denim outfit with distressed jeans and a graphic t-shirt",
  "An elegant business suit in charcoal gray with subtle pinstripes",
  "A bohemian maxi dress with floral patterns and flowing fabric",
  "A sporty activewear set in bright colors with moisture-wicking fabric"
];

export const QuickActions: React.FC<QuickActionsProps> = ({
  onRandomPrompt,
  onCopyPrompt,
  onExportImage,
  onRateImage,
  onViewHistory,
  hasGeneratedImage,
  className = ''
}) => {
  const handleRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * randomPrompts.length);
    onRandomPrompt();
    // In a real implementation, this would update the prompt
  };

  return (
    <Card className={`border-border/50 bg-card/30 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRandomPrompt}
            className="gap-1 text-xs"
          >
            <Shuffle className="h-3 w-3" />
            Random Idea
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onCopyPrompt}
            className="gap-1 text-xs"
          >
            <Copy className="h-3 w-3" />
            Copy Prompt
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onViewHistory}
            className="gap-1 text-xs"
          >
            <History className="h-3 w-3" />
            History
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onExportImage}
            disabled={!hasGeneratedImage}
            className="gap-1 text-xs"
          >
            <Download className="h-3 w-3" />
            Export
          </Button>
        </div>
        
        {hasGeneratedImage && (
          <div className="pt-2 border-t border-border/30">
            <Button
              variant="outline"
              size="sm"
              onClick={onRateImage}
              className="w-full gap-1 text-xs"
            >
              <Star className="h-3 w-3" />
              Rate this generation
            </Button>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          <Badge variant="secondary" className="text-xs mb-1">
            Pro Tip
          </Badge>
          <div>Use "Random Idea" to get inspiration or copy your prompt to save it for later use.</div>
        </div>
      </CardContent>
    </Card>
  );
};