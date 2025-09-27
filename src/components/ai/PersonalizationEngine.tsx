import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Target, TrendingUp, TestTube, BarChart3, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface UserBehaviorData {
  sessionDuration: number;
  pagesViewed: number;
  interactionRate: number;
  preferredCategories: string[];
  timeOfDayActivity: { [key: string]: number };
  deviceUsage: { mobile: number; desktop: number; tablet: number };
}

interface Recommendation {
  id: string;
  type: 'product' | 'style' | 'trend';
  title: string;
  description: string;
  confidence: number;
  reason: string;
  imageUrl?: string;
  category: string;
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: {
    id: string;
    name: string;
    traffic: number;
    conversions: number;
    performance: number;
  }[];
  status: 'running' | 'completed' | 'draft';
  startDate: string;
  endDate?: string;
}

export const PersonalizationEngine = () => {
  const [userBehavior, setUserBehavior] = useState<UserBehaviorData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load initial data
    loadUserBehaviorData();
    loadRecommendations();
    loadABTests();
  }, []);

  const loadUserBehaviorData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockBehavior: UserBehaviorData = {
        sessionDuration: 8.5,
        pagesViewed: 12,
        interactionRate: 0.73,
        preferredCategories: ['Dresses', 'Accessories', 'Casual Wear', 'Formal Wear'],
        timeOfDayActivity: {
          'Morning': 15,
          'Afternoon': 35,
          'Evening': 40,
          'Night': 10
        },
        deviceUsage: { mobile: 65, desktop: 30, tablet: 5 }
      };
      
      setUserBehavior(mockBehavior);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Loading Error',
        description: 'Failed to load user behavior data.',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const mockRecommendations: Recommendation[] = [
        {
          id: '1',
          type: 'product',
          title: 'Minimalist Evening Dress',
          description: 'Based on your browsing pattern and style preferences',
          confidence: 0.87,
          reason: 'High engagement with similar styles',
          category: 'Dresses'
        },
        {
          id: '2',
          type: 'trend',
          title: 'Sustainable Fashion Trend',
          description: 'Emerging trend matching your eco-conscious preferences',
          confidence: 0.79,
          reason: 'Interest in sustainable materials',
          category: 'Trends'
        },
        {
          id: '3',
          type: 'style',
          title: 'Contemporary Minimalism',
          description: 'Style recommendation based on your interaction history',
          confidence: 0.92,
          reason: 'Consistent engagement with minimalist designs',
          category: 'Styles'
        }
      ];
      
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const loadABTests = async () => {
    try {
      const mockABTests: ABTest[] = [
        {
          id: '1',
          name: 'Product Card Layout',
          description: 'Testing different product card designs for better engagement',
          variants: [
            { id: 'A', name: 'Original', traffic: 50, conversions: 127, performance: 0.12 },
            { id: 'B', name: 'Enhanced', traffic: 50, conversions: 156, performance: 0.15 }
          ],
          status: 'running',
          startDate: '2024-01-15',
          endDate: '2024-02-15'
        },
        {
          id: '2',
          name: 'Recommendation Algorithm',
          description: 'Comparing ML-based vs collaborative filtering recommendations',
          variants: [
            { id: 'ML', name: 'Machine Learning', traffic: 40, conversions: 89, performance: 0.18 },
            { id: 'CF', name: 'Collaborative Filtering', traffic: 40, conversions: 72, performance: 0.14 },
            { id: 'Hybrid', name: 'Hybrid Approach', traffic: 20, conversions: 48, performance: 0.22 }
          ],
          status: 'running',
          startDate: '2024-01-20'
        }
      ];
      
      setABTests(mockABTests);
    } catch (error) {
      console.error('Failed to load A/B tests:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success';
    if (confidence >= 0.6) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return <Target className="h-4 w-4" />;
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'style': return <Star className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-success';
      case 'completed': return 'bg-muted';
      case 'draft': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personalization Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="behavior" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="behavior">User Analytics</TabsTrigger>
              <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
              <TabsTrigger value="abtests">A/B Testing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="behavior" className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  <div className="text-center">Loading user behavior data...</div>
                  <Progress value={75} />
                </div>
              ) : userBehavior && (
                <>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary">
                          {userBehavior.sessionDuration}m
                        </div>
                        <p className="text-sm text-muted-foreground">Avg Session Duration</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary">
                          {userBehavior.pagesViewed}
                        </div>
                        <p className="text-sm text-muted-foreground">Pages per Session</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary">
                          {Math.round(userBehavior.interactionRate * 100)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Interaction Rate</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Preferred Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {userBehavior.preferredCategories.map((category, index) => (
                            <Badge key={index} variant="secondary">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Activity Patterns</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(userBehavior.timeOfDayActivity).map(([time, percentage]) => (
                            <div key={time} className="flex items-center justify-between">
                              <span className="text-sm">{time}:</span>
                              <div className="flex items-center gap-2 w-32">
                                <Progress value={percentage} className="flex-1" />
                                <span className="text-sm text-muted-foreground w-8">{percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Device Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(userBehavior.deviceUsage).map(([device, percentage]) => (
                          <div key={device} className="text-center">
                            <div className="text-xl font-bold text-primary">{percentage}%</div>
                            <p className="text-sm text-muted-foreground capitalize">{device}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI-Powered Recommendations</h3>
                <Button onClick={loadRecommendations} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <Card key={rec.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(rec.type)}
                            <h4 className="font-semibold">{rec.title}</h4>
                            <Badge variant="outline" className="capitalize">{rec.type}</Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">Reason:</span>
                            <span>{rec.reason}</span>
                          </div>
                          
                          <Badge variant="secondary">{rec.category}</Badge>
                        </div>
                        
                        <div className="text-center min-w-[80px]">
                          <div className={`text-lg font-bold ${getConfidenceColor(rec.confidence)}`}>
                            {Math.round(rec.confidence * 100)}%
                          </div>
                          <p className="text-xs text-muted-foreground">Confidence</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="abtests" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">A/B Testing Framework</h3>
                <Button variant="outline" size="sm">
                  <TestTube className="h-4 w-4 mr-1" />
                  New Test
                </Button>
              </div>
              
              <div className="space-y-4">
                {abTests.map((test) => (
                  <Card key={test.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{test.name}</CardTitle>
                        <Badge className={`${getStatusColor(test.status)} text-white`}>
                          {test.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Start Date:</span>
                            <div className="font-medium">{test.startDate}</div>
                          </div>
                          {test.endDate && (
                            <div>
                              <span className="text-muted-foreground">End Date:</span>
                              <div className="font-medium">{test.endDate}</div>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h5 className="font-semibold mb-3">Variant Performance:</h5>
                          <div className="space-y-2">
                            {test.variants.map((variant) => (
                              <div key={variant.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline">{variant.id}</Badge>
                                  <span className="font-medium">{variant.name}</span>
                                </div>
                                
                                <div className="flex items-center gap-6 text-sm">
                                  <div className="text-center">
                                    <div className="font-medium">{variant.traffic}%</div>
                                    <div className="text-muted-foreground">Traffic</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-medium">{variant.conversions}</div>
                                    <div className="text-muted-foreground">Conversions</div>
                                  </div>
                                  <div className="text-center">
                                    <div className={`font-medium ${getConfidenceColor(variant.performance)}`}>
                                      {Math.round(variant.performance * 100)}%
                                    </div>
                                    <div className="text-muted-foreground">Performance</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};