export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ab_test_events: {
        Row: {
          event_type: string
          id: string
          metadata: Json | null
          session_id: string
          test_name: string
          timestamp: string
          user_id: string | null
          variant: string
        }
        Insert: {
          event_type: string
          id?: string
          metadata?: Json | null
          session_id: string
          test_name: string
          timestamp?: string
          user_id?: string | null
          variant: string
        }
        Update: {
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string
          test_name?: string
          timestamp?: string
          user_id?: string | null
          variant?: string
        }
        Relationships: []
      }
      activity_metrics: {
        Row: {
          metric_id: number
          metric_type: string
          metric_value: number
          recorded_at: string
          user_id: string | null
        }
        Insert: {
          metric_id?: number
          metric_type: string
          metric_value: number
          recorded_at?: string
          user_id?: string | null
        }
        Update: {
          metric_id?: number
          metric_type?: string
          metric_value?: number
          recorded_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string
          id: number
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      adminpages: {
        Row: {
          created_at: string | null
          id: number
          is_active: boolean | null
          page_name: string
          page_url: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          is_active?: boolean | null
          page_name: string
          page_url: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          is_active?: boolean | null
          page_name?: string
          page_url?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_agent: {
        Row: {
          active: boolean | null
          agent_id: number
          created_at: string
          description: string | null
          name: string
        }
        Insert: {
          active?: boolean | null
          agent_id?: number
          created_at?: string
          description?: string | null
          name: string
        }
        Update: {
          active?: boolean | null
          agent_id?: number
          created_at?: string
          description?: string | null
          name?: string
        }
        Relationships: []
      }
      ai_agent_health: {
        Row: {
          agent_id: number
          created_at: string
          error_count: number | null
          id: string
          last_check_at: string
          metadata: Json | null
          response_time_ms: number | null
          status: string
          success_rate: number | null
        }
        Insert: {
          agent_id: number
          created_at?: string
          error_count?: number | null
          id?: string
          last_check_at?: string
          metadata?: Json | null
          response_time_ms?: number | null
          status?: string
          success_rate?: number | null
        }
        Update: {
          agent_id?: number
          created_at?: string
          error_count?: number | null
          id?: string
          last_check_at?: string
          metadata?: Json | null
          response_time_ms?: number | null
          status?: string
          success_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_health_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agent"
            referencedColumns: ["agent_id"]
          },
        ]
      }
      ai_agent_metrics: {
        Row: {
          agent_id: number
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          recorded_at: string
        }
        Insert: {
          agent_id: number
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          recorded_at?: string
        }
        Update: {
          agent_id?: number
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agent"
            referencedColumns: ["agent_id"]
          },
        ]
      }
      ai_agent_queries: {
        Row: {
          agent_id: number
          executed_at: string
          query_id: number
          query_result: Json | null
          query_text: string
          user_id: string | null
        }
        Insert: {
          agent_id: number
          executed_at?: string
          query_id?: number
          query_result?: Json | null
          query_text: string
          user_id?: string | null
        }
        Update: {
          agent_id?: number
          executed_at?: string
          query_id?: number
          query_result?: Json | null
          query_text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_queries_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agent"
            referencedColumns: ["agent_id"]
          },
        ]
      }
      ai_agent_queue: {
        Row: {
          agent_id: number
          attempts: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          max_attempts: number
          payload: Json
          priority: number
          scheduled_for: string
          started_at: string | null
          status: string
          task_type: string
        }
        Insert: {
          agent_id: number
          attempts?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          max_attempts?: number
          payload: Json
          priority?: number
          scheduled_for?: string
          started_at?: string | null
          status?: string
          task_type: string
        }
        Update: {
          agent_id?: number
          attempts?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          max_attempts?: number
          payload?: Json
          priority?: number
          scheduled_for?: string
          started_at?: string | null
          status?: string
          task_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_queue_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agent"
            referencedColumns: ["agent_id"]
          },
        ]
      }
      ai_agent_tasks: {
        Row: {
          agent_id: number
          assigned_at: string | null
          completed_at: string | null
          created_at: string | null
          status: string | null
          task_details: Json | null
          task_id: number
          task_name: string
        }
        Insert: {
          agent_id: number
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          status?: string | null
          task_details?: Json | null
          task_id?: number
          task_name: string
        }
        Update: {
          agent_id?: number
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          status?: string | null
          task_details?: Json | null
          task_id?: number
          task_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_tasks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agent"
            referencedColumns: ["agent_id"]
          },
        ]
      }
      ai_alert_config: {
        Row: {
          agent_id: number | null
          alert_type: string
          created_at: string
          id: string
          is_active: boolean | null
          notification_channels: string[] | null
          threshold_operator: string
          threshold_value: number
        }
        Insert: {
          agent_id?: number | null
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          notification_channels?: string[] | null
          threshold_operator: string
          threshold_value: number
        }
        Update: {
          agent_id?: number | null
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          notification_channels?: string[] | null
          threshold_operator?: string
          threshold_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_alert_config_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agent"
            referencedColumns: ["agent_id"]
          },
        ]
      }
      ai_content_history: {
        Row: {
          content_type: string
          created_at: string | null
          generated_content: Json
          id: string
          input_data: Json
          model_used: string
          processing_time_ms: number | null
          quality_score: number | null
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string | null
          generated_content: Json
          id?: string
          input_data: Json
          model_used: string
          processing_time_ms?: number | null
          quality_score?: number | null
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string | null
          generated_content?: Json
          id?: string
          input_data?: Json
          model_used?: string
          processing_time_ms?: number | null
          quality_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ai_model_configs: {
        Row: {
          configuration: Json
          cost_per_request: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          model_name: string
          model_type: string
          performance_metrics: Json | null
          updated_at: string | null
        }
        Insert: {
          configuration?: Json
          cost_per_request?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_name: string
          model_type: string
          performance_metrics?: Json | null
          updated_at?: string | null
        }
        Update: {
          configuration?: Json
          cost_per_request?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_name?: string
          model_type?: string
          performance_metrics?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_performance_logs: {
        Row: {
          agent_id: number
          created_at: string
          duration_ms: number | null
          end_time: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          operation_type: string
          start_time: string
          success: boolean | null
        }
        Insert: {
          agent_id: number
          created_at?: string
          duration_ms?: number | null
          end_time?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          operation_type: string
          start_time: string
          success?: boolean | null
        }
        Update: {
          agent_id?: number
          created_at?: string
          duration_ms?: number | null
          end_time?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          operation_type?: string
          start_time?: string
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_performance_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agent"
            referencedColumns: ["agent_id"]
          },
        ]
      }
      ai_recommendations: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          expires_at: string | null
          feedback_score: number | null
          id: string
          is_applied: boolean | null
          metadata: Json | null
          recommendation_data: Json
          recommendation_type: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          feedback_score?: number | null
          id?: string
          is_applied?: boolean | null
          metadata?: Json | null
          recommendation_data?: Json
          recommendation_type: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          feedback_score?: number | null
          id?: string
          is_applied?: boolean | null
          metadata?: Json | null
          recommendation_data?: Json
          recommendation_type?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_training_data: {
        Row: {
          created_at: string | null
          data_quality_score: number | null
          data_source: string
          data_type: string
          id: string
          is_processed: boolean | null
          processed_at: string | null
          training_data: Json
        }
        Insert: {
          created_at?: string | null
          data_quality_score?: number | null
          data_source: string
          data_type: string
          id?: string
          is_processed?: boolean | null
          processed_at?: string | null
          training_data: Json
        }
        Update: {
          created_at?: string | null
          data_quality_score?: number | null
          data_source?: string
          data_type?: string
          id?: string
          is_processed?: boolean | null
          processed_at?: string | null
          training_data?: Json
        }
        Relationships: []
      }
      analytics_insights: {
        Row: {
          action_items: Json | null
          confidence_score: number | null
          created_at: string | null
          data_source: string
          description: string
          id: string
          insight_type: string
          is_acknowledged: boolean | null
          metadata: Json | null
          time_period_end: string
          time_period_start: string
          title: string
        }
        Insert: {
          action_items?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          data_source: string
          description: string
          id?: string
          insight_type: string
          is_acknowledged?: boolean | null
          metadata?: Json | null
          time_period_end: string
          time_period_start: string
          title: string
        }
        Update: {
          action_items?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          data_source?: string
          description?: string
          id?: string
          insight_type?: string
          is_acknowledged?: boolean | null
          metadata?: Json | null
          time_period_end?: string
          time_period_start?: string
          title?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          api_key: string
          api_key_id: number
          created_at: string
          expires_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          api_key_id?: number
          created_at?: string
          expires_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          api_key_id?: number
          created_at?: string
          expires_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      artisan_portfolio: {
        Row: {
          artisan_id: string
          client_name: string | null
          completion_date: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          is_featured: boolean | null
          is_public: boolean | null
          materials_used: string[] | null
          project_type: string | null
          project_value: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          artisan_id: string
          client_name?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_featured?: boolean | null
          is_public?: boolean | null
          materials_used?: string[] | null
          project_type?: string | null
          project_value?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          artisan_id?: string
          client_name?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          materials_used?: string[] | null
          project_type?: string | null
          project_value?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artisan_portfolio_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artisan_quotes: {
        Row: {
          admin_notes: string | null
          amount: number | null
          artisan_id: string | null
          budget_range: string | null
          colors: string | null
          contact_preferences: string | null
          created_at: string
          delivery_address: string | null
          dimensions: string | null
          generated_image_url: string | null
          id: number
          materials: string | null
          payment_status: string | null
          product_details: string
          quantity: number | null
          special_requirements: string | null
          status: string | null
          stripe_session_id: string | null
          timeline_days: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount?: number | null
          artisan_id?: string | null
          budget_range?: string | null
          colors?: string | null
          contact_preferences?: string | null
          created_at?: string
          delivery_address?: string | null
          dimensions?: string | null
          generated_image_url?: string | null
          id?: number
          materials?: string | null
          payment_status?: string | null
          product_details: string
          quantity?: number | null
          special_requirements?: string | null
          status?: string | null
          stripe_session_id?: string | null
          timeline_days?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number | null
          artisan_id?: string | null
          budget_range?: string | null
          colors?: string | null
          contact_preferences?: string | null
          created_at?: string
          delivery_address?: string | null
          dimensions?: string | null
          generated_image_url?: string | null
          id?: number
          materials?: string | null
          payment_status?: string | null
          product_details?: string
          quantity?: number | null
          special_requirements?: string | null
          status?: string | null
          stripe_session_id?: string | null
          timeline_days?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artisan_quotes_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artisan_quotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          action_details: Json | null
          action_time: string
          log_id: number
          user_id: string | null
        }
        Insert: {
          action: string
          action_details?: Json | null
          action_time?: string
          log_id?: number
          user_id?: string | null
        }
        Update: {
          action?: string
          action_details?: Json | null
          action_time?: string
          log_id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      breadcrumb_configs: {
        Row: {
          created_at: string | null
          custom_segments: Json | null
          id: string
          is_active: boolean | null
          route_pattern: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_segments?: Json | null
          id?: string
          is_active?: boolean | null
          route_pattern: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_segments?: Json | null
          id?: string
          is_active?: boolean | null
          route_pattern?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      collaborative_documents: {
        Row: {
          collaborators: Json | null
          content: Json
          created_at: string | null
          document_name: string
          document_type: string
          id: string
          lock_info: Json | null
          owner_id: string
          permissions: Json | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          collaborators?: Json | null
          content?: Json
          created_at?: string | null
          document_name: string
          document_type: string
          id?: string
          lock_info?: Json | null
          owner_id: string
          permissions?: Json | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          collaborators?: Json | null
          content?: Json
          created_at?: string | null
          document_name?: string
          document_type?: string
          id?: string
          lock_info?: Json | null
          owner_id?: string
          permissions?: Json | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      comment_replies: {
        Row: {
          comment_id: number | null
          created_at: string
          id: number
          text: string
          user_id: string | null
        }
        Insert: {
          comment_id?: number | null
          created_at?: string
          id?: never
          text: string
          user_id?: string | null
        }
        Update: {
          comment_id?: number | null
          created_at?: string
          id?: never
          text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_replies_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_replies_user_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          created_at: string
          id: number
          image_id: number | null
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          image_id?: number | null
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          image_id?: number | null
          text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "generated_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      component_configs: {
        Row: {
          component_id: string | null
          config_data: Json | null
          created_at: string
          id: string
          instance_name: string
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          component_id?: string | null
          config_data?: Json | null
          created_at?: string
          id?: string
          instance_name: string
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          component_id?: string | null
          config_data?: Json | null
          created_at?: string
          id?: string
          instance_name?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "component_configs_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "ui_components"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          block_key: string
          block_type: string
          content: Json
          created_at: string
          id: string
          is_active: boolean | null
          locale: string | null
          metadata: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          block_key: string
          block_type: string
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          locale?: string | null
          metadata?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          block_key?: string
          block_type?: string
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          locale?: string | null
          metadata?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_publishing: {
        Row: {
          content_block_id: string
          created_at: string | null
          created_by: string | null
          id: string
          published_at: string | null
          reviewed_by: string | null
          scheduled_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          content_block_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          published_at?: string | null
          reviewed_by?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          content_block_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          published_at?: string | null
          reviewed_by?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_content_publishing_block"
            columns: ["content_block_id"]
            isOneToOne: false
            referencedRelation: "content_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      content_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          template_name: string
          template_schema: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          template_name: string
          template_schema?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          template_name?: string
          template_schema?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          content: Json
          content_block_id: string
          created_at: string | null
          created_by: string | null
          id: string
          metadata: Json | null
          version_number: number
        }
        Insert: {
          content?: Json
          content_block_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          metadata?: Json | null
          version_number?: number
        }
        Update: {
          content?: Json
          content_block_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          metadata?: Json | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_content_versions_block"
            columns: ["content_block_id"]
            isOneToOne: false
            referencedRelation: "content_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          is_muted: boolean | null
          joined_at: string
          last_read_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          conversation_type: string
          created_at: string
          created_by: string | null
          id: string
          is_archived: boolean | null
          last_message_at: string | null
          metadata: Json | null
          order_id: number | null
          participants: Json
          quote_request_id: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          conversation_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          metadata?: Json | null
          order_id?: number | null
          participants?: Json
          quote_request_id?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          conversation_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          metadata?: Json | null
          order_id?: number | null
          participants?: Json
          quote_request_id?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "artisan_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_events: {
        Row: {
          completed: boolean | null
          funnel_name: string
          funnel_step: string
          id: string
          metadata: Json | null
          session_id: string
          step_order: number
          timestamp: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          funnel_name: string
          funnel_step: string
          id?: string
          metadata?: Json | null
          session_id: string
          step_order: number
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          funnel_name?: string
          funnel_step?: string
          id?: string
          metadata?: Json | null
          session_id?: string
          step_order?: number
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      creator_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: number
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          assignee_id: string | null
          company: string
          created_at: string | null
          description: string
          due_date: string
          google_sheets_row_id: string | null
          id: number
          owner_id: string
          priority: string
          status: string
          task_type: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          company: string
          created_at?: string | null
          description: string
          due_date: string
          google_sheets_row_id?: string | null
          id?: number
          owner_id: string
          priority: string
          status: string
          task_type: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          company?: string
          created_at?: string | null
          description?: string
          due_date?: string
          google_sheets_row_id?: string | null
          id?: number
          owner_id?: string
          priority?: string
          status?: string
          task_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dashboard_settings: {
        Row: {
          layout: Json | null
          setting_id: number
          theme: string | null
          user_id: string
          widgets: Json | null
        }
        Insert: {
          layout?: Json | null
          setting_id?: number
          theme?: string | null
          user_id: string
          widgets?: Json | null
        }
        Update: {
          layout?: Json | null
          setting_id?: number
          theme?: string | null
          user_id?: string
          widgets?: Json | null
        }
        Relationships: []
      }
      dynamic_pages: {
        Row: {
          allowed_roles: string[] | null
          component_name: string
          created_at: string
          id: string
          is_active: boolean | null
          layout_config: Json | null
          meta_description: string | null
          page_title: string
          requires_auth: boolean | null
          route_path: string
          updated_at: string
        }
        Insert: {
          allowed_roles?: string[] | null
          component_name: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          layout_config?: Json | null
          meta_description?: string | null
          page_title: string
          requires_auth?: boolean | null
          route_path: string
          updated_at?: string
        }
        Update: {
          allowed_roles?: string[] | null
          component_name?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          layout_config?: Json | null
          meta_description?: string | null
          page_title?: string
          requires_auth?: boolean | null
          route_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      ecommerce_events: {
        Row: {
          currency: string | null
          event_type: string
          id: string
          metadata: Json | null
          price: number | null
          product_category: string | null
          product_id: string | null
          product_name: string | null
          quantity: number | null
          session_id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          currency?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          price?: number | null
          product_category?: string | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          session_id: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          currency?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          price?: number | null
          product_category?: string | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          session_id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          agent_id: number | null
          error_details: Json | null
          error_id: number
          error_message: string
          error_type: string
          occurred_at: string | null
          resolution_details: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: number | null
          error_details?: Json | null
          error_id?: number
          error_message: string
          error_type: string
          occurred_at?: string | null
          resolution_details?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: number | null
          error_details?: Json | null
          error_id?: number
          error_message?: string
          error_type?: string
          occurred_at?: string | null
          resolution_details?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agent"
            referencedColumns: ["agent_id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          conditions: Json | null
          created_at: string
          description: string | null
          flag_name: string
          id: string
          is_enabled: boolean | null
          rollout_percentage: number | null
          target_roles: string[] | null
          updated_at: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          description?: string | null
          flag_name: string
          id?: string
          is_enabled?: boolean | null
          rollout_percentage?: number | null
          target_roles?: string[] | null
          updated_at?: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          description?: string | null
          flag_name?: string
          id?: string
          is_enabled?: boolean | null
          rollout_percentage?: number | null
          target_roles?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      feature_usage: {
        Row: {
          feature_category: string
          feature_name: string
          id: string
          session_id: string
          timestamp: string
          usage_data: Json | null
          user_id: string | null
        }
        Insert: {
          feature_category: string
          feature_name: string
          id?: string
          session_id: string
          timestamp?: string
          usage_data?: Json | null
          user_id?: string | null
        }
        Update: {
          feature_category?: string
          feature_name?: string
          id?: string
          session_id?: string
          timestamp?: string
          usage_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      funnel_steps: {
        Row: {
          created_at: string | null
          funnel_name: string
          id: string
          is_active: boolean | null
          step_criteria: Json
          step_name: string
          step_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          funnel_name: string
          id?: string
          is_active?: boolean | null
          step_criteria: Json
          step_name: string
          step_order: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          funnel_name?: string
          id?: string
          is_active?: boolean | null
          step_criteria?: Json
          step_name?: string
          step_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      generated_contents: {
        Row: {
          content_data: Json
          content_id: number
          content_type: string
          created_at: string
          user_id: string
        }
        Insert: {
          content_data: Json
          content_id?: number
          content_type: string
          created_at?: string
          user_id: string
        }
        Update: {
          content_data?: Json
          content_id?: number
          content_type?: string
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          aspect_ratio: string
          assigned_artisan_id: string | null
          assigned_manufacturer_id: string | null
          created_at: string | null
          edit_prompt: string | null
          edit_version: number | null
          id: number
          image_url: string | null
          is_edited: boolean | null
          is_public: boolean | null
          item_type: string
          likes: number | null
          mask_data: string | null
          original_image_id: number | null
          price: string | null
          prompt: string
          reference_image_url: string | null
          status: string
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
          views: number | null
        }
        Insert: {
          aspect_ratio?: string
          assigned_artisan_id?: string | null
          assigned_manufacturer_id?: string | null
          created_at?: string | null
          edit_prompt?: string | null
          edit_version?: number | null
          id?: never
          image_url?: string | null
          is_edited?: boolean | null
          is_public?: boolean | null
          item_type: string
          likes?: number | null
          mask_data?: string | null
          original_image_id?: number | null
          price?: string | null
          prompt: string
          reference_image_url?: string | null
          status?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          views?: number | null
        }
        Update: {
          aspect_ratio?: string
          assigned_artisan_id?: string | null
          assigned_manufacturer_id?: string | null
          created_at?: string | null
          edit_prompt?: string | null
          edit_version?: number | null
          id?: never
          image_url?: string | null
          is_edited?: boolean | null
          is_public?: boolean | null
          item_type?: string
          likes?: number | null
          mask_data?: string | null
          original_image_id?: number | null
          price?: string | null
          prompt?: string
          reference_image_url?: string | null
          status?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_images_assigned_artisan_id_fkey"
            columns: ["assigned_artisan_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_images_assigned_manufacturer_id_fkey"
            columns: ["assigned_manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_images_original_image_id_fkey"
            columns: ["original_image_id"]
            isOneToOne: false
            referencedRelation: "generated_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      google_sheets_config: {
        Row: {
          created_at: string | null
          id: number
          last_sync_at: string | null
          sheet_name: string
          spreadsheet_id: string
          sync_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          last_sync_at?: string | null
          sheet_name?: string
          spreadsheet_id: string
          sync_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          last_sync_at?: string | null
          sheet_name?: string
          spreadsheet_id?: string
          sync_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      heatmap_data: {
        Row: {
          element_selector: string
          id: string
          interaction_type: string
          metadata: Json | null
          page_path: string
          session_id: string
          timestamp: string | null
          user_id: string | null
          viewport_height: number
          viewport_width: number
          x_coordinate: number
          y_coordinate: number
        }
        Insert: {
          element_selector: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          page_path: string
          session_id: string
          timestamp?: string | null
          user_id?: string | null
          viewport_height: number
          viewport_width: number
          x_coordinate: number
          y_coordinate: number
        }
        Update: {
          element_selector?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          page_path?: string
          session_id?: string
          timestamp?: string | null
          user_id?: string | null
          viewport_height?: number
          viewport_width?: number
          x_coordinate?: number
          y_coordinate?: number
        }
        Relationships: []
      }
      image_likes: {
        Row: {
          created_at: string
          id: number
          image_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          image_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          image_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_likes_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "generated_images"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturer_notifications: {
        Row: {
          created_at: string
          id: number
          is_read: boolean | null
          manufacturer_id: string | null
          message: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: never
          is_read?: boolean | null
          manufacturer_id?: string | null
          message: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: never
          is_read?: boolean | null
          manufacturer_id?: string | null
          message?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "manufacturer_notifications_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturer_portfolios: {
        Row: {
          created_at: string
          description: string
          generatedimage: string | null
          id: number
          manufacturer_id: string | null
          productimage: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          generatedimage?: string | null
          id?: number
          manufacturer_id?: string | null
          productimage?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          generatedimage?: string | null
          id?: number
          manufacturer_id?: string | null
          productimage?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manufacturer_portfolios_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturer_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: number
          manufacturer_id: string | null
          rating: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: number
          manufacturer_id?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: number
          manufacturer_id?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturer_reviews_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturers: {
        Row: {
          address: string | null
          business_name: string
          business_type: string
          contact_email: string
          created_at: string
          description: string | null
          id: string
          is_verified: boolean | null
          phone: string | null
          specialties: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          business_type: string
          contact_email: string
          created_at?: string
          description?: string | null
          id: string
          is_verified?: boolean | null
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          business_type?: string
          contact_email?: string
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      marketplace_metrics: {
        Row: {
          id: number
          image_id: number | null
          metric_type: string
          metric_value: number | null
          recorded_at: string | null
        }
        Insert: {
          id?: number
          image_id?: number | null
          metric_type: string
          metric_value?: number | null
          recorded_at?: string | null
        }
        Update: {
          id?: number
          image_id?: number | null
          metric_type?: string
          metric_value?: number | null
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_metrics_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "generated_images"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allowed_roles: string[] | null
          created_at: string
          description: string | null
          href: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          menu_id: string | null
          opens_in_new_tab: boolean | null
          parent_id: string | null
          requires_auth: boolean | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          allowed_roles?: string[] | null
          created_at?: string
          description?: string | null
          href?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          menu_id?: string | null
          opens_in_new_tab?: boolean | null
          parent_id?: string | null
          requires_auth?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          allowed_roles?: string[] | null
          created_at?: string
          description?: string | null
          href?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          menu_id?: string | null
          opens_in_new_tab?: boolean | null
          parent_id?: string | null
          requires_auth?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "navigation_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          edited_at: string | null
          id: string
          is_deleted: boolean | null
          message_type: string
          metadata: Json | null
          reply_to_id: string | null
          sender_id: string
          system_data: Json | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          message_type?: string
          metadata?: Json | null
          reply_to_id?: string | null
          sender_id: string
          system_data?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          message_type?: string
          metadata?: Json | null
          reply_to_id?: string | null
          sender_id?: string
          system_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_items: {
        Row: {
          allowed_roles: string[] | null
          created_at: string
          id: string
          is_active: boolean
          label: string
          metadata: Json | null
          order_index: number
          parent_id: string | null
          path: string
          requires_auth: boolean
          updated_at: string
        }
        Insert: {
          allowed_roles?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          metadata?: Json | null
          order_index?: number
          parent_id?: string | null
          path: string
          requires_auth?: boolean
          updated_at?: string
        }
        Update: {
          allowed_roles?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          metadata?: Json | null
          order_index?: number
          parent_id?: string | null
          path?: string
          requires_auth?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_menus: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          menu_name: string
          menu_type: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          menu_name: string
          menu_type: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          menu_name?: string
          menu_type?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      page_analytics: {
        Row: {
          exit_page: boolean | null
          id: string
          page_path: string
          page_title: string | null
          referrer: string | null
          scroll_depth_percentage: number | null
          session_id: string
          time_spent_seconds: number | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          exit_page?: boolean | null
          id?: string
          page_path: string
          page_title?: string | null
          referrer?: string | null
          scroll_depth_percentage?: number | null
          session_id: string
          time_spent_seconds?: number | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          exit_page?: boolean | null
          id?: string
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          scroll_depth_percentage?: number | null
          session_id?: string
          time_spent_seconds?: number | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      page_layouts: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          layout_config: Json
          layout_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          layout_config?: Json
          layout_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          layout_config?: Json
          layout_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          currency: string | null
          payment_date: string
          payment_id: number
          payment_status: string
          user_id: string
        }
        Insert: {
          amount: number
          currency?: string | null
          payment_date?: string
          payment_id?: number
          payment_status: string
          user_id: string
        }
        Update: {
          amount?: number
          currency?: string | null
          payment_date?: string
          payment_id?: number
          payment_status?: string
          user_id?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          duration_ms: number
          error_message: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          session_id: string
          success: boolean | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          duration_ms: number
          error_message?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          session_id: string
          success?: boolean | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          duration_ms?: number
          error_message?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          session_id?: string
          success?: boolean | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      personalization_profiles: {
        Row: {
          activity_patterns: Json | null
          color_preferences: string[] | null
          created_at: string | null
          engagement_history: Json | null
          id: string
          last_updated: string | null
          learning_data: Json | null
          preferred_styles: string[] | null
          user_id: string
        }
        Insert: {
          activity_patterns?: Json | null
          color_preferences?: string[] | null
          created_at?: string | null
          engagement_history?: Json | null
          id?: string
          last_updated?: string | null
          learning_data?: Json | null
          preferred_styles?: string[] | null
          user_id: string
        }
        Update: {
          activity_patterns?: Json | null
          color_preferences?: string[] | null
          created_at?: string | null
          engagement_history?: Json | null
          id?: string
          last_updated?: string | null
          learning_data?: Json | null
          preferred_styles?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          availability_status: string | null
          avatar_url: string | null
          bio: string | null
          business_name: string | null
          business_type: string | null
          certifications: string[] | null
          created_at: string | null
          creator_tier: string | null
          display_name: string | null
          first_name: string | null
          hourly_rate: number | null
          id: string
          images_generated_count: number | null
          is_artisan: boolean | null
          is_creator: boolean | null
          last_name: string | null
          location: string | null
          minimum_project_value: number | null
          monthly_image_limit: number | null
          phone: string | null
          preferred_project_types: string[] | null
          response_time_hours: number | null
          skills: string[] | null
          social_links: Json | null
          specialties: string[] | null
          subscription_updated_at: string | null
          updated_at: string | null
          username: string | null
          website: string | null
          working_hours: Json | null
          years_experience: number | null
        }
        Insert: {
          address?: string | null
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          business_type?: string | null
          certifications?: string[] | null
          created_at?: string | null
          creator_tier?: string | null
          display_name?: string | null
          first_name?: string | null
          hourly_rate?: number | null
          id: string
          images_generated_count?: number | null
          is_artisan?: boolean | null
          is_creator?: boolean | null
          last_name?: string | null
          location?: string | null
          minimum_project_value?: number | null
          monthly_image_limit?: number | null
          phone?: string | null
          preferred_project_types?: string[] | null
          response_time_hours?: number | null
          skills?: string[] | null
          social_links?: Json | null
          specialties?: string[] | null
          subscription_updated_at?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          working_hours?: Json | null
          years_experience?: number | null
        }
        Update: {
          address?: string | null
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          business_type?: string | null
          certifications?: string[] | null
          created_at?: string | null
          creator_tier?: string | null
          display_name?: string | null
          first_name?: string | null
          hourly_rate?: number | null
          id?: string
          images_generated_count?: number | null
          is_artisan?: boolean | null
          is_creator?: boolean | null
          last_name?: string | null
          location?: string | null
          minimum_project_value?: number | null
          monthly_image_limit?: number | null
          phone?: string | null
          preferred_project_types?: string[] | null
          response_time_hours?: number | null
          skills?: string[] | null
          social_links?: Json | null
          specialties?: string[] | null
          subscription_updated_at?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          working_hours?: Json | null
          years_experience?: number | null
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          admin_notes: string | null
          amount: number | null
          budget_range: string | null
          colors: string | null
          contact_preferences: string | null
          created_at: string
          delivery_address: string | null
          dimensions: string | null
          generated_image_url: string | null
          id: number
          manufacturer_id: string | null
          materials: string | null
          product_details: string
          quantity: number | null
          special_requirements: string | null
          status: string | null
          timeline_days: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount?: number | null
          budget_range?: string | null
          colors?: string | null
          contact_preferences?: string | null
          created_at?: string
          delivery_address?: string | null
          dimensions?: string | null
          generated_image_url?: string | null
          id?: never
          manufacturer_id?: string | null
          materials?: string | null
          product_details: string
          quantity?: number | null
          special_requirements?: string | null
          status?: string | null
          timeline_days?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number | null
          budget_range?: string | null
          colors?: string | null
          contact_preferences?: string | null
          created_at?: string
          delivery_address?: string | null
          dimensions?: string | null
          generated_image_url?: string | null
          id?: never
          manufacturer_id?: string | null
          materials?: string | null
          product_details?: string
          quantity?: number | null
          special_requirements?: string | null
          status?: string | null
          timeline_days?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_user_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      realtime_analytics_events: {
        Row: {
          event_category: string
          event_data: Json
          event_name: string
          id: string
          processed: boolean | null
          session_id: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          event_category: string
          event_data?: Json
          event_name: string
          id?: string
          processed?: boolean | null
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          event_category?: string
          event_data?: Json
          event_name?: string
          id?: string
          processed?: boolean | null
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      realtime_notification_queue: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          delivery_method: string[] | null
          id: string
          max_retries: number | null
          message: string
          notification_type: string
          payload: Json | null
          priority: number | null
          retry_count: number | null
          scheduled_for: string | null
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          delivery_method?: string[] | null
          id?: string
          max_retries?: number | null
          message: string
          notification_type: string
          payload?: Json | null
          priority?: number | null
          retry_count?: number | null
          scheduled_for?: string | null
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          delivery_method?: string[] | null
          id?: string
          max_retries?: number | null
          message?: string
          notification_type?: string
          payload?: Json | null
          priority?: number | null
          retry_count?: number | null
          scheduled_for?: string | null
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      realtime_sessions: {
        Row: {
          channel_name: string
          created_at: string | null
          device_info: Json | null
          id: string
          last_seen: string | null
          presence_data: Json | null
          session_id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel_name: string
          created_at?: string | null
          device_info?: Json | null
          id?: string
          last_seen?: string | null
          presence_data?: Json | null
          session_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel_name?: string
          created_at?: string | null
          device_info?: Json | null
          id?: string
          last_seen?: string | null
          presence_data?: Json | null
          session_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          clicked_result_position: number | null
          id: string
          results_count: number | null
          search_query: string
          search_type: string
          session_id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          clicked_result_position?: number | null
          id?: string
          results_count?: number | null
          search_query: string
          search_type: string
          session_id: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          clicked_result_position?: number | null
          id?: string
          results_count?: number | null
          search_query?: string
          search_type?: string
          session_id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          resolved: boolean | null
          severity: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          resolved?: boolean | null
          severity?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          resolved?: boolean | null
          severity?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      smart_automation_rules: {
        Row: {
          actions: Json
          created_at: string | null
          created_by: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          rule_name: string
          rule_type: string
          success_rate: number | null
          trigger_conditions: Json
          updated_at: string | null
        }
        Insert: {
          actions: Json
          created_at?: string | null
          created_by?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          rule_name: string
          rule_type: string
          success_rate?: number | null
          trigger_conditions: Json
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          created_at?: string | null
          created_by?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          rule_name?: string
          rule_type?: string
          success_rate?: number | null
          trigger_conditions?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          currency: string
          description: string | null
          features: Json | null
          id: number
          is_active: boolean | null
          monthly_image_limit: number
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string
          description?: string | null
          features?: Json | null
          id?: number
          is_active?: boolean | null
          monthly_image_limit: number
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          description?: string | null
          features?: Json | null
          id?: number
          is_active?: boolean | null
          monthly_image_limit?: number
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string
          end_date: string | null
          plan_name: string
          start_date: string
          status: string
          subscription_id: number
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string
          end_date?: string | null
          plan_name: string
          start_date: string
          status: string
          subscription_id?: number
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string
          end_date?: string | null
          plan_name?: string
          start_date?: string
          status?: string
          subscription_id?: number
          user_id?: string
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: number
          metadata: Json | null
          records_affected: number | null
          started_at: string | null
          status: string
          sync_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: number
          metadata?: Json | null
          records_affected?: number | null
          started_at?: string | null
          status?: string
          sync_type: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: number
          metadata?: Json | null
          records_affected?: number | null
          started_at?: string | null
          status?: string
          sync_type?: string
          user_id?: string
        }
        Relationships: []
      }
      system_health_metrics: {
        Row: {
          alert_threshold_exceeded: boolean | null
          component_name: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_unit: string
          metric_value: number
          timestamp: string | null
        }
        Insert: {
          alert_threshold_exceeded?: boolean | null
          component_name: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_unit: string
          metric_value: number
          timestamp?: string | null
        }
        Update: {
          alert_threshold_exceeded?: boolean | null
          component_name?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_unit?: string
          metric_value?: number
          timestamp?: string | null
        }
        Relationships: []
      }
      ui_components: {
        Row: {
          component_name: string
          component_type: string
          config_schema: Json | null
          created_at: string
          description: string | null
          file_path: string
          id: string
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          component_name: string
          component_type: string
          config_schema?: Json | null
          created_at?: string
          description?: string | null
          file_path: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          component_name?: string
          component_type?: string
          config_schema?: Json | null
          created_at?: string
          description?: string | null
          file_path?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      ui_interactions: {
        Row: {
          element_id: string | null
          element_text: string | null
          element_type: string
          id: string
          metadata: Json | null
          page_path: string
          session_id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          element_id?: string | null
          element_text?: string | null
          element_type: string
          id?: string
          metadata?: Json | null
          page_path: string
          session_id: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          element_id?: string | null
          element_text?: string | null
          element_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string
          session_id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          browser_notifications: boolean | null
          created_at: string | null
          email_marketing: boolean | null
          email_orders: boolean | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          browser_notifications?: boolean | null
          created_at?: string | null
          email_marketing?: boolean | null
          email_orders?: boolean | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          browser_notifications?: boolean | null
          created_at?: string | null
          email_marketing?: boolean | null
          email_orders?: boolean | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_segments: {
        Row: {
          id: string
          joined_at: string | null
          metadata: Json | null
          segment_criteria: Json
          segment_name: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          metadata?: Json | null
          segment_criteria: Json
          segment_name: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          metadata?: Json | null
          segment_criteria?: Json
          segment_name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          duration_seconds: number | null
          end_time: string | null
          id: string
          interactions_count: number | null
          ip_address: unknown | null
          last_activity: string | null
          pages_visited: number | null
          session_id: string
          start_time: string
          user_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          interactions_count?: number | null
          ip_address?: unknown | null
          last_activity?: string | null
          pages_visited?: number | null
          session_id: string
          start_time?: string
          user_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          interactions_count?: number | null
          ip_address?: unknown | null
          last_activity?: string | null
          pages_visited?: number | null
          session_id?: string
          start_time?: string
          user_id?: string
        }
        Relationships: []
      }
      useractions: {
        Row: {
          action_details: Json | null
          action_type: string
          created_at: string | null
          id: number
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          created_at?: string | null
          id?: never
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          created_at?: string | null
          id?: never
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_admin_role: {
        Args: { admin_role: string; target_user_id: string }
        Returns: undefined
      }
      analyze_user_activity: {
        Args: { lookback_days?: number; usage_threshold?: number }
        Returns: {
          total_usage: number
          user_id: string
        }[]
      }
      atomic_like_image: {
        Args: { p_image_id: number; p_user_id: string }
        Returns: Json
      }
      check_ai_agent_health: {
        Args: { p_agent_id: number }
        Returns: Json
      }
      check_user_admin_role_secure: {
        Args: { required_role?: string; target_user_id: string }
        Returns: boolean
      }
      cleanup_expired_api_keys: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      enable_leaked_password_protection: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_conversion_funnel_stats: {
        Args: {
          end_date?: string
          funnel_name_param: string
          start_date?: string
        }
        Returns: {
          conversion_rate: number
          step: string
          step_order: number
          total_users: number
        }[]
      }
      get_image_metrics: {
        Args: { p_image_id: number }
        Returns: {
          metric_type: string
          total_value: number
        }[]
      }
      get_image_versions: {
        Args: { image_id: number }
        Returns: {
          created_at: string
          edit_prompt: string
          edit_version: number
          id: number
          image_url: string
        }[]
      }
      get_page_performance_stats: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          avg_load_time_ms: number
          avg_time_spent_seconds: number
          bounce_rate: number
          page_path: string
          total_views: number
        }[]
      }
      get_public_profile_info: {
        Args: { profile_id?: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          id: string
          is_artisan: boolean
          is_creator: boolean
          location: string
          username: string
          website: string
        }[]
      }
      get_safe_profile_info: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          bio: string
          display_name: string
          id: string
          is_artisan: boolean
          is_creator: boolean
          location: string
          username: string
          website: string
        }[]
      }
      get_user_public_profile: {
        Args: { user_uuid: string }
        Returns: Json
      }
      get_user_stats: {
        Args: { user_uuid: string }
        Returns: Json
      }
      handle_session_upsert: {
        Args: {
          p_browser?: string
          p_device_type?: string
          p_ip_address?: unknown
          p_session_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      increment_views: {
        Args: { image_id: number }
        Returns: undefined
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_authenticated: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_authenticated_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      queue_ai_agent_task: {
        Args: {
          p_agent_id: number
          p_payload: Json
          p_priority?: number
          p_scheduled_for?: string
          p_task_type: string
        }
        Returns: string
      }
      sanitize_text_input: {
        Args: { input_text: string }
        Returns: string
      }
      sync_image_likes_count: {
        Args: { p_image_id?: number }
        Returns: undefined
      }
      trigger_ai_monitoring: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      validate_admin_operation: {
        Args: { operation_type: string }
        Returns: boolean
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
