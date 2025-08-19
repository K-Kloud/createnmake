import { MainLayout } from "@/components/layouts/MainLayout";
import { BundleOptimizer } from "@/components/deployment/BundleOptimizer";
import { ProductionMonitor } from "@/components/deployment/ProductionMonitor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Box, 
  CheckCircle, 
  Cloud, 
  Database, 
  Download, 
  Globe, 
  Rocket,
  Settings,
  Shield
} from "lucide-react";

const ProductionDashboard = () => {
  const deploymentStatus = {
    environment: 'Production',
    version: 'v1.2.3',
    deployed: '2 hours ago',
    status: 'healthy',
    uptime: '99.9%',
  };

  const quickActions = [
    { label: 'Deploy Update', icon: Rocket, action: () => console.log('Deploy') },
    { label: 'View Logs', icon: Database, action: () => console.log('Logs') },
    { label: 'Download Report', icon: Download, action: () => console.log('Download') },
    { label: 'Settings', icon: Settings, action: () => console.log('Settings') },
  ];

  return (
    <MainLayout
      seo={{
        title: "Production Dashboard | Deployment & Monitoring",
        description: "Production environment monitoring, deployment status, bundle optimization, and performance metrics."
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Production Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor deployment status, optimize bundles, and track production performance.
            </p>
          </div>

          {/* Status Overview */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Deployment Status
                </CardTitle>
                <CardDescription>
                  Current production environment status and information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Environment</div>
                    <div className="font-semibold">{deploymentStatus.environment}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Version</div>
                    <div className="font-semibold">{deploymentStatus.version}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Deployed</div>
                    <div className="font-semibold">{deploymentStatus.deployed}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge variant="default" className="font-semibold">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {deploymentStatus.status}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Uptime</div>
                    <div className="font-semibold text-green-600">{deploymentStatus.uptime}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      className="flex items-center gap-2"
                    >
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="monitoring" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Monitoring
              </TabsTrigger>
              <TabsTrigger value="optimization" className="flex items-center gap-2">
                <Box className="h-4 w-4" />
                Bundle
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="deployment" className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Deployment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monitoring">
              <ProductionMonitor />
            </TabsContent>

            <TabsContent value="optimization">
              <BundleOptimizer />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Configuration
                  </CardTitle>
                  <CardDescription>
                    Production security settings and compliance status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { name: 'SSL/TLS Certificate', status: 'Valid', expires: '90 days' },
                        { name: 'Security Headers', status: 'Configured', score: 'A+' },
                        { name: 'Rate Limiting', status: 'Active', limit: '100/min' },
                        { name: 'WAF Rules', status: 'Enabled', blocked: '15 today' },
                        { name: 'Database Encryption', status: 'Active', type: 'AES-256' },
                        { name: 'Backup Encryption', status: 'Active', retention: '30 days' },
                      ].map((item) => (
                        <Card key={item.name}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium">{item.name}</div>
                              <Badge variant="default">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {item.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {'expires' in item && `Expires: ${item.expires}`}
                              {'score' in item && `Score: ${item.score}`}
                              {'limit' in item && `Limit: ${item.limit}`}
                              {'blocked' in item && `Blocked: ${item.blocked}`}
                              {'type' in item && `Type: ${item.type}`}
                              {'retention' in item && `Retention: ${item.retention}`}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deployment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Deployment Pipeline
                  </CardTitle>
                  <CardDescription>
                    CI/CD pipeline status and deployment history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">✓</div>
                            <div className="text-sm font-medium">Build</div>
                            <div className="text-xs text-muted-foreground">2m 15s</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">✓</div>
                            <div className="text-sm font-medium">Tests</div>
                            <div className="text-xs text-muted-foreground">45s</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">✓</div>
                            <div className="text-sm font-medium">Deploy</div>
                            <div className="text-xs text-muted-foreground">1m 30s</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Recent Deployments</h4>
                      <div className="space-y-2">
                        {[
                          { version: 'v1.2.3', time: '2 hours ago', status: 'success', author: 'Admin' },
                          { version: 'v1.2.2', time: '1 day ago', status: 'success', author: 'Admin' },
                          { version: 'v1.2.1', time: '3 days ago', status: 'success', author: 'Admin' },
                        ].map((deployment) => (
                          <div key={deployment.version} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <div>
                                <div className="font-medium">{deployment.version}</div>
                                <div className="text-sm text-muted-foreground">
                                  by {deployment.author} • {deployment.time}
                                </div>
                              </div>
                            </div>
                            <Badge variant="default">
                              {deployment.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductionDashboard;