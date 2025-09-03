import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, Users, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UserPreference {
  user_id: string;
  preferred_provider: string;
  confidence_score: number;
  item_type_preferences: Record<string, string>;
  style_preferences: Record<string, number>;
  generation_count: number;
}

interface LearningInsight {
  insight_type: string;
  description: string;
  confidence: number;
  actionable: boolean;
  user_segment: string;
}

export const UserPreferenceLearning = () => {
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      
      // Simulate fetching user preference learning data
      const mockPreferences: UserPreference[] = [
        {
          user_id: '1',
          preferred_provider: 'openai',
          confidence_score: 0.87,
          item_type_preferences: {
            'dress': 'openai',
            'casual-wear': 'gemini',
            'formal-wear': 'openai'
          },
          style_preferences: {
            'realistic': 0.9,
            'artistic': 0.3,
            'vintage': 0.6
          },
          generation_count: 45
        },
        {
          user_id: '2',
          preferred_provider: 'gemini',
          confidence_score: 0.72,
          item_type_preferences: {
            'traditional-wear': 'gemini',
            'casual-wear': 'xai',
            'accessories': 'gemini'
          },
          style_preferences: {
            'cultural': 0.95,
            'modern': 0.4,
            'colorful': 0.8
          },
          generation_count: 23
        }
      ];

      const mockInsights: LearningInsight[] = [
        {
          insight_type: 'provider_preference',
          description: 'Users generating formal wear prefer OpenAI GPT-Image-1 by 73%',
          confidence: 0.86,
          actionable: true,
          user_segment: 'formal_fashion'
        },
        {
          insight_type: 'style_correlation',
          description: 'Cultural patterns are better handled by Gemini, showing 15% higher satisfaction',
          confidence: 0.79,
          actionable: true,
          user_segment: 'cultural_fashion'
        },
        {
          insight_type: 'usage_pattern',
          description: 'New users benefit from automatic provider selection for first 5 generations',
          confidence: 0.92,
          actionable: true,
          user_segment: 'new_users'
        },
        {
          insight_type: 'quality_trend',
          description: 'XAI Grok shows improving performance on creative casual wear designs',
          confidence: 0.67,
          actionable: false,
          user_segment: 'creative_users'
        }
      ];

      setPreferences(mockPreferences);
      setInsights(mockInsights);

    } catch (error) {
      console.error('Error fetching learning data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load learning data"
      });
    } finally {
      setLoading(false);
    }
  };

  const optimizeRecommendations = async () => {
    try {
      setOptimizing(true);
      
      // Simulate AI optimization process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Optimization Complete",
        description: "Recommendation algorithms have been updated based on latest user preferences."
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Optimization Failed",
        description: "Failed to optimize recommendations"
      });
    } finally {
      setOptimizing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-20 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Preference Learning</h1>
          <p className="text-muted-foreground">AI-powered insights into user behavior and preferences</p>
        </div>
        <Button 
          onClick={optimizeRecommendations} 
          disabled={optimizing}
          className="bg-primary hover:bg-primary/90"
        >
          {optimizing ? (
            <>
              <Zap className="mr-2 h-4 w-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Optimize Recommendations
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="patterns">User Patterns</TabsTrigger>
          <TabsTrigger value="segments">User Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights.map((insight, index) => (
              <Card key={index} className={insight.actionable ? 'border-primary/20 bg-primary/5' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{insight.description}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {insight.insight_type.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {insight.user_segment.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                        {getConfidenceBadge(insight.confidence)} Confidence
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(insight.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {insight.actionable && (
                  <CardContent>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>This insight can be used to improve recommendations</span>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {preferences.map((pref, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>User Pattern #{index + 1}</span>
                    <Badge variant="outline">
                      {pref.generation_count} generations
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Preferred Provider: <span className="font-medium capitalize">{pref.preferred_provider}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Confidence Score</span>
                      <span className="text-sm font-medium">{(pref.confidence_score * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={pref.confidence_score * 100} />
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Item Type Preferences</h4>
                    <div className="space-y-1">
                      {Object.entries(pref.item_type_preferences).map(([type, provider]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="capitalize">{type.replace('-', ' ')}</span>
                          <Badge variant="secondary" className="text-xs capitalize">{provider}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Style Preferences</h4>
                    <div className="space-y-2">
                      {Object.entries(pref.style_preferences).map(([style, score]) => (
                        <div key={style} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{style}</span>
                            <span>{(score * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={score * 100} className="h-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>New Users</span>
                </CardTitle>
                <CardDescription>Users with less than 10 generations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">247</div>
                  <p className="text-sm text-muted-foreground">
                    Benefit from guided provider selection
                  </p>
                  <Badge className="bg-blue-100 text-blue-800">Growing +12%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Power Users</span>
                </CardTitle>
                <CardDescription>Users with 50+ generations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-sm text-muted-foreground">
                    Have strong provider preferences
                  </p>
                  <Badge className="bg-green-100 text-green-800">Stable</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Explorers</span>
                </CardTitle>
                <CardDescription>Users trying different providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-sm text-muted-foreground">
                    Switch providers frequently
                  </p>
                  <Badge className="bg-purple-100 text-purple-800">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};