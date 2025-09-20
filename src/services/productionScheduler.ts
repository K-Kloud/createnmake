import { supabase } from '@/integrations/supabase/client';

export interface ProductionTask {
  id: string;
  workflowId: string;
  taskType: 'cutting' | 'sewing' | 'printing' | 'assembly' | 'finishing' | 'quality_check' | 'packaging';
  title: string;
  description: string;
  estimatedDuration: number; // minutes
  requiredSkills: string[];
  materials: string[];
  dependencies: string[]; // task IDs that must complete first
  assignedTo?: string; // maker/artisan ID
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'blocked' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledStart?: string;
  actualStart?: string;
  scheduledEnd?: string;
  actualEnd?: string;
  qualityScore?: number;
  notes?: string;
}

export interface ProductionSchedule {
  id: string;
  workflowId: string;
  totalEstimatedTime: number;
  actualTime?: number;
  tasks: ProductionTask[];
  milestones: ProductionMilestone[];
  bottlenecks: ProductionBottleneck[];
  efficiency: number;
  onTrack: boolean;
}

export interface ProductionMilestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  actualDate?: string;
  tasks: string[]; // task IDs required for this milestone
  status: 'pending' | 'at_risk' | 'completed' | 'missed';
  criticalPath: boolean;
}

export interface ProductionBottleneck {
  id: string;
  type: 'resource' | 'skill' | 'material' | 'dependency';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  suggestedActions: string[];
  estimatedDelay: number; // minutes
}

export interface MakerCapacity {
  makerId: string;
  skills: string[];
  currentWorkload: number; // percentage
  availableHours: number;
  efficiency: number;
  qualityRating: number;
  specializations: string[];
}

class ProductionScheduler {
  private static instance: ProductionScheduler;
  
  static getInstance(): ProductionScheduler {
    if (!ProductionScheduler.instance) {
      ProductionScheduler.instance = new ProductionScheduler();
    }
    return ProductionScheduler.instance;
  }

  async createProductionSchedule(
    workflowId: string,
    productionRequirements: {
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
  ): Promise<ProductionSchedule> {
    try {
      console.log('📅 Creating production schedule for workflow:', workflowId);

      // Break down requirements into tasks
      const tasks = await this.generateTasks(productionRequirements);
      
      // Analyze maker capacity and assign tasks
      const assignedTasks = await this.assignTasks(tasks);
      
      // Calculate optimal schedule
      const optimizedSchedule = await this.optimizeSchedule(assignedTasks);
      
      // Identify potential bottlenecks
      const bottlenecks = await this.identifyBottlenecks(optimizedSchedule);
      
      // Create milestones
      const milestones = this.generateMilestones(optimizedSchedule);
      
      const schedule: ProductionSchedule = {
        id: crypto.randomUUID(),
        workflowId,
        totalEstimatedTime: optimizedSchedule.reduce((sum, task) => sum + task.estimatedDuration, 0),
        tasks: optimizedSchedule,
        milestones,
        bottlenecks,
        efficiency: this.calculateEfficiency(optimizedSchedule),
        onTrack: bottlenecks.filter(b => b.impact === 'critical').length === 0
      };

      // Store schedule in database
      await this.storeSchedule(schedule);
      
      console.log('✅ Production schedule created:', schedule);
      return schedule;
    } catch (error) {
      console.error('❌ Production scheduling failed:', error);
      throw new Error('Failed to create production schedule');
    }
  }

  private async generateTasks(requirements: any): Promise<ProductionTask[]> {
    const tasks: ProductionTask[] = [];
    
    for (const item of requirements.items) {
      const baseTasks = this.getBaseTasksForItem(item);
      
      // Add quality-specific tasks
      if (requirements.qualityLevel === 'luxury') {
        baseTasks.push({
          id: crypto.randomUUID(),
          workflowId: '',
          taskType: 'quality_check',
          title: 'Premium Quality Inspection',
          description: 'Detailed quality inspection for luxury item',
          estimatedDuration: 45,
          requiredSkills: ['quality_control', 'luxury_finishing'],
          materials: [],
          dependencies: baseTasks.filter(t => t.taskType !== 'quality_check').map(t => t.id),
          status: 'pending',
          priority: 'high'
        });
      }
      
      tasks.push(...baseTasks);
    }
    
    return tasks;
  }

  private getBaseTasksForItem(item: any): ProductionTask[] {
    const baseId = crypto.randomUUID().slice(0, 8);
    
    const tasks: ProductionTask[] = [
      {
        id: `${baseId}-prep`,
        workflowId: '',
        taskType: 'cutting',
        title: 'Material Preparation',
        description: `Prepare and cut materials for ${item.type}`,
        estimatedDuration: 30 + (item.complexity * 15),
        requiredSkills: ['cutting', 'measurement'],
        materials: item.materials,
        dependencies: [],
        status: 'pending',
        priority: 'medium'
      },
      {
        id: `${baseId}-main`,
        workflowId: '',
        taskType: item.type.includes('printed') ? 'printing' : 'sewing',
        title: `${item.type} Production`,
        description: `Main production work for ${item.type}`,
        estimatedDuration: 60 + (item.complexity * 30) + (item.quantity * 10),
        requiredSkills: item.type.includes('printed') ? ['printing', 'digital_printing'] : ['sewing', 'tailoring'],
        materials: item.materials,
        dependencies: [`${baseId}-prep`],
        status: 'pending',
        priority: 'high'
      },
      {
        id: `${baseId}-finish`,
        workflowId: '',
        taskType: 'finishing',
        title: 'Finishing & Polish',
        description: `Final finishing touches for ${item.type}`,
        estimatedDuration: 20 + (item.complexity * 10),
        requiredSkills: ['finishing', 'detail_work'],
        materials: ['thread', 'finishing_supplies'],
        dependencies: [`${baseId}-main`],
        status: 'pending',
        priority: 'medium'
      },
      {
        id: `${baseId}-qc`,
        workflowId: '',
        taskType: 'quality_check',
        title: 'Quality Control',
        description: `Quality inspection for ${item.type}`,
        estimatedDuration: 15,
        requiredSkills: ['quality_control'],
        materials: [],
        dependencies: [`${baseId}-finish`],
        status: 'pending',
        priority: 'high'
      }
    ];
    
    return tasks;
  }

  private async assignTasks(tasks: ProductionTask[]): Promise<ProductionTask[]> {
    // Get available makers and their capacities
    const makers = await this.getAvailableMakers();
    
    // Simple assignment algorithm - can be enhanced with more sophisticated optimization
    const assignedTasks = [...tasks];
    
    for (const task of assignedTasks) {
      const suitableMakers = makers.filter(maker => 
        task.requiredSkills.some(skill => maker.skills.includes(skill)) &&
        maker.currentWorkload < 80 // Not overloaded
      );
      
      if (suitableMakers.length > 0) {
        // Assign to maker with highest quality rating and lowest workload
        const bestMaker = suitableMakers.sort((a, b) => 
          (b.qualityRating / (b.currentWorkload + 1)) - (a.qualityRating / (a.currentWorkload + 1))
        )[0];
        
        task.assignedTo = bestMaker.makerId;
        bestMaker.currentWorkload += (task.estimatedDuration / 480) * 100; // Assume 8 hour workday
      }
    }
    
    return assignedTasks;
  }

  private async optimizeSchedule(tasks: ProductionTask[]): Promise<ProductionTask[]> {
    // Topological sort based on dependencies
    const sortedTasks = this.topologicalSort(tasks);
    
    // Schedule tasks based on dependencies and maker availability
    const now = new Date();
    let currentTime = now.getTime();
    
    for (const task of sortedTasks) {
      // Find latest dependency completion time
      const dependencyEndTimes = task.dependencies.map(depId => {
        const depTask = sortedTasks.find(t => t.id === depId);
        return depTask?.scheduledEnd ? new Date(depTask.scheduledEnd).getTime() : currentTime;
      });
      
      const startTime = Math.max(currentTime, ...dependencyEndTimes);
      const endTime = startTime + (task.estimatedDuration * 60 * 1000);
      
      task.scheduledStart = new Date(startTime).toISOString();
      task.scheduledEnd = new Date(endTime).toISOString();
      
      currentTime = Math.max(currentTime, endTime);
    }
    
    return sortedTasks;
  }

  private topologicalSort(tasks: ProductionTask[]): ProductionTask[] {
    const visited = new Set<string>();
    const result: ProductionTask[] = [];
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    
    const visit = (taskId: string) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);
      
      const task = taskMap.get(taskId);
      if (!task) return;
      
      // Visit dependencies first
      task.dependencies.forEach(visit);
      result.push(task);
    };
    
    tasks.forEach(task => visit(task.id));
    return result;
  }

  private async identifyBottlenecks(tasks: ProductionTask[]): Promise<ProductionBottleneck[]> {
    const bottlenecks: ProductionBottleneck[] = [];
    
    // Identify skill bottlenecks
    const skillDemand = new Map<string, number>();
    tasks.forEach(task => {
      task.requiredSkills.forEach(skill => {
        skillDemand.set(skill, (skillDemand.get(skill) || 0) + task.estimatedDuration);
      });
    });
    
    for (const [skill, demand] of skillDemand) {
      if (demand > 480) { // More than 8 hours of work
        bottlenecks.push({
          id: crypto.randomUUID(),
          type: 'skill',
          description: `High demand for ${skill} skill (${Math.round(demand/60)} hours)`,
          impact: demand > 960 ? 'critical' : 'high',
          suggestedActions: [
            'Consider training additional staff',
            'Outsource some tasks',
            'Extend timeline'
          ],
          estimatedDelay: Math.max(0, demand - 480)
        });
      }
    }
    
    // Identify material bottlenecks
    const materialDemand = new Map<string, number>();
    tasks.forEach(task => {
      task.materials.forEach(material => {
        materialDemand.set(material, (materialDemand.get(material) || 0) + 1);
      });
    });
    
    // Check for unassigned tasks
    const unassignedTasks = tasks.filter(t => !t.assignedTo);
    if (unassignedTasks.length > 0) {
      bottlenecks.push({
        id: crypto.randomUUID(),
        type: 'resource',
        description: `${unassignedTasks.length} tasks without assigned makers`,
        impact: 'critical',
        suggestedActions: [
          'Find additional makers',
          'Reassign from overloaded makers',
          'Consider outsourcing'
        ],
        estimatedDelay: unassignedTasks.reduce((sum, t) => sum + t.estimatedDuration, 0)
      });
    }
    
    return bottlenecks;
  }

  private generateMilestones(tasks: ProductionTask[]): ProductionMilestone[] {
    const milestones: ProductionMilestone[] = [];
    
    // Group tasks by type to create logical milestones
    const tasksByType = new Map<string, ProductionTask[]>();
    tasks.forEach(task => {
      const type = task.taskType;
      if (!tasksByType.has(type)) tasksByType.set(type, []);
      tasksByType.get(type)!.push(task);
    });
    
    // Create milestone for each major phase
    const phaseOrder = ['cutting', 'printing', 'sewing', 'assembly', 'finishing', 'quality_check', 'packaging'];
    
    for (const phase of phaseOrder) {
      const phaseTasks = tasksByType.get(phase);
      if (phaseTasks && phaseTasks.length > 0) {
        const latestTask = phaseTasks.reduce((latest, task) => 
          new Date(task.scheduledEnd || 0) > new Date(latest.scheduledEnd || 0) ? task : latest
        );
        
        milestones.push({
          id: crypto.randomUUID(),
          name: `${phase.charAt(0).toUpperCase() + phase.slice(1)} Complete`,
          description: `All ${phase.replace('_', ' ')} tasks completed`,
          targetDate: latestTask.scheduledEnd || new Date().toISOString(),
          tasks: phaseTasks.map(t => t.id),
          status: 'pending',
          criticalPath: phase === 'quality_check' || phase === 'finishing'
        });
      }
    }
    
    return milestones;
  }

  private calculateEfficiency(tasks: ProductionTask[]): number {
    const assignedTasks = tasks.filter(t => t.assignedTo);
    const totalTasks = tasks.length;
    
    if (totalTasks === 0) return 0;
    
    const assignmentRate = assignedTasks.length / totalTasks;
    const averagePriority = tasks.reduce((sum, task) => {
      const priorityScore = { low: 1, medium: 2, high: 3, urgent: 4 }[task.priority];
      return sum + priorityScore;
    }, 0) / totalTasks;
    
    return Math.round((assignmentRate * 0.7 + (averagePriority / 4) * 0.3) * 100);
  }

  private async getAvailableMakers(): Promise<MakerCapacity[]> {
    // This would query the database for available makers
    // For now, return mock data
    return [
      {
        makerId: 'maker-1',
        skills: ['cutting', 'sewing', 'tailoring'],
        currentWorkload: 45,
        availableHours: 6,
        efficiency: 0.92,
        qualityRating: 4.8,
        specializations: ['formal_wear', 'alterations']
      },
      {
        makerId: 'maker-2',
        skills: ['printing', 'digital_printing', 'design'],
        currentWorkload: 30,
        availableHours: 8,
        efficiency: 0.88,
        qualityRating: 4.6,
        specializations: ['t_shirts', 'posters']
      },
      {
        makerId: 'maker-3',
        skills: ['quality_control', 'finishing', 'detail_work'],
        currentWorkload: 60,
        availableHours: 4,
        efficiency: 0.95,
        qualityRating: 4.9,
        specializations: ['luxury_finishing', 'inspection']
      }
    ];
  }

  private async storeSchedule(schedule: ProductionSchedule): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ai_content_history').insert([{
          content_type: 'production_schedule',
          input_data: { workflowId: schedule.workflowId } as any,
          generated_content: schedule as any,
          model_used: 'production_scheduler_v1',
          quality_score: schedule.efficiency / 100,
          user_id: user.id
        }]);
      }
    } catch (error) {
      console.warn('Failed to store schedule:', error);
    }
  }

  async updateTaskStatus(
    taskId: string, 
    status: ProductionTask['status'], 
    notes?: string,
    qualityScore?: number
  ): Promise<void> {
    try {
      console.log(`📝 Updating task ${taskId} status to ${status}`);
      
      const updateData: any = {
        status,
        notes,
        qualityScore
      };
      
      if (status === 'in_progress') {
        updateData.actualStart = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.actualEnd = new Date().toISOString();
      }
      
      // In a real implementation, this would update the database
      console.log('✅ Task status updated:', updateData);
    } catch (error) {
      console.error('❌ Failed to update task status:', error);
      throw error;
    }
  }

  async getScheduleProgress(scheduleId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    blockedTasks: number;
    overallProgress: number;
    estimatedCompletion: string;
    isOnSchedule: boolean;
  }> {
    // Mock implementation - would query database for real schedule
    return {
      totalTasks: 12,
      completedTasks: 7,
      inProgressTasks: 3,
      blockedTasks: 1,
      overallProgress: 65,
      estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      isOnSchedule: true
    };
  }
}

export const productionScheduler = ProductionScheduler.getInstance();