import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { Plus, Play, Pause, BarChart } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-state';

interface ABTest {
  test_name: string;
  variants: string[];
  event_counts: Record<string, number>;
  total_users: number;
  status: 'active' | 'paused' | 'completed';
}

export const ABTestManager: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [newVariants, setNewVariants] = useState(['A', 'B']);
  
  const { createABTest, trackABTestEvent } = useAdvancedAnalytics();

  // Get A/B test data
  const { data: abTests, isLoading, error, refetch } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ab_test_events')
        .select('test_name, variant, event_type, metadata')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Process data to group by test
      const testsMap = new Map<string, ABTest>();
      
      data?.forEach(event => {
        const testName = event.test_name;
        if (!testsMap.has(testName)) {
          testsMap.set(testName, {
            test_name: testName,
            variants: [],
            event_counts: {},
            total_users: 0,
            status: 'active',
          });
        }
        
        const test = testsMap.get(testName)!;
        if (!test.variants.includes(event.variant)) {
          test.variants.push(event.variant);
        }
        
        const key = `${event.variant}_${event.event_type}`;
        test.event_counts[key] = (test.event_counts[key] || 0) + 1;
        test.total_users++;
      });

      return Array.from(testsMap.values());
    },
  });

  const handleCreateTest = async () => {
    if (!newTestName.trim()) return;

    try {
      await createABTest.mutateAsync({
        test_name: newTestName,
        variants: newVariants,
        criteria: {},
      });
      
      setShowCreateDialog(false);
      setNewTestName('');
      setNewVariants(['A', 'B']);
      refetch();
    } catch (error) {
      console.error('Failed to create A/B test:', error);
    }
  };

  const addVariant = () => {
    const nextLetter = String.fromCharCode(65 + newVariants.length);
    setNewVariants([...newVariants, nextLetter]);
  };

  const removeVariant = (index: number) => {
    if (newVariants.length > 2) {
      setNewVariants(newVariants.filter((_, i) => i !== index));
    }
  };

  const getVariantStats = (test: ABTest, variant: string) => {
    const impressions = test.event_counts[`${variant}_impression`] || 0;
    const conversions = test.event_counts[`${variant}_conversion`] || 0;
    const conversionRate = impressions > 0 ? (conversions / impressions) * 100 : 0;
    
    return { impressions, conversions, conversionRate };
  };

  const getWinningVariant = (test: ABTest) => {
    let winningVariant = test.variants[0];
    let highestRate = 0;

    test.variants.forEach(variant => {
      const { conversionRate } = getVariantStats(test, variant);
      if (conversionRate > highestRate) {
        highestRate = conversionRate;
        winningVariant = variant;
      }
    });

    return { variant: winningVariant, rate: highestRate };
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            A/B Test Management
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Test
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New A/B Test</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    placeholder="e.g., homepage_hero_test"
                  />
                </div>
                <div>
                  <Label>Variants</Label>
                  <div className="space-y-2">
                    {newVariants.map((variant, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={variant}
                          onChange={(e) => {
                            const updated = [...newVariants];
                            updated[index] = e.target.value;
                            setNewVariants(updated);
                          }}
                          className="flex-1"
                        />
                        {newVariants.length > 2 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeVariant(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" onClick={addVariant}>
                      Add Variant
                    </Button>
                  </div>
                </div>
                <Button onClick={handleCreateTest} className="w-full">
                  Create Test
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <LoadingState
          isLoading={isLoading}
          error={error}
          loadingMessage="Loading A/B tests..."
          errorMessage="Failed to load A/B tests"
        >
          {abTests && abTests.length > 0 ? (
            <div className="space-y-6">
              {abTests.map((test) => {
                const winner = getWinningVariant(test);
                
                return (
                  <Card key={test.test_name}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{test.test_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={test.status === 'active' ? 'default' : 'secondary'}>
                              {test.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {test.total_users} total events
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {test.variants.map((variant) => {
                          const stats = getVariantStats(test, variant);
                          const isWinner = variant === winner.variant;
                          
                          return (
                            <Card key={variant} className={isWinner ? 'ring-2 ring-green-500' : ''}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">Variant {variant}</span>
                                  {isWinner && (
                                    <Badge variant="default" className="bg-green-600">
                                      Winner
                                    </Badge>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Impressions:</span>
                                    <span className="font-medium">{stats.impressions}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Conversions:</span>
                                    <span className="font-medium">{stats.conversions}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Rate:</span>
                                    <span className={`font-medium ${isWinner ? 'text-green-600' : ''}`}>
                                      {stats.conversionRate.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No A/B Tests Found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first A/B test to start optimizing your conversion rates.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Test
              </Button>
            </div>
          )}
        </LoadingState>
      </CardContent>
    </Card>
  );
};