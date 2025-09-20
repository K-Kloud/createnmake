import { supabase } from "@/integrations/supabase/client";
import { WorkflowExecution, WorkflowStep, WorkflowType, WorkflowStepData, StepStatus, WorkflowConfig } from "@/types/workflow";

export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private configs: Map<WorkflowType, WorkflowConfig> = new Map();

  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  constructor() {
    this.initializeConfigs();
  }

  private initializeConfigs() {
    // Design to Manufacturing workflow configuration
    this.configs.set('design_to_manufacturing', {
      workflowType: 'design_to_manufacturing',
      steps: [
        'input_processing',
        'design_generation',
        'design_validation',
        'design_optimization',
        'production_routing',
        'quote_generation',
        'production_execution',
        'quality_control',
        'packaging_shipping',
        'feedback_collection'
      ],
      stepValidators: {
        input_processing: (data) => data?.prompt && data.prompt.length > 0,
        design_generation: (data) => data?.imageUrl || data?.designData,
        design_validation: (data) => data?.isValid === true,
        design_optimization: (data) => data?.optimizedDesign,
        production_routing: (data) => data?.selectedRoute && data?.assignedMakers,
        quote_generation: (data) => data?.quote && data.quote.amount > 0,
        production_execution: (data) => data?.productionStatus === 'completed',
        quality_control: (data) => data?.qualityScore >= 7,
        packaging_shipping: (data) => data?.trackingId,
        feedback_collection: (data) => true // Always valid
      },
      stepProcessors: {
        input_processing: this.processInput.bind(this),
        design_generation: this.generateDesign.bind(this),
        design_validation: this.validateDesign.bind(this),
        design_optimization: this.optimizeDesign.bind(this),
        production_routing: this.routeProduction.bind(this),
        quote_generation: this.generateQuote.bind(this),
        production_execution: this.executeProduction.bind(this),
        quality_control: this.performQualityControl.bind(this),
        packaging_shipping: this.packageAndShip.bind(this),
        feedback_collection: this.collectFeedback.bind(this)
      },
      fallbackStrategies: {
        input_processing: () => this.fallbackInputProcessing(),
        design_generation: () => this.fallbackDesignGeneration(),
        design_validation: () => this.fallbackDesignValidation(),
        design_optimization: () => this.fallbackDesignOptimization(),
        production_routing: () => this.fallbackProductionRouting(),
        quote_generation: () => this.fallbackQuoteGeneration(),
        production_execution: () => this.fallbackProductionExecution(),
        quality_control: () => this.fallbackQualityControl(),
        packaging_shipping: () => this.fallbackPackagingShipping(),
        feedback_collection: () => this.fallbackFeedbackCollection()
      }
    });
  }

  async createWorkflow(userId: string, workflowType: WorkflowType, inputData: any): Promise<WorkflowExecution> {
    const config = this.configs.get(workflowType);
    if (!config) {
      throw new Error(`Workflow type ${workflowType} not supported`);
    }

    const { data, error } = await supabase
      .from('workflow_executions' as any)
      .insert({
        user_id: userId,
        workflow_type: workflowType,
        current_step: config.steps[0],
        status: 'active',
        input_data: inputData,
        step_history: []
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapDbToWorkflow(data);
  }

  async getWorkflow(workflowId: string): Promise<WorkflowExecution | null> {
    const { data, error } = await supabase
      .from('workflow_executions' as any)
      .select('*')
      .eq('id', workflowId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.mapDbToWorkflow(data);
  }

  async advanceWorkflow(workflowId: string, outputData?: any): Promise<WorkflowExecution> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const config = this.configs.get(workflow.workflowType);
    if (!config) throw new Error('Workflow configuration not found');

    const currentStepIndex = config.steps.indexOf(workflow.currentStep);
    const nextStep = config.steps[currentStepIndex + 1];

    // Process current step
    try {
      const processor = config.stepProcessors[workflow.currentStep];
      const processedData = await processor(outputData || {});
      
      // Validate step output
      const validator = config.stepValidators[workflow.currentStep];
      if (!validator(processedData)) {
        throw new Error(`Step ${workflow.currentStep} validation failed`);
      }

      // Save step output
      await this.saveStepOutput(workflowId, workflow.currentStep, processedData);

      // Update step history
      const updatedStepHistory = [...workflow.stepHistory];
      const currentStepData = updatedStepHistory.find(s => s.stepName === workflow.currentStep);
      
      if (currentStepData) {
        currentStepData.status = 'completed';
        currentStepData.completedAt = new Date().toISOString();
        currentStepData.outputData = processedData;
      } else {
        updatedStepHistory.push({
          stepName: workflow.currentStep,
          status: 'completed',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          outputData: processedData
        });
      }

      // Update workflow
      const updateData: any = {
        step_history: updatedStepHistory,
        updated_at: new Date().toISOString()
      };

      if (nextStep) {
        updateData.current_step = nextStep;
        // Add next step to history as pending
        updatedStepHistory.push({
          stepName: nextStep,
          status: 'pending',
          startedAt: new Date().toISOString()
        });
        updateData.step_history = updatedStepHistory;
      } else {
        updateData.status = 'completed';
      }

      const { data, error } = await supabase
        .from('workflow_executions' as any)
        .update(updateData)
        .eq('id', workflowId)
        .select()
        .single();

      if (error) throw error;

      return this.mapDbToWorkflow(data);
    } catch (error) {
      // Handle step failure with fallback
      console.error(`Step ${workflow.currentStep} failed:`, error);
      
      try {
        const fallbackStrategy = config.fallbackStrategies[workflow.currentStep];
        const fallbackData = await fallbackStrategy();
        
        // Recursive call with fallback data
        return this.advanceWorkflow(workflowId, fallbackData);
      } catch (fallbackError) {
        // Mark workflow as failed
        await this.markWorkflowFailed(workflowId, error as Error);
        throw error;
      }
    }
  }

  private async saveStepOutput(workflowId: string, stepName: WorkflowStep, outputData: any) {
    const { error } = await supabase
      .from('workflow_step_outputs' as any)
      .insert({
        workflow_id: workflowId,
        step_name: stepName,
        output_data: outputData,
        processing_time_ms: 0 // TODO: Track actual processing time
      });

    if (error) throw error;
  }

  private async markWorkflowFailed(workflowId: string, error: Error) {
    await supabase
      .from('workflow_executions' as any)
      .update({
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', workflowId);
  }

  private mapDbToWorkflow(dbData: any): WorkflowExecution {
    return {
      id: dbData.id,
      userId: dbData.user_id,
      workflowType: dbData.workflow_type,
      currentStep: dbData.current_step,
      status: dbData.status,
      inputData: dbData.input_data,
      stepHistory: dbData.step_history || [],
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at,
      metadata: dbData.metadata
    };
  }

  // Step processors (placeholder implementations)
  private async processInput(data: any) {
    return { processedInput: data, isValid: true };
  }

  private async generateDesign(data: any) {
    // Integration with existing image generation system would go here
    return { designGenerated: true, imageUrl: 'placeholder' };
  }

  private async validateDesign(data: any) {
    // Integration with design validation service
    return { isValid: true, validationScore: 8.5, qualityMetrics: data };
  }

  private async optimizeDesign(data: any) {
    // Integration with design optimization service  
    return { optimizedDesign: data, optimizationApplied: true };
  }

  private async routeProduction(data: any) {
    return { selectedRoute: 'artisan', assignedMakers: ['maker-1'] };
  }

  private async generateQuote(data: any) {
    // Generate intelligent quote using quote engine
    console.log('Generating quote:', data);
    try {
      const { quoteEngine } = await import('./quoteEngine');
      const quoteRequest = {
        materials: data.materials || ['cotton'],
        dimensions: data.dimensions || { width: 12, height: 16 },
        quantity: data.quantity || 1,
        timeline: data.timeline || 14,
        qualityLevel: data.qualityLevel || 'premium',
        customizations: data.customizations || []
      };
      const quoteResult = await quoteEngine.generateQuote(quoteRequest);
      return { 
        quote: { amount: quoteResult.finalPrice, currency: 'USD' },
        breakdown: quoteResult.breakdown,
        timeline: quoteResult.timeline,
        confidence: quoteResult.confidence,
        alternatives: quoteResult.alternatives
      };
    } catch (error) {
      console.warn('Quote generation service unavailable, using fallback');
      return { quote: { amount: 150, currency: 'USD' } };
    }
  }

  private async executeProduction(data: any) {
    // Execute production with intelligent scheduling and monitoring
    console.log('Executing production:', data);
    try {
      const { productionScheduler } = await import('./productionScheduler');
      const scheduleResult = await productionScheduler.createProductionSchedule(
        data.workflowId || 'workflow-123',
        {
          items: data.items || [{
            type: data.productType || 't-shirt',
            quantity: data.quantity || 1,
            materials: data.materials || ['cotton'],
            complexity: data.designComplexity || 0.8,
            deadline: data.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          }],
          qualityLevel: data.qualityLevel || 'premium',
          specialRequirements: data.specialRequirements || []
        }
      );
      return { 
        productionStatus: 'in_progress',
        productId: 'prod-' + Math.random().toString(36).substr(2, 9),
        schedule: scheduleResult,
        estimatedCompletion: scheduleResult.tasks[scheduleResult.tasks.length - 1]?.scheduledEnd,
        tasksCount: scheduleResult.tasks.length
      };
    } catch (error) {
      console.warn('Production scheduling service unavailable, using fallback');
      return { productionStatus: 'in_progress', productId: 'prod-123' };
    }
  }

  private async performQualityControl(data: any) {
    return { qualityScore: 9.0, passed: true };
  }

  private async packageAndShip(data: any) {
    // Intelligent packaging and shipping optimization
    console.log('Optimizing packaging and shipping:', data);
    try {
      const { fulfillmentOptimizer } = await import('./fulfillmentOptimizer');
      const fulfillmentResult = await fulfillmentOptimizer.optimizeFulfillment({
        orderId: data.orderId || 'order-' + Math.random().toString(36).substr(2, 9),
        items: data.items || [{
          productId: data.productId || 'prod-123',
          quantity: data.quantity || 1,
          dimensions: data.dimensions || { length: 12, width: 8, height: 2 },
          weight: data.weight || 0.5,
          fragile: data.fragile || false,
          value: data.value || 50
        }],
        destination: data.destination || {
          address: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'US'
        },
        customerPreferences: data.customerPreferences || {
          speed: 'standard',
          cost: 'balanced',
          sustainability: 'standard'
        }
      });
      
      // Create shipment
      const shipment = await fulfillmentOptimizer.createShipment(fulfillmentResult);
      
      return { 
        trackingId: shipment.trackingNumber,
        carrier: shipment.carrier,
        estimatedDelivery: shipment.estimatedDelivery,
        shippedAt: new Date().toISOString(),
        fulfillmentPlan: fulfillmentResult,
        optimizationScore: fulfillmentResult.optimizationScore,
        totalCost: fulfillmentResult.totalCost
      };
    } catch (error) {
      console.warn('Fulfillment optimization service unavailable, using fallback');
      return { trackingId: 'TRK-123456', shippedAt: new Date().toISOString() };
    }
  }

  private async collectFeedback(data: any) {
    // Intelligent feedback collection and analysis
    console.log('Collecting feedback:', data);
    try {
      const { feedbackCollector } = await import('./feedbackCollector');
      const feedbackRequest = await feedbackCollector.createFeedbackRequest({
        orderId: data.orderId || 'order-123',
        userId: data.userId || 'user-123',
        productIds: data.productIds || ['prod-123'],
        deliveryDate: data.deliveryDate || new Date().toISOString(),
        channels: ['email', 'in_app'],
        timing: 'after_1_day',
        customQuestions: data.customQuestions || []
      });
      
      return { 
        feedbackCollected: true,
        campaignId: feedbackRequest.campaignId,
        scheduledDate: feedbackRequest.scheduledDate,
        channels: feedbackRequest.channels,
        questionsCount: feedbackRequest.questions.length
      };
    } catch (error) {
      console.warn('Feedback collection service unavailable, using fallback');
      return { feedbackCollected: true };
    }
  }

  // Fallback strategies (placeholder implementations)
  private async fallbackInputProcessing() {
    return { processedInput: 'fallback', isValid: true };
  }

  private async fallbackDesignGeneration() {
    return { designGenerated: true, imageUrl: 'fallback' };
  }

  private async fallbackDesignValidation() {
    return { isValid: true, validationScore: 6.0 };
  }

  private async fallbackDesignOptimization() {
    return { optimizedDesign: 'fallback', optimizationApplied: false };
  }

  private async fallbackProductionRouting() {
    return { selectedRoute: 'manufacturer', assignedMakers: ['fallback-maker'] };
  }

  private async fallbackQuoteGeneration() {
    return { quote: { amount: 100, currency: 'USD' } };
  }

  private async fallbackProductionExecution() {
    return { productionStatus: 'completed', productId: 'fallback-prod' };
  }

  private async fallbackQualityControl() {
    return { qualityScore: 7.0, passed: true };
  }

  private async fallbackPackagingShipping() {
    return { trackingId: 'FALLBACK-123', shippedAt: new Date().toISOString() };
  }

  private async fallbackFeedbackCollection() {
    return { feedbackCollected: true };
  }
}

export const workflowEngine = WorkflowEngine.getInstance();