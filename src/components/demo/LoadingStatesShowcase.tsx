import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { AdaptiveLoadingIndicator } from '@/components/loading/AdaptiveLoadingIndicator';
import { LoadingManagerProvider, useLoadingManager } from '@/providers/LoadingManagerProvider';
import { SkeletonCard, SkeletonText, SkeletonTable } from '@/components/ui/skeleton';
import { useLoadingState, useAsyncOperation, useProgressiveLoading } from '@/hooks/useLoadingState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LoadingDemo: React.FC = () => {
  const { startLoading, finishLoading } = useLoadingManager();
  const [isPending, startTransition] = useTransition();
  
  // Individual loading state hooks
  const simpleLoading = useLoadingState({ type: 'component' });
  const progressLoading = useLoadingState({ type: 'data', priority: 'high' });
  
  // Async operation with retries
  const asyncOp = useAsyncOperation(
    () => new Promise(resolve => setTimeout(resolve, 2000)),
    { 
      retries: 2, 
      message: 'Performing async operation...',
      onSuccess: () => console.log('Async operation completed!'),
      onError: (error) => console.error('Async operation failed:', error)
    }
  );

  // Progressive loading for multi-stage operations
  const progressiveOp = useProgressiveLoading({
    stages: [
      { name: 'Initializing', weight: 1, operation: () => new Promise(resolve => setTimeout(resolve, 800)) },
      { name: 'Loading Data', weight: 3, operation: () => new Promise(resolve => setTimeout(resolve, 1500)) },
      { name: 'Processing', weight: 2, operation: () => new Promise(resolve => setTimeout(resolve, 1000)) },
      { name: 'Finalizing', weight: 1, operation: () => new Promise(resolve => setTimeout(resolve, 500)) }
    ],
    onStageComplete: (stage, result) => console.log(`Stage ${stage} completed`),
    onAllComplete: (results) => console.log('All stages completed!', results)
  });

  const handleSimpleLoading = () => {
    simpleLoading.start('Loading simple component...');
    setTimeout(() => simpleLoading.finish(), 2000);
  };

  const handleProgressLoading = () => {
    progressLoading.start('Loading with progress...');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      progressLoading.updateProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        progressLoading.finish();
      }
    }, 200);
  };

  const handleGlobalLoading = () => {
    const id = 'global-demo';
    startLoading(id, 'critical', 'Global loading operation...', 'critical');
    setTimeout(() => finishLoading(id), 3000);
  };

  const handleTransition = () => {
    startTransition(() => {
      // Simulate heavy computation
      setTimeout(() => {}, 1000);
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Loading States Demo</h1>
        <p className="text-muted-foreground">
          Demonstrating adaptive loading indicators and skeleton components
        </p>
      </div>

      <Tabs defaultValue="indicators" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="indicators">Loading Indicators</TabsTrigger>
          <TabsTrigger value="skeletons">Skeleton Components</TabsTrigger>
          <TabsTrigger value="states">Loading States</TabsTrigger>
          <TabsTrigger value="progressive">Progressive Loading</TabsTrigger>
        </TabsList>

        <TabsContent value="indicators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adaptive Loading Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Minimal</h4>
                  <AdaptiveLoadingIndicator type="minimal" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Detailed</h4>
                  <AdaptiveLoadingIndicator type="detailed" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Progress</h4>
                  <AdaptiveLoadingIndicator type="progress" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Smart (adapts to context)</h4>
                  <AdaptiveLoadingIndicator type="smart" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skeletons" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Skeleton Card</CardTitle>
              </CardHeader>
              <CardContent>
                <SkeletonCard />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skeleton Text</CardTitle>
              </CardHeader>
              <CardContent>
                <SkeletonText lines={4} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skeleton Table</CardTitle>
              </CardHeader>
              <CardContent>
                <SkeletonTable rows={3} columns={3} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="states" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Simple Loading State</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleSimpleLoading} disabled={simpleLoading.isLoading}>
                  Start Simple Loading
                </Button>
                {simpleLoading.isLoading && (
                  <AdaptiveLoadingIndicator type="minimal" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Loading State</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleProgressLoading} disabled={progressLoading.isLoading}>
                  Start Progress Loading
                </Button>
                {progressLoading.isLoading && (
                  <AdaptiveLoadingIndicator type="progress" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Async Operation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => asyncOp.execute()} disabled={asyncOp.isLoading}>
                  Execute Async Operation
                </Button>
                {asyncOp.isLoading && (
                  <AdaptiveLoadingIndicator type="detailed" />
                )}
                {asyncOp.error && (
                  <p className="text-sm text-destructive">Error: {asyncOp.error.message}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Global Loading</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleGlobalLoading}>
                  Start Global Loading
                </Button>
                <Button onClick={handleTransition} disabled={isPending}>
                  React Transition {isPending && '(Pending)'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progressive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progressive Loading</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => progressiveOp.execute()} 
                disabled={progressiveOp.isLoading}
              >
                Start Progressive Loading
              </Button>
              
              {progressiveOp.isLoading && (
                <div className="space-y-2">
                  <AdaptiveLoadingIndicator type="progress" />
                  {progressiveOp.currentStage && (
                    <p className="text-sm text-muted-foreground">
                      Current stage: {progressiveOp.currentStage}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Completed: {progressiveOp.completedStages.length}/{progressiveOp.totalStages} stages
                  </p>
                </div>
              )}
              
              {progressiveOp.completedStages.length > 0 && (
                <div className="space-y-1">
                  <h5 className="font-medium text-sm">Completed Stages:</h5>
                  <ul className="text-xs text-muted-foreground">
                    {progressiveOp.completedStages.map(stage => (
                      <li key={stage}>✓ {stage}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const LoadingStatesShowcase: React.FC = () => {
  return (
    <LoadingManagerProvider>
      <LoadingDemo />
    </LoadingManagerProvider>
  );
};