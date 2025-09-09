import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Brain, Star, TrendingUp, Palette, Camera, Zap } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface UserStyleLearningProps {
  className?: string;
}

const STYLE_CATEGORIES = [
  { value: 'contemporary', label: 'Contemporary', icon: '🏢' },
  { value: 'vintage', label: 'Vintage', icon: '📸' },
  { value: 'minimalist', label: 'Minimalist', icon: '⚪' },
  { value: 'bohemian', label: 'Bohemian', icon: '🌸' },
  { value: 'streetwear', label: 'Streetwear', icon: '👟' },
  { value: 'formal', label: 'Formal', icon: '👔' },
  { value: 'casual', label: 'Casual', icon: '👕' },
  { value: 'artistic', label: 'Artistic', icon: '🎨' }
];

const COLOR_PALETTES = [
  { value: 'neutral', label: 'Neutral Tones', colors: ['#F5F5F5', '#E5E5E5', '#CCCCCC'] },
  { value: 'warm', label: 'Warm Colors', colors: ['#FF6B35', '#F7931E', '#FFE66D'] },
  { value: 'cool', label: 'Cool Colors', colors: ['#4ECDC4', '#45B7D1', '#5D737E'] },
  { value: 'monochrome', label: 'Monochrome', colors: ['#000000', '#555555', '#FFFFFF'] },
  { value: 'vibrant', label: 'Vibrant', colors: ['#FF1744', '#00E676', '#2196F3'] },
  { value: 'pastel', label: 'Pastel', colors: ['#FFB3BA', '#BFEFFF', '#FFFFBA'] }
];

export const UserStyleLearning: React.FC<UserStyleLearningProps> = ({
  className = ''
}) => {
  const { preferences, updateStyleProfile } = useUserPreferences();
  const [isExpanded, setIsExpanded] = useState(false);

  const styleProfile = preferences.styleProfile;
  const totalGenerations = preferences.favoritePrompts.length;
  const learningProgress = Math.min(100, (totalGenerations / 20) * 100);

  const addPreferredStyle = (style: string) => {
    const preferredStyles = [
      ...new Set([...styleProfile.preferredStyles, style])
    ].slice(0, 5);
    updateStyleProfile({ preferredStyles });
  };

  const removePreferredStyle = (style: string) => {
    const preferredStyles = styleProfile.preferredStyles.filter(s => s !== style);
    updateStyleProfile({ preferredStyles });
  };

  const updateColorPalette = (palette: string) => {
    const colorPalette = [
      palette,
      ...styleProfile.colorPalette.filter(p => p !== palette)
    ].slice(0, 3);
    updateStyleProfile({ colorPalette });
  };

  const updateQualityLevel = (qualityLevel: 'high' | 'medium' | 'fast') => {
    updateStyleProfile({ qualityLevel });
  };

  return (
    <Card className={`border-border/50 bg-card/50 ${className}`}>
      <CardHeader 
        className="pb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Style Learning
            <Badge variant="secondary" className="text-xs">
              {Math.floor(learningProgress)}% learned
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <TrendingUp className="h-3 w-3" />
          </Button>
        </CardTitle>
        
        <Progress value={learningProgress} className="h-1" />
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Camera className="h-3 w-3" />
                Preferred Styles
              </Label>
              <div className="flex flex-wrap gap-1 mb-2">
                {styleProfile.preferredStyles.map((style) => (
                  <Badge
                    key={style}
                    variant="default"
                    className="text-xs cursor-pointer hover:bg-destructive"
                    onClick={() => removePreferredStyle(style)}
                  >
                    {style} ×
                  </Badge>
                ))}
              </div>
              <Select onValueChange={addPreferredStyle}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Add style preference" />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_CATEGORIES.filter(style => 
                    !styleProfile.preferredStyles.includes(style.value)
                  ).map((style) => (
                    <SelectItem key={style.value} value={style.value} className="text-xs">
                      {style.icon} {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Color Preferences
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PALETTES.map((palette) => (
                  <Button
                    key={palette.value}
                    variant={styleProfile.colorPalette.includes(palette.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateColorPalette(palette.value)}
                    className="h-8 text-xs justify-start"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {palette.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full border border-border/20"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      {palette.label}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Quality Preference
              </Label>
              <Select value={styleProfile.qualityLevel} onValueChange={updateQualityLevel}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high" className="text-xs">🎯 High Quality (slower)</SelectItem>
                  <SelectItem value="medium" className="text-xs">⚡ Balanced (medium)</SelectItem>
                  <SelectItem value="fast" className="text-xs">🚀 Fast Generation (lower quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {styleProfile.commonKeywords.length > 0 && (
            <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
              <div className="font-medium mb-1 flex items-center gap-1">
                <Star className="h-3 w-3" />
                Learned Keywords:
              </div>
              <div className="flex flex-wrap gap-1">
                {styleProfile.commonKeywords.slice(0, 6).map((keyword) => (
                  <Badge key={keyword} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-primary/5 border border-primary/20 p-2 rounded">
            Generate more images to improve AI recommendations. 
            {totalGenerations < 10 && ` Need ${10 - totalGenerations} more for better learning.`}
          </div>
        </CardContent>
      )}
    </Card>
  );
};