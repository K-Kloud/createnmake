/**
 * Security Dashboard Component
 * Displays real-time security metrics and alerts
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { Shield, AlertTriangle, Eye, Lock, Activity } from 'lucide-react';

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
}

export const SecurityDashboard: React.FC = () => {
  const { getMetrics } = useSecurityMonitoring();
  const [metrics, setMetrics] = useState(getMetrics());
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, [getMetrics]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'hsl(var(--destructive))';
      case 'high': return 'hsl(var(--warning))';
      case 'medium': return 'hsl(var(--warning))';
      case 'low': return 'hsl(var(--success))';
      default: return 'hsl(var(--muted))';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Eye className="h-4 w-4" />;
      case 'low':
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor your application's security in real-time
          </p>
        </div>
        <Badge 
          variant="outline" 
          style={{ color: getRiskColor(metrics.riskLevel) }}
          className="flex items-center gap-1"
        >
          {getRiskIcon(metrics.riskLevel)}
          Risk Level: {metrics.riskLevel.toUpperCase()}
        </Badge>
      </div>

      {/* Security Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.failedLogins}</div>
            <p className="text-xs text-muted-foreground">
              Authentication failures detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.suspiciousRequests}</div>
            <p className="text-xs text-muted-foreground">
              Anomalous activity patterns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Access Attempts</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.dataExfiltrationAttempts}</div>
            <p className="text-xs text-muted-foreground">
              Unauthorized access blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Threat</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.lastThreatDetected 
                ? new Date(metrics.lastThreatDetected).toLocaleTimeString()
                : 'None'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent security event
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Alerts</CardTitle>
          <CardDescription>
            Latest security events and threat notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-6">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No alerts</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                All systems are secure and operating normally.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{alert.type.replace('_', ' ').toUpperCase()}</span>
                    <Badge variant="outline" className="text-xs">
                      {alert.severity}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>
                    {alert.message}
                    <span className="block text-xs mt-1 opacity-70">
                      {alert.timestamp.toLocaleString()}
                    </span>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
          <CardDescription>
            Proactive security measures and best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">
                  Enable 2FA for enhanced account security
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Strong Password Policy</p>
                <p className="text-xs text-muted-foreground">
                  Enforce complex passwords with regular rotation
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Eye className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Activity Monitoring</p>
                <p className="text-xs text-muted-foreground">
                  Regular review of user access patterns and permissions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};