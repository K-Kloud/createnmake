import { useState, useCallback, useEffect } from 'react';
import { productionScheduler, ProductionSchedule, ProductionTask } from '@/services/productionScheduler';
import { useToast } from '@/components/ui/use-toast';

export const useProductionMonitoring = (scheduleId?: string) => {
  const [schedule, setSchedule] = useState<ProductionSchedule | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const { toast } = useToast();

  // Real-time monitoring interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (monitoring && scheduleId) {
      interval = setInterval(async () => {
        try {
          const progressData = await productionScheduler.getScheduleProgress(scheduleId);
          setProgress(progressData);
        } catch (error) {
          console.error('Failed to fetch progress:', error);
        }
      }, 30000); // Update every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [monitoring, scheduleId]);

  const createSchedule = useCallback(async (
    workflowId: string,
    requirements: {
      items: Array<{
        type: string;
        quantity: number;
        materials: string[];
        complexity: number;
        deadline: string;
      }>;
      qualityLevel: 'basic' | 'premium' | 'luxury';
      specialRequirements?: string[];
    }
  ) => {
    setLoading(true);
    try {
      console.log("📅 Creating production schedule:", { workflowId, requirements });
      
      const newSchedule = await productionScheduler.createProductionSchedule(workflowId, requirements);
      setSchedule(newSchedule);
      
      toast({
        title: "Schedule Created",
        description: `Production schedule created with ${newSchedule.tasks.length} tasks`,
      });
      
      return newSchedule;
    } catch (error) {
      console.error("❌ Schedule creation failed:", error);
      
      toast({
        variant: "destructive",
        title: "Schedule Creation Failed",
        description: "Unable to create production schedule. Please try again.",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateTaskStatus = useCallback(async (
    taskId: string,
    status: ProductionTask['status'],
    notes?: string,
    qualityScore?: number
  ) => {
    try {
      await productionScheduler.updateTaskStatus(taskId, status, notes, qualityScore);
      
      // Update local schedule if available
      if (schedule) {
        const updatedSchedule = {
          ...schedule,
          tasks: schedule.tasks.map(task => 
            task.id === taskId 
              ? { ...task, status, notes, qualityScore }
              : task
          )
        };
        setSchedule(updatedSchedule);
      }
      
      toast({
        title: "Task Updated",
        description: `Task status changed to ${status}`,
      });
      
      // Refresh progress if monitoring
      if (monitoring && schedule?.id) {
        const progressData = await productionScheduler.getScheduleProgress(schedule.id);
        setProgress(progressData);
      }
    } catch (error) {
      console.error("❌ Task update failed:", error);
      
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Unable to update task status. Please try again.",
      });
    }
  }, [schedule, monitoring, toast]);

  const startMonitoring = useCallback(async (targetScheduleId?: string) => {
    const idToMonitor = targetScheduleId || scheduleId;
    
    if (!idToMonitor) {
      toast({
        variant: "destructive",
        title: "No Schedule",
        description: "No schedule ID provided for monitoring.",
      });
      return;
    }

    setMonitoring(true);
    
    try {
      const progressData = await productionScheduler.getScheduleProgress(idToMonitor);
      setProgress(progressData);
      
      toast({
        title: "Monitoring Started",
        description: "Real-time production monitoring is now active",
      });
    } catch (error) {
      console.error("❌ Failed to start monitoring:", error);
      setMonitoring(false);
      
      toast({
        variant: "destructive",
        title: "Monitoring Failed",
        description: "Unable to start production monitoring.",
      });
    }
  }, [scheduleId, toast]);

  const stopMonitoring = useCallback(() => {
    setMonitoring(false);
    toast({
      title: "Monitoring Stopped",
      description: "Production monitoring has been stopped",
    });
  }, [toast]);

  const getTasksByStatus = useCallback((status: ProductionTask['status']) => {
    if (!schedule) return [];
    return schedule.tasks.filter(task => task.status === status);
  }, [schedule]);

  const getCriticalTasks = useCallback(() => {
    if (!schedule) return [];
    return schedule.tasks.filter(task => 
      task.priority === 'urgent' || 
      task.priority === 'high' ||
      task.status === 'blocked' ||
      task.status === 'failed'
    );
  }, [schedule]);

  const getUpcomingTasks = useCallback((hours: number = 24) => {
    if (!schedule) return [];
    
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
    
    return schedule.tasks.filter(task => {
      if (!task.scheduledStart) return false;
      const taskStart = new Date(task.scheduledStart);
      return taskStart >= now && taskStart <= futureTime && task.status === 'pending';
    });
  }, [schedule]);

  const getOverdueTasks = useCallback(() => {
    if (!schedule) return [];
    
    const now = new Date();
    return schedule.tasks.filter(task => {
      if (!task.scheduledEnd || task.status === 'completed') return false;
      return new Date(task.scheduledEnd) < now;
    });
  }, [schedule]);

  const getBottleneckAnalysis = useCallback(() => {
    if (!schedule) return null;
    
    const criticalBottlenecks = schedule.bottlenecks.filter(b => b.impact === 'critical');
    const highImpactBottlenecks = schedule.bottlenecks.filter(b => b.impact === 'high');
    
    return {
      critical: criticalBottlenecks.length,
      high: highImpactBottlenecks.length,
      total: schedule.bottlenecks.length,
      estimatedDelay: schedule.bottlenecks.reduce((sum, b) => sum + b.estimatedDelay, 0),
      suggestions: schedule.bottlenecks.flatMap(b => b.suggestedActions)
    };
  }, [schedule]);

  return {
    schedule,
    progress,
    loading,
    monitoring,
    createSchedule,
    updateTaskStatus,
    startMonitoring,
    stopMonitoring,
    getTasksByStatus,
    getCriticalTasks,
    getUpcomingTasks,
    getOverdueTasks,
    getBottleneckAnalysis
  };
};