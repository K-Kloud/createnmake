
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import { LoadingState } from '@/components/ui/loading-state';
import { Sparkles, Palette, TrendingUp, Target } from 'lucide-react';

export const AIRecommendations: React.FC = () => {
  const {
    recommendations,
    isLoading,
    generatePersonalizedPrompt,
    analyzeImageTrends,
    generateSmartTags,
    isGeneratingPrompt,
    isAnalyzingTrends
  } = useAdvancedAI();

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'image_style': return <Sparkles className="h-4 w-4" />;
      case 'color_palette': return <Palette className="h-4 w-4" />;
      case 'trending_items': return <TrendingUp className="h-4 w-4" />;
      case 'personalized_prompt': return <Target className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500/10 text-green-500 border-green-500/30';
    if (score >= 0.6) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
    return 'bg-red-500/10 text-red-500 border-red-500/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Recommendations</h2>
          <p className="text-muted-foreground">Personalized suggestions to improve your creations</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => analyzeImageTrends()}
            disabled={isAnalyzingTrends}
            variant="outline"
          >
            {isAnalyzingTrends ? 'Analyzing...' : 'Analyze Trends'}
          </Button>
          <Button
            onClick={() => generatePersonalizedPrompt({ 
              basePrompt: 'a modern design',
              userPreferences: {
                preferred_styles: ['minimalist', 'modern'],
                color_preferences: ['blue', 'white'],
                activity_patterns: {},
                engagement_history: {}
              }
            })}
            disabled={isGeneratingPrompt}
          >
            {isGeneratingPrompt ? 'Generating...' : 'Generate Smart Prompt'}
          </Button>
        </div>
      </div>

      <LoadingState
        isLoading={isLoading}
        error={null}
        loadingMessage="Loading AI recommendations..."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations?.map((recommendation) => (
            <Card key={recommendation.id} className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRecommendationIcon(recommendation.recommendation_type)}
                    <span className="capitalize">
                      {recommendation.recommendation_type.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge className={getConfidenceColor(recommendation.confidence_score)}>
                    {Math.round(recommendation.confidence_score * 100)}% confidence
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  {recommendation.recommendation_type === 'image_style' && (
                    <div>
                      <p className="font-medium">Recommended Style: {recommendation.recommendation_data.style}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {recommendation.recommendation_data.reason}
                      </p>
                    </div>
                  )}
                  
                  {recommendation.recommendation_type === 'color_palette' && (
                    <div>
                      <p className="font-medium mb-2">Recommended Colors:</p>
                      <div className="flex gap-2 mb-2">
                        {recommendation.recommendation_data.colors?.map((color: string, index: number) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {recommendation.recommendation_data.reason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button size="sm">Apply Recommendation</Button>
                  <Button size="sm" variant="outline">Save for Later</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </LoadingState>

      {/* AI Tools Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>AI-Powered Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => generateSmartTags({ 
                imageUrl: 'example.jpg', 
                prompt: 'modern minimalist design' 
              })}
            >
              <Target className="h-5 w-5" />
              Smart Tagging
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => analyzeImageTrends()}
              disabled={isAnalyzingTrends}
            >
              <TrendingUp className="h-5 w-5" />
              Trend Analysis
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Palette className="h-5 w-5" />
              Color Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
