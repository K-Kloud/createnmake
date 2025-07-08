import React from 'react';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Palette, Sparkles, Target, Clock, ThumbsUp } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const AIRecommendations: React.FC = () => {
  const {
    recommendations,
    isLoading,
    generateRecommendations,
    enhancePrompt,
    generateSmartTags,
    applyRecommendationFeedback,
    isGeneratingRecommendations,
    isEnhancingPrompt,
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

  const handleApplyFeedback = (recommendationId: string, feedback: number, applied: boolean) => {
    applyRecommendationFeedback({
      recommendationId,
      feedback,
      applied
    });
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
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              onClick={() => generateRecommendations({
                type: 'personalized_prompt',
                context: { action: 'create_design' }
              })}
              disabled={isGeneratingRecommendations}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              {isGeneratingRecommendations ? 'Generating...' : 'Get Recommendations'}
            </Button>
            
            <Button
              onClick={() => enhancePrompt({
                prompt: "Create a stylish outfit",
                style: "modern"
              })}
              disabled={isEnhancingPrompt}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isEnhancingPrompt ? 'Enhancing...' : 'Enhance Prompt'}
            </Button>
            
            <Button
              onClick={() => generateSmartTags({
                prompt: "Modern minimalist fashion design"
              })}
              disabled={isGeneratingTags}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              {isGeneratingTags ? 'Generating...' : 'Smart Tags'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="glass-card">
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
                           recommendation.recommendation_data.description ||
                           'AI-generated recommendation based on your preferences'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(recommendation.created_at).toLocaleDateString()}
                        </div>
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

                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplyFeedback(recommendation.id, 5, true)}
                      className="flex items-center gap-1"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      Apply
                    </Button>
                    {recommendation.feedback_score && (
                      <Badge variant="secondary">
                        Rated: {recommendation.feedback_score}/5
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No AI recommendations available yet. Start using the platform to get personalized suggestions!
              </p>
              <Button 
                className="mt-4"
                onClick={() => generateRecommendations({ type: 'image_style' })}
                disabled={isGeneratingRecommendations}
              >
                Generate Recommendations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};