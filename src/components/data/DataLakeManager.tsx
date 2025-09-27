import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Database, Upload, Download, FileText, BarChart3, RefreshCw, GitBranch, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  type: 'images' | 'text' | 'metrics' | 'analytics' | 'user_data';
  status: 'active' | 'syncing' | 'error' | 'paused';
  lastSync: string;
  recordCount: number;
  sizeGB: number;
  lineage: string[];
}

interface ETLPipeline {
  id: string;
  name: string;
  source: string;
  destination: string;
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  progress: number;
  lastRun: string;
  duration: string;
  transformations: string[];
}

interface DataVersion {
  id: string;
  version: string;
  timestamp: string;
  changes: string;
  size: string;
  checksum: string;
  author: string;
}

export const DataLakeManager: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('sources');
  const [syncing, setSyncing] = useState(false);

  const dataSources: DataSource[] = [
    {
      id: '1',
      name: 'Generated Images',
      type: 'images',
      status: 'active',
      lastSync: '2024-01-15 14:30:00',
      recordCount: 45230,
      sizeGB: 12.5,
      lineage: ['RAW_IMAGES', 'PROCESSED_IMAGES', 'METADATA_EXTRACTION']
    },
    {
      id: '2',
      name: 'User Analytics',
      type: 'analytics',
      status: 'syncing',
      lastSync: '2024-01-15 14:25:00',
      recordCount: 128450,
      sizeGB: 3.2,
      lineage: ['USER_EVENTS', 'SESSION_DATA', 'CONVERSION_METRICS']
    },
    {
      id: '3',
      name: 'Product Descriptions',
      type: 'text',
      status: 'active',
      lastSync: '2024-01-15 14:28:00',
      recordCount: 8920,
      sizeGB: 0.8,
      lineage: ['RAW_TEXT', 'NLP_PROCESSED', 'EMBEDDINGS']
    },
    {
      id: '4',
      name: 'Performance Metrics',
      type: 'metrics',
      status: 'error',
      lastSync: '2024-01-15 13:45:00',
      recordCount: 234567,
      sizeGB: 5.7,
      lineage: ['SYSTEM_METRICS', 'APPLICATION_LOGS', 'ERROR_TRACKING']
    }
  ];

  const etlPipelines: ETLPipeline[] = [
    {
      id: '1',
      name: 'Image Metadata Extraction',
      source: 'Generated Images',
      destination: 'Analytics Warehouse',
      status: 'running',
      progress: 75,
      lastRun: '2024-01-15 14:00:00',
      duration: '45m 32s',
      transformations: ['Extract EXIF', 'Generate Thumbnails', 'Color Analysis', 'Object Detection']
    },
    {
      id: '2',
      name: 'User Behavior Analysis',
      source: 'User Analytics',
      destination: 'ML Training Data',
      status: 'completed',
      progress: 100,
      lastRun: '2024-01-15 13:30:00',
      duration: '23m 15s',
      transformations: ['Sessionization', 'Feature Engineering', 'Anomaly Detection']
    },
    {
      id: '3',
      name: 'Text Sentiment Processing',
      source: 'Product Descriptions',
      destination: 'NLP Models',
      status: 'scheduled',
      progress: 0,
      lastRun: '2024-01-15 12:00:00',
      duration: '-',
      transformations: ['Tokenization', 'Sentiment Analysis', 'Topic Modeling', 'Embeddings']
    }
  ];

  const dataVersions: DataVersion[] = [
    {
      id: '1',
      version: 'v2.1.3',
      timestamp: '2024-01-15 14:30:00',
      changes: 'Added new image metadata fields and color analysis',
      size: '18.2 GB',
      checksum: 'sha256:a1b2c3d4...',
      author: 'system'
    },
    {
      id: '2',
      version: 'v2.1.2',
      timestamp: '2024-01-15 10:15:00',
      changes: 'Performance metrics schema update',
      size: '17.8 GB',
      checksum: 'sha256:e5f6g7h8...',
      author: 'admin'
    },
    {
      id: '3',
      version: 'v2.1.1',
      timestamp: '2024-01-14 16:45:00',
      changes: 'User analytics data structure optimization',
      size: '17.3 GB',
      checksum: 'sha256:i9j0k1l2...',
      author: 'system'
    }
  ];

  const handleSyncData = async (sourceId: string) => {
    setSyncing(true);
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Data Sync Started",
        description: "Data synchronization initiated successfully.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to start data synchronization.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleRunPipeline = async (pipelineId: string) => {
    try {
      toast({
        title: "Pipeline Started",
        description: "ETL pipeline execution initiated.",
      });
    } catch (error) {
      toast({
        title: "Pipeline Failed",
        description: "Failed to start ETL pipeline.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'syncing':
      case 'running':
        return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
      case 'error':
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'active': 'default',
      'completed': 'default',
      'syncing': 'secondary',
      'running': 'secondary',
      'error': 'destructive',
      'failed': 'destructive',
      'scheduled': 'outline',
      'paused': 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Data Lake Manager</h2>
      </div>

      <Tabs defaultValue="sources" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="pipelines">ETL Pipelines</TabsTrigger>
          <TabsTrigger value="versions">Data Versions</TabsTrigger>
          <TabsTrigger value="lineage">Data Lineage</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataSources.map((source) => (
              <Card key={source.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    {getStatusIcon(source.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(source.status)}
                    <Badge variant="outline">{source.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Records</p>
                      <p className="font-medium">{source.recordCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p className="font-medium">{source.sizeGB} GB</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last Sync</p>
                    <p className="text-sm font-medium">{source.lastSync}</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleSyncData(source.id)}
                    disabled={syncing || source.status === 'syncing'}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    Sync Data
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-4">
          {etlPipelines.map((pipeline) => (
            <Card key={pipeline.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{pipeline.name}</CardTitle>
                    <CardDescription>
                      {pipeline.source} → {pipeline.destination}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(pipeline.status)}
                    <Button 
                      size="sm" 
                      onClick={() => handleRunPipeline(pipeline.id)}
                      disabled={pipeline.status === 'running'}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{pipeline.progress}%</span>
                  </div>
                  <Progress value={pipeline.progress} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Last Run</p>
                    <p className="font-medium">{pipeline.lastRun}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{pipeline.duration}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Transformations</p>
                  <div className="flex flex-wrap gap-1">
                    {pipeline.transformations.map((transform, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {transform}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          {dataVersions.map((version) => (
            <Card key={version.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      {version.version}
                    </CardTitle>
                    <CardDescription>{version.timestamp}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{version.changes}</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-medium">{version.size}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Author</p>
                    <p className="font-medium">{version.author}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Checksum</p>
                    <p className="font-mono text-xs">{version.checksum}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="lineage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Lineage Visualization</CardTitle>
              <CardDescription>
                Track data flow and transformations across your data lake
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dataSources.map((source) => (
                  <div key={source.id} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">{source.name}</h4>
                    <div className="flex items-center gap-2 text-sm">
                      {source.lineage.map((step, index) => (
                        <React.Fragment key={step}>
                          <Badge variant="outline">{step}</Badge>
                          {index < source.lineage.length - 1 && (
                            <div className="h-px bg-border flex-1 min-w-4" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};