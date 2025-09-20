import { supabase } from '@/integrations/supabase/client';

export interface FeedbackRequest {
  orderId: string;
  userId: string;
  productIds: string[];
  deliveryDate: string;
  channels: ('email' | 'sms' | 'in_app' | 'web')[];
  timing: 'immediate' | 'after_1_day' | 'after_3_days' | 'after_1_week';
  customQuestions?: FeedbackQuestion[];
}

export interface FeedbackQuestion {
  id: string;
  type: 'rating' | 'text' | 'multiple_choice' | 'yes_no' | 'nps';
  question: string;
  required: boolean;
  options?: string[]; // for multiple choice
  scale?: { min: number; max: number; labels: string[] }; // for rating/NPS
}

export interface FeedbackResponse {
  id: string;
  orderId: string;
  userId: string;
  submittedAt: string;
  channel: string;
  responses: Record<string, any>;
  overallRating: number;
  npsScore?: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  tags: string[];
  followUpRequired: boolean;
}

export interface FeedbackAnalysis {
  orderId?: string;
  timeRange: { start: string; end: string };
  totalResponses: number;
  responseRate: number;
  averageRating: number;
  npsScore: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  commonIssues: Array<{ issue: string; count: number; severity: 'low' | 'medium' | 'high' }>;
  improvements: Array<{ category: string; suggestion: string; impact: 'low' | 'medium' | 'high' }>;
  customerInsights: string[];
  actionItems: Array<{ priority: 'low' | 'medium' | 'high'; action: string; department: string }>;
}

export interface FeedbackCampaign {
  id: string;
  name: string;
  description: string;
  template: FeedbackTemplate;
  triggers: CampaignTrigger[];
  isActive: boolean;
  targeting: {
    customerSegments: string[];
    productCategories: string[];
    orderValueRange?: { min: number; max: number };
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    responded: number;
    responseRate: number;
  };
}

export interface FeedbackTemplate {
  id: string;
  name: string;
  subject: string;
  introduction: string;
  questions: FeedbackQuestion[];
  thankYouMessage: string;
  incentive?: {
    type: 'discount' | 'points' | 'gift';
    value: string;
    description: string;
  };
}

export interface CampaignTrigger {
  event: 'order_delivered' | 'order_completed' | 'days_after_delivery';
  delay: number; // in days
  conditions?: Record<string, any>;
}

class FeedbackCollector {
  private static instance: FeedbackCollector;
  
  static getInstance(): FeedbackCollector {
    if (!FeedbackCollector.instance) {
      FeedbackCollector.instance = new FeedbackCollector();
    }
    return FeedbackCollector.instance;
  }

  async createFeedbackRequest(request: FeedbackRequest): Promise<{
    campaignId: string;
    scheduledDate: string;
    channels: string[];
    questions: FeedbackQuestion[];
  }> {
    try {
      console.log('📝 Creating feedback request for order:', request.orderId);

      // Generate appropriate questions based on product type and order
      const questions = await this.generateQuestions(request);
      
      // Calculate when to send feedback request
      const scheduledDate = this.calculateScheduledDate(request.deliveryDate, request.timing);
      
      // Create campaign
      const campaignId = await this.createCampaign(request, questions);
      
      console.log('✅ Feedback request created:', { campaignId, scheduledDate });
      
      return {
        campaignId,
        scheduledDate,
        channels: request.channels,
        questions
      };
    } catch (error) {
      console.error('❌ Feedback request creation failed:', error);
      throw new Error('Failed to create feedback request');
    }
  }

  private async generateQuestions(request: FeedbackRequest): Promise<FeedbackQuestion[]> {
    const questions: FeedbackQuestion[] = [];

    // Overall satisfaction (always included)
    questions.push({
      id: 'overall_satisfaction',
      type: 'rating',
      question: 'How satisfied are you with your overall experience?',
      required: true,
      scale: { min: 1, max: 5, labels: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'] }
    });

    // Product quality
    questions.push({
      id: 'product_quality',
      type: 'rating',
      question: 'How would you rate the quality of the product(s) you received?',
      required: true,
      scale: { min: 1, max: 5, labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] }
    });

    // Delivery experience
    questions.push({
      id: 'delivery_experience',
      type: 'rating',
      question: 'How satisfied were you with the delivery experience?',
      required: true,
      scale: { min: 1, max: 5, labels: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'] }
    });

    // NPS Score
    questions.push({
      id: 'nps_score',
      type: 'nps',
      question: 'How likely are you to recommend us to a friend or colleague?',
      required: true,
      scale: { min: 0, max: 10, labels: ['Not at all likely', 'Extremely likely'] }
    });

    // Specific feedback areas
    questions.push({
      id: 'improvement_areas',
      type: 'multiple_choice',
      question: 'Which areas could we improve? (Select all that apply)',
      required: false,
      options: [
        'Product quality',
        'Delivery speed',
        'Packaging',
        'Communication',
        'Customer service',
        'Website experience',
        'Pricing',
        'Product variety'
      ]
    });

    // Open-ended feedback
    questions.push({
      id: 'additional_comments',
      type: 'text',
      question: 'Is there anything else you\'d like to share about your experience?',
      required: false
    });

    // Add custom questions if provided
    if (request.customQuestions) {
      questions.push(...request.customQuestions);
    }

    return questions;
  }

  private calculateScheduledDate(deliveryDate: string, timing: FeedbackRequest['timing']): string {
    const delivery = new Date(deliveryDate);
    const scheduled = new Date(delivery);

    switch (timing) {
      case 'immediate':
        scheduled.setHours(scheduled.getHours() + 2); // 2 hours after delivery
        break;
      case 'after_1_day':
        scheduled.setDate(scheduled.getDate() + 1);
        break;
      case 'after_3_days':
        scheduled.setDate(scheduled.getDate() + 3);
        break;
      case 'after_1_week':
        scheduled.setDate(scheduled.getDate() + 7);
        break;
    }

    return scheduled.toISOString();
  }

  private async createCampaign(request: FeedbackRequest, questions: FeedbackQuestion[]): Promise<string> {
    const campaignId = crypto.randomUUID();
    
    const campaign: FeedbackCampaign = {
      id: campaignId,
      name: `Feedback for Order ${request.orderId}`,
      description: `Automated feedback collection for delivered order`,
      template: {
        id: crypto.randomUUID(),
        name: 'Standard Post-Delivery',
        subject: 'How was your recent order experience?',
        introduction: 'We hope you love your recent purchase! Your feedback helps us improve.',
        questions,
        thankYouMessage: 'Thank you for your valuable feedback! It helps us serve you better.',
        incentive: {
          type: 'discount',
          value: '10%',
          description: '10% off your next order'
        }
      },
      triggers: [{
        event: 'order_delivered',
        delay: this.getDelayFromTiming(request.timing)
      }],
      isActive: true,
      targeting: {
        customerSegments: ['all'],
        productCategories: ['all']
      },
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        responded: 0,
        responseRate: 0
      }
    };

    // Store campaign
    await this.storeCampaign(campaign);
    
    return campaignId;
  }

  private getDelayFromTiming(timing: FeedbackRequest['timing']): number {
    switch (timing) {
      case 'immediate': return 0;
      case 'after_1_day': return 1;
      case 'after_3_days': return 3;
      case 'after_1_week': return 7;
      default: return 1;
    }
  }

  async processFeedbackResponse(
    campaignId: string,
    responses: Record<string, any>,
    metadata: {
      userId: string;
      orderId: string;
      channel: string;
    }
  ): Promise<FeedbackResponse> {
    try {
      console.log('📊 Processing feedback response:', { campaignId, orderId: metadata.orderId });

      // Analyze sentiment
      const sentiment = this.analyzeSentiment(responses);
      
      // Extract overall rating and NPS
      const overallRating = responses.overall_satisfaction || 0;
      const npsScore = responses.nps_score;
      
      // Generate tags based on responses
      const tags = this.generateTags(responses);
      
      // Determine if follow-up is required
      const followUpRequired = this.determineFollowUpRequired(responses, sentiment);

      const feedbackResponse: FeedbackResponse = {
        id: crypto.randomUUID(),
        orderId: metadata.orderId,
        userId: metadata.userId,
        submittedAt: new Date().toISOString(),
        channel: metadata.channel,
        responses,
        overallRating,
        npsScore,
        sentiment,
        tags,
        followUpRequired
      };

      // Store response
      await this.storeFeedbackResponse(feedbackResponse);

      // Trigger automated actions if needed
      if (followUpRequired) {
        await this.triggerFollowUpActions(feedbackResponse);
      }

      console.log('✅ Feedback response processed:', feedbackResponse);
      return feedbackResponse;
    } catch (error) {
      console.error('❌ Feedback response processing failed:', error);
      throw new Error('Failed to process feedback response');
    }
  }

  private analyzeSentiment(responses: Record<string, any>): 'positive' | 'neutral' | 'negative' {
    const overallRating = responses.overall_satisfaction || 3;
    const qualityRating = responses.product_quality || 3;
    const deliveryRating = responses.delivery_experience || 3;
    
    const averageRating = (overallRating + qualityRating + deliveryRating) / 3;
    
    if (averageRating >= 4) return 'positive';
    if (averageRating >= 3) return 'neutral';
    return 'negative';
  }

  private generateTags(responses: Record<string, any>): string[] {
    const tags: string[] = [];
    
    // Rating-based tags
    if (responses.overall_satisfaction >= 4) tags.push('satisfied_customer');
    if (responses.overall_satisfaction <= 2) tags.push('dissatisfied_customer');
    
    if (responses.product_quality <= 2) tags.push('quality_issue');
    if (responses.delivery_experience <= 2) tags.push('delivery_issue');
    
    // NPS-based tags
    if (responses.nps_score >= 9) tags.push('promoter');
    else if (responses.nps_score >= 7) tags.push('passive');
    else if (responses.nps_score !== undefined) tags.push('detractor');
    
    // Improvement areas
    if (responses.improvement_areas) {
      const areas = Array.isArray(responses.improvement_areas) ? 
        responses.improvement_areas : [responses.improvement_areas];
      tags.push(...areas.map((area: string) => `needs_${area.toLowerCase().replace(' ', '_')}`));
    }
    
    return tags;
  }

  private determineFollowUpRequired(
    responses: Record<string, any>,
    sentiment: string
  ): boolean {
    // Follow up needed for negative feedback
    if (sentiment === 'negative') return true;
    
    // Follow up for specific issues
    if (responses.product_quality <= 2) return true;
    if (responses.delivery_experience <= 2) return true;
    
    // Follow up for detractors
    if (responses.nps_score !== undefined && responses.nps_score <= 6) return true;
    
    // Follow up if they mentioned specific issues
    if (responses.additional_comments && 
        typeof responses.additional_comments === 'string' &&
        (responses.additional_comments.toLowerCase().includes('problem') ||
         responses.additional_comments.toLowerCase().includes('issue') ||
         responses.additional_comments.toLowerCase().includes('wrong'))) {
      return true;
    }
    
    return false;
  }

  private async triggerFollowUpActions(response: FeedbackResponse): Promise<void> {
    console.log('🔔 Triggering follow-up actions for negative feedback:', response.id);
    
    // In a real implementation, this would:
    // 1. Create customer service ticket
    // 2. Send notification to support team
    // 3. Flag order for review
    // 4. Schedule follow-up contact
    
    console.log('✅ Follow-up actions triggered');
  }

  async analyzeFeedback(filters: {
    orderId?: string;
    timeRange?: { start: string; end: string };
    productIds?: string[];
    customerSegments?: string[];
  }): Promise<FeedbackAnalysis> {
    try {
      console.log('📈 Analyzing feedback data:', filters);

      // Mock data for demonstration - would query actual feedback responses
      const mockResponses = this.generateMockFeedbackData(filters);
      
      const analysis = this.performFeedbackAnalysis(mockResponses);
      
      console.log('✅ Feedback analysis completed:', analysis);
      return analysis;
    } catch (error) {
      console.error('❌ Feedback analysis failed:', error);
      throw new Error('Failed to analyze feedback');
    }
  }

  private generateMockFeedbackData(filters: any): FeedbackResponse[] {
    // Generate mock feedback responses for analysis
    const responses: FeedbackResponse[] = [];
    
    for (let i = 0; i < 50; i++) {
      responses.push({
        id: crypto.randomUUID(),
        orderId: filters.orderId || `order-${i}`,
        userId: `user-${i}`,
        submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        channel: 'email',
        responses: {
          overall_satisfaction: Math.floor(Math.random() * 5) + 1,
          product_quality: Math.floor(Math.random() * 5) + 1,
          delivery_experience: Math.floor(Math.random() * 5) + 1,
          nps_score: Math.floor(Math.random() * 11)
        },
        overallRating: Math.floor(Math.random() * 5) + 1,
        npsScore: Math.floor(Math.random() * 11),
        sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as any,
        tags: ['satisfied_customer', 'quality_issue', 'delivery_issue'][Math.floor(Math.random() * 3)] ? 
          [['satisfied_customer', 'quality_issue', 'delivery_issue'][Math.floor(Math.random() * 3)]] : [],
        followUpRequired: Math.random() < 0.2
      });
    }
    
    return responses;
  }

  private performFeedbackAnalysis(responses: FeedbackResponse[]): FeedbackAnalysis {
    const total = responses.length;
    const avgRating = responses.reduce((sum, r) => sum + r.overallRating, 0) / total;
    const avgNPS = responses.reduce((sum, r) => sum + (r.npsScore || 0), 0) / total;
    
    const sentimentCounts = responses.reduce((acc, r) => {
      acc[r.sentiment]++;
      return acc;
    }, { positive: 0, neutral: 0, negative: 0 });

    // Analyze common issues
    const issueCounts = new Map<string, number>();
    responses.forEach(r => {
      r.tags.forEach(tag => {
        if (tag.includes('issue') || tag.includes('problem')) {
          issueCounts.set(tag, (issueCounts.get(tag) || 0) + 1);
        }
      });
    });

    const commonIssues = Array.from(issueCounts.entries())
      .map(([issue, count]) => ({
        issue: issue.replace('_', ' '),
        count,
        severity: count > total * 0.1 ? 'high' : count > total * 0.05 ? 'medium' : 'low' as any
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      timeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      },
      totalResponses: total,
      responseRate: 0.65, // Mock response rate
      averageRating: Math.round(avgRating * 10) / 10,
      npsScore: Math.round(avgNPS * 10) / 10,
      sentimentBreakdown: {
        positive: Math.round((sentimentCounts.positive / total) * 100),
        neutral: Math.round((sentimentCounts.neutral / total) * 100),
        negative: Math.round((sentimentCounts.negative / total) * 100)
      },
      commonIssues,
      improvements: [
        { category: 'Product Quality', suggestion: 'Improve quality control processes', impact: 'high' },
        { category: 'Delivery', suggestion: 'Partner with more reliable carriers', impact: 'medium' },
        { category: 'Communication', suggestion: 'Send more delivery updates', impact: 'low' }
      ],
      customerInsights: [
        'Customers value quick delivery over cost savings',
        'Packaging quality significantly impacts satisfaction',
        'Clear communication reduces support inquiries by 30%'
      ],
      actionItems: [
        { priority: 'high', action: 'Review quality control process', department: 'Operations' },
        { priority: 'medium', action: 'Implement better delivery tracking', department: 'Logistics' },
        { priority: 'low', action: 'Update FAQ section', department: 'Customer Service' }
      ]
    };
  }

  private async storeCampaign(campaign: FeedbackCampaign): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ai_content_history').insert([{
          content_type: 'feedback_campaign',
          input_data: { orderId: campaign.name } as any,
          generated_content: campaign as any,
          model_used: 'feedback_collector_v1',
          quality_score: 1.0,
          user_id: user.id
        }]);
      }
    } catch (error) {
      console.warn('Failed to store feedback campaign:', error);
    }
  }

  private async storeFeedbackResponse(response: FeedbackResponse): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ai_content_history').insert([{
          content_type: 'feedback_response',
          input_data: { orderId: response.orderId } as any,
          generated_content: response as any,
          model_used: 'feedback_processor_v1',
          quality_score: response.overallRating / 5,
          user_id: user.id
        }]);
      }
    } catch (error) {
      console.warn('Failed to store feedback response:', error);
    }
  }
}

export const feedbackCollector = FeedbackCollector.getInstance();