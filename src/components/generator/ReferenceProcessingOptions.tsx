import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Palette, Eye, Scan, Layout, Layers } from 'lucide-react';

export interface ReferenceProcessingOptions {
  extractColors: boolean;
  analyzeStyle: boolean;
  detectObjects: boolean;
  analyzeComposition: boolean;
  extractTexture: boolean;
}

interface ReferenceProcessingOptionsProps {
  options: ReferenceProcessingOptions;
  onOptionsChange: (options: ReferenceProcessingOptions) => void;
  hasReferenceImage: boolean;
}

export const ReferenceProcessingOptionsComponent: React.FC<ReferenceProcessingOptionsProps> = ({
  options,
  onOptionsChange,
  hasReferenceImage
}) => {
  const updateOption = (key: keyof ReferenceProcessingOptions, value: boolean) => {
    onOptionsChange({ ...options, [key]: value });
  };

  if (!hasReferenceImage) {
    return null;
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-semantic-primary flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          Reference Image Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-3 w-3 text-muted-foreground" />
              <Label htmlFor="extract-colors" className="text-xs font-medium">
                Extract Colors
              </Label>
            </div>
            <Switch
              id="extract-colors"
              checked={options.extractColors}
              onCheckedChange={(value) => updateOption('extractColors', value)}
            />
          </div>
          
          <Separator className="opacity-50" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <Label htmlFor="analyze-style" className="text-xs font-medium">
                Analyze Style
              </Label>
            </div>
            <Switch
              id="analyze-style"
              checked={options.analyzeStyle}
              onCheckedChange={(value) => updateOption('analyzeStyle', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scan className="h-3 w-3 text-muted-foreground" />
              <Label htmlFor="detect-objects" className="text-xs font-medium">
                Detect Objects
              </Label>
            </div>
            <Switch
              id="detect-objects"
              checked={options.detectObjects}
              onCheckedChange={(value) => updateOption('detectObjects', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layout className="h-3 w-3 text-muted-foreground" />
              <Label htmlFor="analyze-composition" className="text-xs font-medium">
                Analyze Composition
              </Label>
            </div>
            <Switch
              id="analyze-composition"
              checked={options.analyzeComposition}
              onCheckedChange={(value) => updateOption('analyzeComposition', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-3 w-3 text-muted-foreground" />
              <Label htmlFor="extract-texture" className="text-xs font-medium">
                Extract Texture
              </Label>
            </div>
            <Switch
              id="extract-texture"
              checked={options.extractTexture}
              onCheckedChange={(value) => updateOption('extractTexture', value)}
            />
          </div>
        </div>
        
        <div className="mt-3 p-2 bg-muted/30 rounded-md">
          <p className="text-xs text-muted-foreground leading-relaxed">
            These options control how your reference image is analyzed to enhance the generation prompt.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};