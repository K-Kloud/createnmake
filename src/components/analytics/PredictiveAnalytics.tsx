import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { Brain, TrendingUp, AlertTriangle, Target, Calendar, RefreshCw, Play, Settings, Download } from 'lucide-react';

interface ForecastData {
  period: string;
  actual?: number;
  predicted: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
}

interface ChurnPrediction {
  userId: string;
  customerName: string;
  churnProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastActivity: string;
  totalSpent: number;
  recommendations: string[];
}

interface PriceOptimization {
  productId: string;
  productName: string;
  currentPrice: number;
  optimizedPrice: number;
  expectedRevenue: number;
  demandElasticity: number;
  confidence: number;
}

interface ModelMetric {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  status: 'active' | 'training' | 'needs_retraining';
}

export const PredictiveAnalytics: React.FC = () => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState('demand');
  const [training, setTraining] = useState(false);
  const [forecastHorizon, setForecastHorizon] = useState('30d');

  const demandForecast: ForecastData[] = [
    { period: 'Week 1', actual: 850, predicted: 845, confidence: 92, upperBound: 920, lowerBound: 770 },
    { period: 'Week 2', actual: 920, predicted: 925, confidence: 89, upperBound: 1010, lowerBound: 840 },
    { period: 'Week 3', actual: 780, predicted: 785, confidence: 91, upperBound: 860, lowerBound: 710 },
    { period: 'Week 4', predicted: 890, confidence: 87, upperBound: 980, lowerBound: 800 },
    { period: 'Week 5', predicted: 920, confidence: 85, upperBound: 1020, lowerBound: 820 },
    { period: 'Week 6', predicted: 950, confidence: 83, upperBound: 1060, lowerBound: 840 },
    { period: 'Week 7', predicted: 880, confidence: 81, upperBound: 990, lowerBound: 770 },
    { period: 'Week 8', predicted: 910, confidence: 79, upperBound: 1030, lowerBound: 790 }
  ];

  const churnPredictions: ChurnPrediction[] = [
    {
      userId: '1',
      customerName: 'Sarah Johnson',
      churnProbability: 0.85,
      riskLevel: 'high',
      lastActivity: '2024-01-10',
      totalSpent: 1250,
      recommendations: ['Send personalized offer', 'Customer success outreach', 'Loyalty program invitation']
    },
    {
      userId: '2',
      customerName: 'Mike Chen',
      churnProbability: 0.72,
      riskLevel: 'high',
      lastActivity: '2024-01-08',
      totalSpent: 890,
      recommendations: ['Product recommendation email', 'Discount offer', 'Survey for feedback']
    },
    {
      userId: '3',
      customerName: 'Emma Wilson',
      churnProbability: 0.58,
      riskLevel: 'medium',
      lastActivity: '2024-01-12',
      totalSpent: 2100,
      recommendations: ['VIP customer treatment', 'Exclusive preview access']
    },
    {
      userId: '4',
      customerName: 'David Brown',
      churnProbability: 0.45,
      riskLevel: 'medium',
      lastActivity: '2024-01-14',
      totalSpent: 650,
      recommendations: ['Cross-sell campaign', 'Engagement survey']
    }
  ];

  const priceOptimizations: PriceOptimization[] = [
    {
      productId: '1',
      productName: 'Summer Dress Collection',
      currentPrice: 89.99,
      optimizedPrice: 94.99,
      expectedRevenue: 12500,
      demandElasticity: -0.8,
      confidence: 0.89
    },
    {
      productId: '2',
      productName: 'Casual Shirts',
      currentPrice: 45.99,
      optimizedPrice: 42.99,
      expectedRevenue: 8900,
      demandElasticity: -1.2,
      confidence: 0.92
    },
    {
      productId: '3',
      productName: 'Designer Jeans',
      currentPrice: 129.99,
      optimizedPrice: 139.99,
      expectedRevenue: 15600,
      demandElasticity: -0.6,
      confidence: 0.85
    },
    {
      productId: '4',
      productName: 'Accessories Bundle',
      currentPrice: 24.99,
      optimizedPrice: 27.99,
      expectedRevenue: 5400,
      demandElasticity: -0.9,
      confidence: 0.87
    }
  ];

  const modelMetrics: ModelMetric[] = [
    {
      name: 'Demand Forecasting',
      accuracy: 0.89,
      precision: 0.91,
      recall: 0.87,
      f1Score: 0.89,
      lastTrained: '2024-01-14 10:30:00',
      status: 'active'
    },
    {
      name: 'Churn Prediction',
      accuracy: 0.85,
      precision: 0.88,
      recall: 0.82,
      f1Score: 0.85,
      lastTrained: '2024-01-13 15:45:00',
      status: 'active'
    },
    {
      name: 'Price Optimization',
      accuracy: 0.92,
      precision: 0.94,
      recall: 0.90,
      f1Score: 0.92,
      lastTrained: '2024-01-12 09:15:00',
      status: 'needs_retraining'
    },
    {
      name: 'Recommendation Engine',
      accuracy: 0.88,
      precision: 0.86,
      recall: 0.90,
      f1Score: 0.88,
      lastTrained: '2024-01-15 14:20:00',
      status: 'training'
    }
  ];

  const handleTrainModel = async (modelName: string) => {
    setTraining(true);
    try {
      // Simulate model training
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast({
        title: "Model Training Started",
        description: `${modelName} model training initiated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Training Failed",
        description: "Failed to start model training.",
        variant: "destructive",
      });
    } finally {
      setTraining(false);
    }
  };

  const handleRunPrediction = async (modelName: string) => {
    try {
      toast({
        title: "Prediction Started",
        description: `${modelName} prediction run initiated.`,
      });
    } catch (error) {
      toast({
        title: "Prediction Failed",
        description: "Failed to run prediction.",
        variant: "destructive",
      });
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'active': 'default',
      'training': 'secondary',
      'needs_retraining': 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Predictive Analytics</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={forecastHorizon} onValueChange={setForecastHorizon}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Forecast horizon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="forecasting" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecasting">Demand Forecasting</TabsTrigger>
          <TabsTrigger value="churn">Churn Prediction</TabsTrigger>
          <TabsTrigger value="pricing">Price Optimization</TabsTrigger>
          <TabsTrigger value="models">Model Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasting" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Demand Forecast</CardTitle>
                      <CardDescription>Predicted demand with confidence intervals</CardDescription>
                    </div>
                    <Button 
                      onClick={() => handleRunPrediction('Demand Forecasting')}
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run Forecast
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={demandForecast}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="upperBound" 
                        stackId="1"
                        stroke="none" 
                        fill="hsl(var(--primary) / 0.1)" 
                        name="Upper Bound"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="lowerBound" 
                        stackId="1"
                        stroke="none" 
                        fill="hsl(var(--background))" 
                        name="Lower Bound"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="hsl(var(--secondary-foreground))" 
                        strokeWidth={2}
                        name="Actual"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="predicted" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Predicted"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Forecast Accuracy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>MAPE</span>
                      <span>8.5%</span>
                    </div>
                    <Progress value={91.5} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>RMSE</span>
                      <span>45.2</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>MAE</span>
                      <span>32.8</span>
                    </div>
                    <Progress value={88} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-success mt-0.5" />
                      <span>Peak demand expected in Week 6 (950 units)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                      <span>Confidence decreases for longer forecasts</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-primary mt-0.5" />
                      <span>Consider inventory adjustment for Week 3 dip</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="churn" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {churnPredictions.map((prediction) => (
              <Card key={prediction.userId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{prediction.customerName}</CardTitle>
                    <Badge variant={getRiskLevelColor(prediction.riskLevel)}>
                      {prediction.riskLevel} risk
                    </Badge>
                  </div>
                  <CardDescription>
                    Last activity: {prediction.lastActivity}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Churn Probability</span>
                      <span>{(prediction.churnProbability * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={prediction.churnProbability * 100} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Spent</p>
                      <p className="font-medium">${prediction.totalSpent}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Risk Level</p>
                      <p className="font-medium capitalize">{prediction.riskLevel}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Recommendations</p>
                    <div className="space-y-1">
                      {prediction.recommendations.map((rec, index) => (
                        <div key={index} className="text-xs bg-muted rounded p-2">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button size="sm" className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {priceOptimizations.map((optimization) => (
              <Card key={optimization.productId}>
                <CardHeader>
                  <CardTitle>{optimization.productName}</CardTitle>
                  <CardDescription>
                    Price optimization recommendation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Current Price</p>
                      <p className="text-xl font-bold">${optimization.currentPrice}</p>
                    </div>
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Optimized Price</p>
                      <p className="text-xl font-bold text-primary">${optimization.optimizedPrice}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Expected Revenue Impact</span>
                      <span className="font-medium text-success">
                        +${optimization.expectedRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Demand Elasticity</span>
                      <span className="font-medium">{optimization.demandElasticity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Confidence</span>
                      <span className="font-medium">{(optimization.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Recommendation Confidence</span>
                      <span>{(optimization.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={optimization.confidence * 100} />
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Apply Price
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      A/B Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {modelMetrics.map((model) => (
              <Card key={model.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{model.name}</CardTitle>
                    {getStatusBadge(model.status)}
                  </div>
                  <CardDescription>
                    Last trained: {model.lastTrained}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Accuracy</span>
                        <span>{(model.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={model.accuracy * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Precision</span>
                        <span>{(model.precision * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={model.precision * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Recall</span>
                        <span>{(model.recall * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={model.recall * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>F1 Score</span>
                        <span>{(model.f1Score * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={model.f1Score * 100} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleTrainModel(model.name)}
                      disabled={training || model.status === 'training'}
                      className="flex-1"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${training ? 'animate-spin' : ''}`} />
                      Retrain
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRunPrediction(model.name)}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};