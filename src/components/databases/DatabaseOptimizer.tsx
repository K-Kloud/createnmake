import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Zap, 
  TrendingUp, 
  Clock, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Activity,
  HardDrive,
  Network,
  Settings,
  Play,
  Eye
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DatabaseMetrics {
  connection_count: number;
  active_queries: number;
  query_response_time: number;
  cache_hit_ratio: number;
  disk_usage: number;
  cpu_usage: number;
  memory_usage: number;
  transactions_per_second: number;
}

interface SlowQuery {
  id: string;
  query: string;
  duration: number;
  frequency: number;
  last_executed: string;
  optimization_suggestion: string;
  impact: 'high' | 'medium' | 'low';
}

interface IndexSuggestion {
  id: string;
  table: string;
  columns: string[];
  type: 'btree' | 'gin' | 'gist' | 'hash';
  estimated_improvement: number;
  size_impact: string;
  priority: 'high' | 'medium' | 'low';
}

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'primary' | 'replica' | 'cache';
  status: 'healthy' | 'warning' | 'critical';
  host: string;
  connections: number;
  max_connections: number;
  lag: number;
}

export const DatabaseOptimizer: React.FC = () => {
  const [metrics, setMetrics] = useState<DatabaseMetrics | null>(null);
  const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([]);
  const [indexSuggestions, setIndexSuggestions] = useState<IndexSuggestion[]>([]);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDatabaseData();
    const interval = setInterval(loadDatabaseData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDatabaseData = async () => {
    try {
      // Simulate database metrics
      const mockMetrics: DatabaseMetrics = {
        connection_count: 45 + Math.floor(Math.random() * 30),
        active_queries: 8 + Math.floor(Math.random() * 15),
        query_response_time: 85 + Math.random() * 50,
        cache_hit_ratio: 92 + Math.random() * 6,
        disk_usage: 68.5,
        cpu_usage: 35 + Math.random() * 30,
        memory_usage: 72 + Math.random() * 15,
        transactions_per_second: 1200 + Math.random() * 400
      };

      const mockSlowQueries: SlowQuery[] = [
        {
          id: '1',
          query: 'SELECT * FROM products p JOIN categories c ON p.category_id = c.id WHERE p.status = ?',
          duration: 2850,
          frequency: 145,
          last_executed: '2024-01-15T16:45:00Z',
          optimization_suggestion: 'Add index on products.status and optimize JOIN operation',
          impact: 'high'
        },
        {
          id: '2',
          query: 'UPDATE user_sessions SET last_activity = NOW() WHERE user_id = ?',
          duration: 1200,
          frequency: 2340,
          last_executed: '2024-01-15T16:44:55Z',
          optimization_suggestion: 'Consider batching updates or using async processing',
          impact: 'medium'
        },
        {
          id: '3',
          query: 'SELECT COUNT(*) FROM order_items oi JOIN orders o ON oi.order_id = o.id',
          duration: 950,
          frequency: 78,
          last_executed: '2024-01-15T16:44:32Z',
          optimization_suggestion: 'Use materialized view or add composite index',
          impact: 'low'
        }
      ];

      const mockIndexSuggestions: IndexSuggestion[] = [
        {
          id: '1',
          table: 'products',
          columns: ['status', 'category_id'],
          type: 'btree',
          estimated_improvement: 65,
          size_impact: '12 MB',
          priority: 'high'
        },
        {
          id: '2',
          table: 'user_sessions',
          columns: ['user_id', 'last_activity'],
          type: 'btree',
          estimated_improvement: 45,
          size_impact: '8 MB',
          priority: 'medium'
        },
        {
          id: '3',
          table: 'order_items',
          columns: ['order_id', 'product_id'],
          type: 'btree',
          estimated_improvement: 30,
          size_impact: '15 MB',
          priority: 'medium'
        }
      ];

      const mockConnections: DatabaseConnection[] = [
        {
          id: '1',
          name: 'Primary Database',
          type: 'primary',
          status: 'healthy',
          host: 'db-primary.internal',
          connections: 45,
          max_connections: 100,
          lag: 0
        },
        {
          id: '2',
          name: 'Read Replica 1',
          type: 'replica',
          status: 'healthy',
          host: 'db-replica-1.internal',
          connections: 23,
          max_connections: 80,
          lag: 12
        },
        {
          id: '3',
          name: 'Redis Cache',
          type: 'cache',
          status: 'warning',
          host: 'redis-cache.internal',
          connections: 156,
          max_connections: 200,
          lag: 1
        }
      ];

      setMetrics(mockMetrics);
      setSlowQueries(mockSlowQueries);
      setIndexSuggestions(mockIndexSuggestions);
      setConnections(mockConnections);
    } catch (error) {
      console.error('Error loading database data:', error);
    }
  };

  const optimizeDatabase = async () => {
    setIsOptimizing(true);
    try {
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Database Optimization Complete",
        description: "Performance improvements have been applied successfully."
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Failed to apply database optimizations.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const createIndex = async (suggestion: IndexSuggestion) => {
    try {
      // Simulate index creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Index Created",
        description: `Index on ${suggestion.table}(${suggestion.columns.join(', ')}) created successfully.`
      });
      
      // Remove the suggestion from the list
      setIndexSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    } catch (error) {
      toast({
        title: "Index Creation Failed",
        description: "Failed to create database index.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-500 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Zap className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 animate-spin" />
            Loading database metrics...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Database Optimizer</h2>
          <p className="text-muted-foreground">AI-powered database performance optimization</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={optimizeDatabase}
            disabled={isOptimizing}
            className="gap-2"
          >
            {isOptimizing ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Optimize Now
              </>
            )}
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Database Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Network className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.connection_count}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Active queries: {metrics.active_queries}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.query_response_time.toFixed(0)}ms</div>
            <div className="text-xs text-muted-foreground mt-1">
              TPS: {metrics.transactions_per_second.toFixed(0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Ratio</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cache_hit_ratio.toFixed(1)}%</div>
            <Progress value={metrics.cache_hit_ratio} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.disk_usage.toFixed(1)}%</div>
            <Progress value={metrics.disk_usage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queries">Slow Queries</TabsTrigger>
          <TabsTrigger value="indexes">Index Suggestions</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="queries">
          <Card>
            <CardHeader>
              <CardTitle>Slow Query Analysis</CardTitle>
              <CardDescription>Queries that need optimization based on execution time and frequency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {slowQueries.map((query) => (
                  <div key={query.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(query.impact)}
                        <Badge variant="outline" className={getStatusColor(query.impact === 'high' ? 'critical' : query.impact === 'medium' ? 'warning' : 'healthy')}>
                          {query.impact} impact
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {query.duration}ms avg • {query.frequency} executions
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          Explain
                        </Button>
                        <Button size="sm">
                          Optimize
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                        {query.query}
                      </div>
                      <div className="text-sm">
                        <strong>Suggestion:</strong> {query.optimization_suggestion}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indexes">
          <Card>
            <CardHeader>
              <CardTitle>Index Recommendations</CardTitle>
              <CardDescription>AI-generated index suggestions to improve query performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {indexSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getPriorityIcon(suggestion.priority)}
                        <div>
                          <h4 className="font-medium">
                            {suggestion.table}({suggestion.columns.join(', ')})
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.type.toUpperCase()} index • Size impact: {suggestion.size_impact}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-500">
                            +{suggestion.estimated_improvement}%
                          </div>
                          <div className="text-xs text-muted-foreground">improvement</div>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => createIndex(suggestion)}
                        >
                          Create Index
                        </Button>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className={getStatusColor(suggestion.priority === 'high' ? 'critical' : suggestion.priority === 'medium' ? 'warning' : 'healthy')}>
                      {suggestion.priority} priority
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle>Database Connections</CardTitle>
              <CardDescription>Monitor database cluster health and connection status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connections.map((conn) => (
                  <div key={conn.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Database className="w-4 h-4 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{conn.name}</h4>
                          <p className="text-sm text-muted-foreground">{conn.host}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(conn.status)}
                        <Badge variant="outline" className={getStatusColor(conn.status)}>
                          {conn.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type</span>
                        <div className="font-medium capitalize">{conn.type}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Connections</span>
                        <div className="font-medium">
                          {conn.connections}/{conn.max_connections}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Usage</span>
                        <div className="font-medium">
                          {((conn.connections / conn.max_connections) * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lag</span>
                        <div className="font-medium">{conn.lag}ms</div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Progress 
                        value={(conn.connections / conn.max_connections) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Database Maintenance</CardTitle>
              <CardDescription>Automated maintenance tasks and health checks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-Vacuum</h4>
                    <p className="text-sm text-muted-foreground">Automatic table maintenance and cleanup</p>
                  </div>
                  <Badge className="bg-green-50 text-green-500 border-green-200">
                    Enabled
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Statistics Update</h4>
                    <p className="text-sm text-muted-foreground">Query planner statistics refresh</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Run Now
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Backup Validation</h4>
                    <p className="text-sm text-muted-foreground">Verify backup integrity and consistency</p>
                  </div>
                  <Badge className="bg-green-50 text-green-500 border-green-200">
                    Passing
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Connection Pool Optimization</h4>
                    <p className="text-sm text-muted-foreground">Optimize connection pooling settings</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Optimize
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};