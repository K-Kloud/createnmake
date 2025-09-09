import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, Lightbulb, TrendingUp, ChevronRight } from 'lucide-react';
import { enhancePromptWithAI, suggestPromptImprovements } from '@/services/aiPromptEnhancer';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/use-toast';

interface PromptEnhancerProps {
  prompt: string;
  itemType: string;
  onPromptChange: (prompt: string) => void;
  className?: string;
}

export const PromptEnhancer: React.FC<PromptEnhancerProps> = ({
  prompt,
  itemType,
  onPromptChange,
  className = ''
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [lastEnhancement, setLastEnhancement] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { preferences, updateGenerationSettings } = useUserPreferences();
  const { toast } = useToast();

  const suggestions = suggestPromptImprovements(prompt, itemType);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "No prompt to enhance",
        description: "Please enter a prompt first",
        variant: "destructive"
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const result = await enhancePromptWithAI(prompt, itemType, preferences.styleProfile);
      setLastEnhancement(result);
      
      if (result.confidence > 0.5) {
        onPromptChange(result.enhancedPrompt);
        toast({
          title: "Prompt enhanced!",
          description: `Confidence: ${Math.floor(result.confidence * 100)}%`
        });
      } else {
        toast({
          title: "Enhancement suggestions available",
          description: "Check the suggestions below for improvements"
        });
      }
    } catch (error) {
      toast({
        title: "Enhancement failed",
        description: "Using fallback suggestions instead",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    const enhancedPrompt = `${prompt}, ${suggestion.toLowerCase()}`;
    onPromptChange(enhancedPrompt);
    toast({
      title: "Suggestion applied",
      description: suggestion
    });
  };

  return (
    <Card className={`border-border/50 bg-card/50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Prompt Enhancer
          {lastEnhancement && (
            <Badge variant="secondary" className="text-xs">
              {Math.floor(lastEnhancement.confidence * 100)}% confidence
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-enhance"
              checked={preferences.generationSettings.autoEnhancePrompts}
              onCheckedChange={(enabled) => 
                updateGenerationSettings({ autoEnhancePrompts: enabled })
              }
            />
            <Label htmlFor="auto-enhance" className="text-xs">
              Auto-enhance prompts
            </Label>
          </div>
          
          <Button
            size="sm"
            onClick={handleEnhancePrompt}
            disabled={isEnhancing || !prompt.trim()}
            className="h-7"
          >
            {isEnhancing ? (
              <>
                <Sparkles className="h-3 w-3 mr-1 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                Enhance
              </>
            )}
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="h-6 p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              {suggestions.length} Suggestions
              <ChevronRight className={`h-3 w-3 ml-1 transition-transform ${showSuggestions ? 'rotate-90' : ''}`} />
            </Button>
            
            {showSuggestions && (
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => applySuggestion(suggestion)}
                    className="h-6 text-xs w-full justify-start font-normal"
                  >
                    <TrendingUp className="h-3 w-3 mr-1 text-blue-500" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {lastEnhancement && lastEnhancement.improvements.length > 0 && (
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
            <div className="font-medium mb-1">Last Enhancement:</div>
            <ul className="space-y-0.5">
              {lastEnhancement.improvements.map((improvement: string, index: number) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-green-500 mt-0.5">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};