import React, { useState, useCallback } from 'react';
import { useMultiStackServices } from '@/hooks/useMultiStackServices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Brain, Cpu, Image, Zap, TrendingUp } from 'lucide-react';

interface ProcessingJob {
  id: string;
  type: 'image_generation' | 'style_transfer' | 'enhancement' | 'analysis';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export const EnhancedAIProcessor: React.FC = () => {
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [selectedModels, setSelectedModels] = useState({
    imageGeneration: 'dall-e-3',
    styleTransfer: 'neural-style',
    enhancement: 'real-esrgan',
    analysis: 'clip-vit'
  });

  const { processWithML, isProcessing, performanceOperation } = useMultiStackServices();
  const { toast } = useToast();

  const createJob = (type: ProcessingJob['type']): ProcessingJob => ({
    id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    status: 'queued',
    progress: 0,
    startTime: new Date()
  });

  const updateJob = (jobId: string, updates: Partial<ProcessingJob>) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    ));
  };

  const processImage = useCallback(async (imageData: string, taskType: string) => {
    const job = createJob(taskType as ProcessingJob['type']);
    setJobs(prev => [...prev, job]);

    try {
      updateJob(job.id, { status: 'processing', progress: 10 });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        updateJob(job.id, { 
          progress: Math.min(90, job.progress + Math.random() * 20)
        });
      }, 1000);

      const result = await processWithML({
        image_data: imageData,
        task_type: taskType as any,
        parameters: {
          model: selectedModels[taskType as keyof typeof selectedModels],
          quality: 'high',
          optimization: true
        }
      });

      clearInterval(progressInterval);

      updateJob(job.id, {
        status: 'completed',
        progress: 100,
        result,
        endTime: new Date()
      });

      toast({
        title: 'Processing Complete',
        description: `${taskType} completed successfully`,
      });

      return result;
    } catch (error) {
      updateJob(job.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        endTime: new Date()
      });

      toast({
        title: 'Processing Failed',
        description: `Failed to complete ${taskType}`,
        variant: 'destructive'
      });
      
      throw error;
    }
  }, [processWithML, selectedModels, toast]);

  const batchProcess = useCallback(async (images: string[], taskType: string) => {
    const batchJob = createJob(taskType as ProcessingJob['type']);
    batchJob.id = `batch-${batchJob.id}`;
    setJobs(prev => [...prev, batchJob]);

    try {
      updateJob(batchJob.id, { status: 'processing', progress: 5 });

      // Use Go performance service for batch optimization
      const optimizedBatch = await performanceOperation('optimize-batch', {
        images,
        task_type: taskType,
        batch_size: images.length
      });

      updateJob(batchJob.id, { progress: 20 });

      const results = await Promise.allSettled(
        images.map(async (imageData, index) => {
          const result = await processWithML({
            image_data: imageData,
            task_type: taskType as any,
            parameters: {
              model: selectedModels[taskType as keyof typeof selectedModels],
              batch_index: index,
              batch_optimization: optimizedBatch
            }
          });

          // Update progress based on completion
          const progress = 20 + ((index + 1) / images.length) * 80;
          updateJob(batchJob.id, { progress });

          return result;
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      updateJob(batchJob.id, {
        status: failed.length === 0 ? 'completed' : 'failed',
        progress: 100,
        result: {
          successful: successful.length,
          failed: failed.length,
          results: successful.map(r => r.status === 'fulfilled' ? r.value : null)
        },
        endTime: new Date()
      });

      toast({
        title: 'Batch Processing Complete',
        description: `${successful.length}/${images.length} images processed successfully`,
      });

    } catch (error) {
      updateJob(batchJob.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Batch processing failed',
        endTime: new Date()
      });

      toast({
        title: 'Batch Processing Failed',
        description: 'Failed to process image batch',
        variant: 'destructive'
      });
    }
  }, [processWithML, performanceOperation, selectedModels, toast]);

  const getJobIcon = (type: ProcessingJob['type']) => {
    switch (type) {
      case 'image_generation': return <Brain className="h-4 w-4" />;
      case 'style_transfer': return <Image className="h-4 w-4" />;
      case 'enhancement': return <Zap className="h-4 w-4" />;
      case 'analysis': return <TrendingUp className="h-4 w-4" />;
      default: return <Cpu className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'processing': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDuration = (start?: Date, end?: Date) => {
    if (!start) return 'N/A';
    const duration = (end || new Date()).getTime() - start.getTime();
    return `${(duration / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Processing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Processing Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => processImage('sample_image_data', 'image_generation')}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Generate
            </Button>
            <Button
              onClick={() => processImage('sample_image_data', 'style_transfer')}
              disabled={isProcessing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Image className="h-4 w-4" />
              Style Transfer
            </Button>
            <Button
              onClick={() => processImage('sample_image_data', 'enhancement')}
              disabled={isProcessing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Enhance
            </Button>
            <Button
              onClick={() => processImage('sample_image_data', 'analysis')}
              disabled={isProcessing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Analyze
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={() => batchProcess(['img1', 'img2', 'img3'], 'enhancement')}
              disabled={isProcessing}
              variant="secondary"
              className="w-full"
            >
              Batch Process (Demo)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No processing jobs yet
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.slice().reverse().map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getJobIcon(job.type)}
                    <div>
                      <div className="font-medium capitalize">
                        {job.type.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Duration: {formatDuration(job.startTime, job.endTime)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(job.status)} text-white`}
                    >
                      {job.status}
                    </Badge>
                    
                    {job.status === 'processing' && (
                      <div className="w-24">
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}
                    
                    {job.status === 'completed' && job.result && (
                      <Button size="sm" variant="outline">
                        View Result
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>AI Model Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(selectedModels).map(([task, model]) => (
              <div key={task} className="space-y-2">
                <label className="text-sm font-medium capitalize">
                  {task.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </label>
                <select
                  value={model}
                  onChange={(e) => setSelectedModels(prev => ({
                    ...prev,
                    [task]: e.target.value
                  }))}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value={model}>{model}</option>
                  <option value="alternative-model">Alternative Model</option>
                </select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};