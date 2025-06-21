
import React from 'react';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Palette, Sparkles, Target } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const AIRecommendations: React.FC = () => {
  const {
    recommendations,
    isLoading,
    generatePersonalizedPrompt,
    analyzeImageTrends,
    generateSmartTags,
    isGeneratingPrompt,
    isAnalyzingTrends,
    isGeneratingTags
  } = useAdvancedAI();

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'image_style':
        return <Sparkles className="h-4 w-4" />;
      case 'color_palette':
        return <Palette className="h-4 w-4" />;
      case 'trending_items':
        return <TrendingUp className="h-4 w-4" />;
      case 'personalized_prompt':
        return <Target className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
            <span className="ml-2">Loading AI recommendations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              onClick={() => generatePersonalizedPrompt({
                basePrompt: "Create a stylish outfit",
                userPreferences: {
                  user_id: "current_user",
                  preferred_styles: ["minimalist", "modern"],
                  color_preferences: ["blue", "white", "gray"],
                  activity_patterns: {},
                  engagement_history: {}
                }
              })}
              disabled={isGeneratingPrompt}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              {isGeneratingPrompt ? 'Generating...' : 'Generate Personalized Prompt'}
            </Button>
            
            <Button
              onClick={() => analyzeImageTrends()}
              disabled={isAnalyzingTrends}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              {isAnalyzingTrends ? 'Analyzing...' : 'Analyze Trends'}
            </Button>
            
            <Button
              onClick={() => generateSmartTags({
                imageUrl: "https://example.com/image.jpg",
                prompt: "Modern minimalist fashion design"
              })}
              disabled={isGeneratingTags}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isGeneratingTags ? 'Generating...' : 'Smart Tags'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations && recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getRecommendationIcon(recommendation.recommendation_type)}
                      <div className="space-y-1">
                        <h4 className="font-medium capitalize">
                          {recommendation.recommendation_type.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {recommendation.recommendation_data.reason || 
                           JSON.stringify(recommendation.recommendation_data)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getConfidenceColor(recommendation.confidence_score)}`}
                      />
                      <Badge variant="outline">
                        {Math.round(recommendation.confidence_score * 100)}% confidence
                      </Badge>
                    </div>
                  </div>
                  
                  {recommendation.recommendation_data.colors && (
                    <div className="mt-3 flex gap-2">
                      {recommendation.recommendation_data.colors.map((color: string, index: number) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No AI recommendations available yet. Start using the platform to get personalized suggestions!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
