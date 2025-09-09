import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Eye, Keyboard, Volume2 } from 'lucide-react';

interface AccessibilityEnhancementsProps {
  highContrast: boolean;
  onHighContrastChange: (enabled: boolean) => void;
  reduceMotion: boolean;
  onReduceMotionChange: (enabled: boolean) => void;
  screenReaderMode: boolean;
  onScreenReaderModeChange: (enabled: boolean) => void;
}

export const AccessibilityEnhancements: React.FC<AccessibilityEnhancementsProps> = ({
  highContrast,
  onHighContrastChange,
  reduceMotion,
  onReduceMotionChange,
  screenReaderMode,
  onScreenReaderModeChange,
}) => {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Accessibility Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TooltipProvider>
          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="high-contrast" className="text-sm">
                High Contrast
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <Info className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Increases contrast for better visibility</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={onHighContrastChange}
            />
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="reduce-motion" className="text-sm">
                Reduce Motion
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <Info className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Reduces animations and transitions</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              id="reduce-motion"
              checked={reduceMotion}
              onCheckedChange={onReduceMotionChange}
            />
          </div>

          {/* Screen Reader Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="screen-reader" className="text-sm">
                Screen Reader Mode
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <Info className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Optimizes interface for screen readers</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              id="screen-reader"
              checked={screenReaderMode}
              onCheckedChange={onScreenReaderModeChange}
            />
          </div>
        </TooltipProvider>

        {/* Keyboard Navigation Help */}
        <div className="pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <Keyboard className="h-3 w-3" />
              <span className="font-medium">Keyboard shortcuts:</span>
            </div>
            <div className="ml-5 space-y-0.5">
              <div>Tab / Shift+Tab - Navigate elements</div>
              <div>Enter / Space - Activate buttons</div>
              <div>Escape - Close dialogs</div>
              <div>Ctrl+Enter - Generate image</div>
            </div>
          </div>
        </div>

        {/* ARIA Live Region for Announcements */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
          id="accessibility-announcements"
        >
          {/* Dynamic announcements will be inserted here */}
        </div>
      </CardContent>
    </Card>
  );
};