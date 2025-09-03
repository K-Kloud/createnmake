import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FlaskConical, BarChart3, Users, TrendingUp, Play, Pause, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: ABTestVariant[];
  traffic_split: number;
  start_date: string;
  end_date?: string;
  metrics: ABTestMetrics;
}

interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  config: Record<string, any>;
  traffic_percentage: number;
}

interface ABTestMetrics {
  total_users: number;
  conversions: number;
  conversion_rate: number;
  statistical_significance: number;
}

export const ABTestManager = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    traffic_split: 50
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchABTests();
  }, []);

  const fetchABTests = async () => {
    try {
      setLoading(true);
      
      // Mock A/B tests data
      const mockTests: ABTest[] = [
        {
          id: '1',
          name: 'Provider Recommendation Algorithm V2',
          description: 'Testing new ML-based provider recommendation vs rule-based',
          status: 'running',
          variants: [
            {
              id: 'control',
              name: 'Rule-based (Control)',
              description: 'Current recommendation system',
              config: { algorithm: 'rule_based' },
              traffic_percentage: 50
            },
            {
              id: 'treatment',
              name: 'ML-based (Treatment)',
              description: 'New machine learning recommendations',
              config: { algorithm: 'ml_based' },
              traffic_percentage: 50
            }
          ],
          traffic_split: 50,
          start_date: '2024-01-15',
          metrics: {
            total_users: 1247,
            conversions: 892,
            conversion_rate: 71.5,
            statistical_significance: 95.2
          }
        },
        {
          id: '2',
          name: 'Provider Selection UI',
          description: 'Testing card layout vs dropdown for provider selection',
          status: 'running',
          variants: [
            {
              id: 'cards',
              name: 'Card Layout',
              description: 'Visual cards for each provider',
              config: { ui_type: 'cards' },
              traffic_percentage: 60
            },
            {
              id: 'dropdown',
              name: 'Dropdown',
              description: 'Traditional dropdown selection',
              config: { ui_type: 'dropdown' },
              traffic_percentage: 40
            }
          ],
          traffic_split: 60,
          start_date: '2024-01-20',
          metrics: {
            total_users: 856,
            conversions: 623,
            conversion_rate: 72.8,
            statistical_significance: 87.4
          }
        },
        {
          id: '3',
          name: 'Generation Time Display',
          description: 'Testing if showing estimated time improves user satisfaction',
          status: 'completed',
          variants: [
            {
              id: 'no_time',
              name: 'No Time Display',
              description: 'Standard generation without time estimate',
              config: { show_time: false },
              traffic_percentage: 50
            },
            {
              id: 'with_time',
              name: 'With Time Display',
              description: 'Show estimated generation time',
              config: { show_time: true },
              traffic_percentage: 50
            }
          ],
          traffic_split: 50,
          start_date: '2024-01-01',
          end_date: '2024-01-14',
          metrics: {
            total_users: 2134,
            conversions: 1678,
            conversion_rate: 78.6,
            statistical_significance: 99.1
          }
        }
      ];

      setTests(mockTests);
    } catch (error) {
      console.error('Error fetching A/B tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const createABTest = async () => {
    if (!newTest.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Test name is required"
      });
      return;
    }

    try {
      setCreating(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "A/B Test Created",
        description: `Test "${newTest.name}" has been created successfully`
      });
      
      setNewTest({ name: '', description: '', traffic_split: 50 });
      fetchABTests();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create A/B test"
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleTest = async (testId: string, action: 'start' | 'pause' | 'stop') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: `Test ${action}ed`,
        description: `A/B test has been ${action}ed successfully`
      });
      
      fetchABTests();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${action} test`
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSignificanceColor = (significance: number) => {
    if (significance >= 95) return 'text-green-600';
    if (significance >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
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
          <h1 className="text-3xl font-bold tracking-tight">A/B Test Manager</h1>
          <p className="text-muted-foreground">Manage and monitor A/B tests for provider recommendations</p>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Tests</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {tests.filter(test => test.status === 'running' || test.status === 'paused').map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center space-x-2">
                        <FlaskConical className="h-5 w-5" />
                        <span>{test.name}</span>
                        <Badge className={getStatusColor(test.status)}>
                          {test.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleTest(test.id, test.status === 'running' ? 'pause' : 'start')}
                      >
                        {test.status === 'running' ? (
                          <>
                            <Pause className="mr-1 h-3 w-3" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-1 h-3 w-3" />
                            Resume
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleTest(test.id, 'stop')}
                      >
                        Stop
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="font-medium">Variants</h4>
                      {test.variants.map((variant) => (
                        <div key={variant.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{variant.name}</h5>
                              <p className="text-sm text-muted-foreground">{variant.description}</p>
                            </div>
                            <Badge variant="outline">{variant.traffic_percentage}%</Badge>
                          </div>
                          <Progress value={variant.traffic_percentage} className="h-2" />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Performance Metrics</h4>
                      <div className="grid gap-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Users</span>
                          <span className="font-medium">{test.metrics.total_users.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Conversions</span>
                          <span className="font-medium">{test.metrics.conversions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Conversion Rate</span>
                          <span className="font-medium">{test.metrics.conversion_rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Statistical Significance</span>
                          <span className={`font-medium ${getSignificanceColor(test.metrics.statistical_significance)}`}>
                            {test.metrics.statistical_significance}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {tests.filter(test => test.status === 'completed').map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>{test.name}</span>
                    <Badge className={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {test.description} • Ran from {test.start_date} to {test.end_date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{test.metrics.total_users.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{test.metrics.conversion_rate}%</div>
                        <div className="text-sm text-muted-foreground">Conversion Rate</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getSignificanceColor(test.metrics.statistical_significance)}`}>
                          {test.metrics.statistical_significance}%
                        </div>
                        <div className="text-sm text-muted-foreground">Significance</div>
                      </div>
                      <div className="text-center">
                        <Badge variant="outline" className="text-lg py-2">
                          Winner: {test.variants[0].name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Create New A/B Test</span>
              </CardTitle>
              <CardDescription>Set up a new experiment to test provider recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    placeholder="Enter test name"
                    value={newTest.name}
                    onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trafficSplit">Traffic Split (%)</Label>
                  <Input
                    id="trafficSplit"
                    type="number"
                    min="10"
                    max="90"
                    value={newTest.traffic_split}
                    onChange={(e) => setNewTest(prev => ({ ...prev, traffic_split: Number(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you're testing and why"
                  value={newTest.description}
                  onChange={(e) => setNewTest(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <Button 
                onClick={createABTest} 
                disabled={creating}
                className="w-full"
              >
                {creating ? (
                  <>
                    <FlaskConical className="mr-2 h-4 w-4 animate-spin" />
                    Creating Test...
                  </>
                ) : (
                  <>
                    <FlaskConical className="mr-2 h-4 w-4" />
                    Create A/B Test
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};