import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Eye,
  Users,
  Database,
  Globe,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SecurityAlert {
  id: string;
  type: 'threat' | 'vulnerability' | 'compliance' | 'access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  status: 'active' | 'investigating' | 'resolved';
  affectedSystems: string[];
}

interface SecurityMetric {
  name: string;
  value: number;
  max: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export const SecurityMonitoring: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date>(new Date());

  // Mock data - in real app, fetch from security monitoring API
  useEffect(() => {
    const mockAlerts: SecurityAlert[] = [
      {
        id: '1',
        type: 'threat',
        severity: 'high',
        title: 'Suspicious Login Activity',
        description: 'Multiple failed login attempts from unknown IP addresses',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'investigating',
        affectedSystems: ['Authentication', 'User Management']
      },
      {
        id: '2',
        type: 'vulnerability',
        severity: 'medium',
        title: 'Outdated Dependencies',
        description: '3 packages with known security vulnerabilities detected',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        status: 'active',
        affectedSystems: ['Dependencies', 'Build System']
      },
      {
        id: '3',
        type: 'compliance',
        severity: 'low',
        title: 'Access Review Due',
        description: 'Quarterly access review is due for 12 users',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'active',
        affectedSystems: ['User Management', 'Compliance']
      }
    ];

    const mockMetrics: SecurityMetric[] = [
      {
        name: 'Security Score',
        value: 87,
        max: 100,
        status: 'good',
        trend: 'up'
      },
      {
        name: 'Active Threats',
        value: 2,
        max: 10,
        status: 'warning',
        trend: 'stable'
      },
      {
        name: 'Compliance Rate',
        value: 94,
        max: 100,
        status: 'good',
        trend: 'up'
      },
      {
        name: 'System Vulnerabilities',
        value: 3,
        max: 20,
        status: 'good',
        trend: 'down'
      }
    ];

    setAlerts(mockAlerts);
    setMetrics(mockMetrics);
  }, []);

  const handleRunScan = async () => {
    setIsScanning(true);
    // Simulate security scan
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsScanning(false);
    setLastScan(new Date());
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600';
      case 'investigating': return 'text-yellow-600';
      case 'active': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Security Monitoring</h2>
          <p className="text-muted-foreground">
            Monitor security threats, vulnerabilities, and compliance status
          </p>
        </div>
        <Button 
          onClick={handleRunScan} 
          disabled={isScanning}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Run Security Scan'}
        </Button>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <div className="flex items-center gap-1">
                {metric.status === 'good' && <CheckCircle className="h-4 w-4 text-green-600" />}
                {metric.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                {metric.status === 'critical' && <XCircle className="h-4 w-4 text-red-600" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <Progress 
                value={(metric.value / metric.max) * 100} 
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Trend: {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="threats">Threat Detection</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Security Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Alert key={alert.id} className="border-l-4 border-l-red-400">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{alert.type}</Badge>
                          <span className={`text-sm ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                        </div>
                        <h4 className="font-semibold">{alert.title}</h4>
                        <AlertDescription className="mt-1">
                          {alert.description}
                        </AlertDescription>
                        <div className="mt-2 text-sm text-muted-foreground">
                          Affected: {alert.affectedSystems.join(', ')} • 
                          {alert.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Investigate
                      </Button>
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Threat Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Known Threat Actors</span>
                    <Badge variant="secondary">5 Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Malware Signatures</span>
                    <Badge variant="secondary">Updated 2h ago</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>IP Blacklist</span>
                    <Badge variant="secondary">1,247 entries</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Network Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Suspicious Connections</span>
                    <Badge variant="destructive">3 Blocked</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>DDoS Attempts</span>
                    <Badge variant="secondary">0 Today</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Failed Login Attempts</span>
                    <Badge variant="default">12 Last Hour</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  GDPR Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">98%</div>
                <Progress value={98} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  2 items require attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">95%</div>
                <Progress value={95} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  Encryption coverage
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">87%</div>
                <Progress value={87} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  MFA adoption rate
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Real-time Security Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span>System Health</span>
                  </div>
                  <Badge variant="outline">All Systems Operational</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span>Threat Detection</span>
                  </div>
                  <Badge variant="default">2 Active Investigations</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Data Protection</span>
                  </div>
                  <Badge variant="outline">Encryption Active</Badge>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                Last security scan: {lastScan.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};