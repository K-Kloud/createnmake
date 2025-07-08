import React from 'react';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { User, Palette, TrendingUp, Settings } from 'lucide-react';
import { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const PersonalizationSettings: React.FC = () => {
  const {
    personalizationProfile,
    updatePersonalizationProfile,
    analyzeUserPatterns,
    isUpdatingProfile,
    isAnalyzingPatterns,
    profileLoading
  } = useAdvancedAI();

  const [preferredStyles, setPreferredStyles] = useState<string[]>(
    personalizationProfile?.preferred_styles || []
  );
  const [colorPreferences, setColorPreferences] = useState<string[]>(
    personalizationProfile?.color_preferences || []
  );
  const [newStyle, setNewStyle] = useState('');
  const [newColor, setNewColor] = useState('');
  const [autoAnalysis, setAutoAnalysis] = useState(true);

  const addStyle = () => {
    if (newStyle.trim() && !preferredStyles.includes(newStyle.trim())) {
      setPreferredStyles([...preferredStyles, newStyle.trim()]);
      setNewStyle('');
    }
  };

  const removeStyle = (style: string) => {
    setPreferredStyles(preferredStyles.filter(s => s !== style));
  };

  const addColor = () => {
    if (newColor.trim() && !colorPreferences.includes(newColor.trim())) {
      setColorPreferences([...colorPreferences, newColor.trim()]);
      setNewColor('');
    }
  };

  const removeColor = (color: string) => {
    setColorPreferences(colorPreferences.filter(c => c !== color));
  };

  const saveProfile = () => {
    updatePersonalizationProfile({
      preferred_styles: preferredStyles,
      color_preferences: colorPreferences,
      last_updated: new Date().toISOString()
    });
  };

  const triggerAnalysis = () => {
    analyzeUserPatterns();
  };

  if (profileLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
            <span className="ml-2">Loading personalization settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Style Preferences */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Style Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Preferred Styles</label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add a style preference..."
                value={newStyle}
                onChange={(e) => setNewStyle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addStyle()}
              />
              <Button onClick={addStyle} disabled={!newStyle.trim()}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferredStyles.map((style) => (
                <Badge
                  key={style}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeStyle(style)}
                >
                  {style} ×
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Color Preferences</label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add a color preference..."
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addColor()}
              />
              <Button onClick={addColor} disabled={!newColor.trim()}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {colorPreferences.map((color) => (
                <Badge
                  key={color}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => removeColor(color)}
                >
                  {color} ×
                </Badge>
              ))}
            </div>
          </div>

          <Button 
            onClick={saveProfile} 
            disabled={isUpdatingProfile}
            className="w-full"
          >
            {isUpdatingProfile ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardContent>
      </Card>

      {/* AI Learning Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Learning Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Automatic Pattern Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Let AI analyze your usage patterns to improve recommendations
              </p>
            </div>
            <Switch
              checked={autoAnalysis}
              onCheckedChange={setAutoAnalysis}
            />
          </div>

          <Button
            onClick={triggerAnalysis}
            disabled={isAnalyzingPatterns}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            {isAnalyzingPatterns ? <LoadingSpinner /> : <TrendingUp className="h-4 w-4" />}
            {isAnalyzingPatterns ? 'Analyzing...' : 'Analyze My Patterns Now'}
          </Button>
        </CardContent>
      </Card>

      {/* Profile Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {personalizationProfile ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Styles Tracked:</span>
                  <span className="ml-2">{preferredStyles.length}</span>
                </div>
                <div>
                  <span className="font-medium">Colors Tracked:</span>
                  <span className="ml-2">{colorPreferences.length}</span>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <span className="ml-2">
                    {new Date(personalizationProfile.last_updated).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Profile Created:</span>
                  <span className="ml-2">
                    {new Date(personalizationProfile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {personalizationProfile.learning_data && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <h5 className="font-medium mb-2">AI Insights</h5>
                  <p className="text-sm text-muted-foreground">
                    {typeof personalizationProfile.learning_data === 'object' 
                      ? 'AI has analyzed your patterns and preferences'
                      : String(personalizationProfile.learning_data).slice(0, 100)
                    }
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No personalization profile found.</p>
              <p className="text-sm">Save your preferences to create one.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};