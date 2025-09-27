import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecurityMonitoring } from './SecurityMonitoring';
import { EnterpriseAuth } from './EnterpriseAuth';
import { AuditLogging } from './AuditLogging';
import { ComplianceManagement } from './ComplianceManagement';
import { 
  Shield, 
  Users, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Lock,
  Eye,
  Activity
} from 'lucide-react';

export const EnterpriseSecurityDashboard: React.FC = () => {
  const [securityMetrics] = useState({
    overallScore: 89,
    activeThreats: 3,
    complianceRate: 94,
    authenticatedUsers: 1247,
    failedLogins24h: 23,
    auditEvents24h: 1456,
    criticalAlerts: 2,
    mfaAdoption: 87
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Enterprise Security</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive security monitoring, compliance, and enterprise authentication
          </p>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Score</p>
                <p className="text-3xl font-bold text-green-600">{securityMetrics.overallScore}%</p>
                <p className="text-xs text-muted-foreground">↗ +2% from last week</p>
              </div>
              <Shield className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Threats</p>
                <p className="text-3xl font-bold text-red-600">{securityMetrics.activeThreats}</p>
                <p className="text-xs text-muted-foreground">2 high priority</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Rate</p>
                <p className="text-3xl font-bold text-blue-600">{securityMetrics.complianceRate}%</p>
                <p className="text-xs text-muted-foreground">GDPR, SOX, ISO 27001</p>
              </div>
              <CheckCircle className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-3xl font-bold text-purple-600">
                  {securityMetrics.authenticatedUsers.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{securityMetrics.mfaAdoption}% with MFA</p>
              </div>
              <Users className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Logins (24h)</p>
                <p className="text-2xl font-bold">{securityMetrics.failedLogins24h}</p>
              </div>
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Audit Events (24h)</p>
                <p className="text-2xl font-bold">{securityMetrics.auditEvents24h.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{securityMetrics.criticalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold text-green-600">Healthy</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="monitoring" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Security Monitoring
          </TabsTrigger>
          <TabsTrigger value="auth" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Enterprise Auth
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Audit Logging
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="mt-6">
          <SecurityMonitoring />
        </TabsContent>

        <TabsContent value="auth" className="mt-6">
          <EnterpriseAuth />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditLogging />
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <ComplianceManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};