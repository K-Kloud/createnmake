import React from 'react';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Tags, Copy } from 'lucide-react';
import { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';

export const SmartContentGeneration: React.FC = () => {
  const {
    enhancePrompt,
    generateSmartTags,
    contentHistory,
    isEnhancingPrompt,
    isGeneratingTags
  } = useAdvancedAI();

  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) return;
    enhancePrompt({ prompt, style });
  };

  const handleGenerateTags = () => {
    if (!prompt.trim()) return;
    generateSmartTags({ prompt });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Text has been copied to your clipboard',
    });
  };

  return (
    <div className="space-y-6">
      {/* Content Generation Tools */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Smart Content Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Prompt</label>
              <Textarea
                placeholder="Enter your design prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Style (Optional)</label>
              <Input
                placeholder="e.g., modern, vintage, minimalist..."
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleEnhancePrompt}
                disabled={isEnhancingPrompt || !prompt.trim()}
                className="flex items-center gap-2"
              >
                {isEnhancingPrompt ? <LoadingSpinner /> : <Wand2 className="h-4 w-4" />}
                Enhance Prompt
              </Button>
              
              <Button
                onClick={handleGenerateTags}
                disabled={isGeneratingTags || !prompt.trim()}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isGeneratingTags ? <LoadingSpinner /> : <Tags className="h-4 w-4" />}
                Generate Tags
              </Button>
            </div>
          </div>

          {/* Enhanced Prompt Result */}
          {enhancedPrompt && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Enhanced Prompt</label>
              <div className="relative">
                <Textarea
                  value={enhancedPrompt}
                  readOnly
                  className="pr-10"
                  rows={3}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(enhancedPrompt)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Generated Tags */}
          {generatedTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Generated Tags</label>
              <div className="flex flex-wrap gap-2">
                {generatedTags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => copyToClipboard(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content History */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent AI Generations</CardTitle>
        </CardHeader>
        <CardContent>
          {contentHistory && contentHistory.length > 0 ? (
            <div className="space-y-4">
              {contentHistory.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="capitalize">
                      {item.content_type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium">Input: </span>
                      <span className="text-muted-foreground">
                        {typeof item.input_data === 'object' 
                          ? item.input_data.prompt || JSON.stringify(item.input_data).slice(0, 100)
                          : String(item.input_data).slice(0, 100)
                        }
                      </span>
                    </div>
                    
                    {item.quality_score && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Quality:</span>
                        <Badge variant={item.quality_score > 0.8 ? 'default' : 'secondary'}>
                          {Math.round(item.quality_score * 100)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No content generation history yet.</p>
              <p className="text-sm">Start generating AI content to see your history here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};