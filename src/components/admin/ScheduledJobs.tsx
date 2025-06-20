
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ScheduledJob {
  name: string;
  function: string;
  schedule: string;
  description: string;
  lastRun?: string;
  status: 'active' | 'inactive' | 'running';
}

export const ScheduledJobs: React.FC = () => {
  const { toast } = useToast();
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());

  const scheduledJobs: ScheduledJob[] = [
    {
      name: "Daily Maintenance",
      function: "daily-maintenance",
      schedule: "Every day at 2:00 AM UTC",
      description: "Clean up expired data and maintain system health",
      status: 'active'
    },
    {
      name: "User Engagement Automation",
      function: "user-engagement-automation",
      schedule: "Every day at 10:00 AM UTC",
      description: "Send engagement notifications and reminders",
      status: 'active'
    },
    {
      name: "Weekly Analytics",
      function: "weekly-analytics",
      schedule: "Every Monday at 9:00 AM UTC",
      description: "Generate comprehensive weekly analytics reports",
      status: 'active'
    },
    {
      name: "Marketing Automation",
      function: "marketing-automation",
      schedule: "Every 6 hours",
      description: "Automated marketing campaigns and user targeting",
      status: 'active'
    },
    {
      name: "Business Intelligence",
      function: "business-intelligence",
      schedule: "Every day at 6:00 AM UTC",
      description: "Generate business insights and recommendations",
      status: 'active'
    },
    {
      name: "Automated Reporting",
      function: "automated-reporting",
      schedule: "Every day at 8:00 AM UTC",
      description: "Daily system health and performance reports",
      status: 'active'
    }
  ];

  const { data: reports } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: async () => {
      const { data } = await supabase
        .from('generated_contents')
        .select('content_type, created_at, content_data')
        .in('content_type', [
          'weekly_analytics_report',
          'business_intelligence_report',
          'daily_automated_report'
        ])
        .order('created_at', { ascending: false })
        .limit(10);
      return data;
    },
    refetchInterval: 30000
  });

  const handleRunJob = async (jobFunction: string) => {
    setRunningJobs(prev => new Set(prev).add(jobFunction));
    
    try {
      const { data, error } = await supabase.functions.invoke(jobFunction);
      
      if (error) throw error;
      
      toast({
        title: "Job Started",
        description: `${jobFunction} is now running in the background`,
      });
    } catch (error) {
      console.error('Error running job:', error);
      toast({
        title: "Error",
        description: `Failed to run ${jobFunction}`,
        variant: "destructive",
      });
    } finally {
      setRunningJobs(prev => {
        const next = new Set(prev);
        next.delete(jobFunction);
        return next;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'running':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Running</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scheduled Background Jobs</h2>
          <p className="text-muted-foreground">Manage automated system tasks and reports</p>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scheduledJobs.map((job) => (
          <Card key={job.function} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-lg">{job.name}</CardTitle>
                </div>
                {getStatusBadge(job.status)}
              </div>
              <CardDescription className="text-sm">
                {job.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Schedule:</span>
                  <div className="text-muted-foreground">{job.schedule}</div>
                </div>
                
                <Button
                  onClick={() => handleRunJob(job.function)}
                  disabled={runningJobs.has(job.function)}
                  size="sm"
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {runningJobs.has(job.function) ? 'Running...' : 'Run Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Reports
          </CardTitle>
          <CardDescription>
            Latest generated reports from scheduled jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports?.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {report.content_type === 'weekly_analytics_report' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {report.content_type === 'business_intelligence_report' && (
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  )}
                  {report.content_type === 'daily_automated_report' && (
                    <Clock className="w-4 h-4 text-orange-500" />
                  )}
                  <div>
                    <div className="font-medium">
                      {report.content_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(report.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <Badge variant="outline">Generated</Badge>
              </div>
            ))}
            
            {!reports?.length && (
              <div className="text-center py-8 text-muted-foreground">
                No reports generated yet. Run a scheduled job to see results here.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
