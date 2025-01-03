export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      artisan_quotes: {
        Row: {
          amount: number | null
          artisan_id: string | null
          created_at: string
          id: number
          payment_status: string | null
          product_details: string
          status: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          artisan_id?: string | null
          created_at?: string
          id?: number
          payment_status?: string | null
          product_details: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          artisan_id?: string | null
          created_at?: string
          id?: number
          payment_status?: string | null
          product_details?: string
          status?: string | null
          stripe_session_id?: string | null
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
      crm_tasks: {
        Row: {
          assignee_id: string | null
          company: string
          created_at: string | null
          description: string
          due_date: string
          id: number
          owner_id: string | null
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
          id?: number
          owner_id?: string | null
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
          id?: number
          owner_id?: string | null
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
          created_at: string | null
          id: number
          image_url: string | null
          is_public: boolean | null
          item_type: string
          likes: number | null
          prompt: string
          reference_image_url: string | null
          status: string
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          views: number | null
        }
        Insert: {
          aspect_ratio?: string
          created_at?: string | null
          id?: never
          image_url?: string | null
          is_public?: boolean | null
          item_type: string
          likes?: number | null
          prompt: string
          reference_image_url?: string | null
          status?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
        }
        Update: {
          aspect_ratio?: string
          created_at?: string | null
          id?: never
          image_url?: string | null
          is_public?: boolean | null
          item_type?: string
          likes?: number | null
          prompt?: string
          reference_image_url?: string | null
          status?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      manufacturers: {
        Row: {
          address: string | null
          business_name: string
          business_type: string
          contact_email: string
          created_at: string
          id: string
          is_verified: boolean | null
          phone: string | null
          specialties: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_name: string
          business_type: string
          contact_email: string
          created_at?: string
          id: string
          is_verified?: boolean | null
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_name?: string
          business_type?: string
          contact_email?: string
          created_at?: string
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string
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
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          business_name: string | null
          business_type: string | null
          created_at: string | null
          id: string
          is_artisan: boolean | null
          phone: string | null
          specialties: string[] | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string | null
          id: string
          is_artisan?: boolean | null
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string | null
          id?: string
          is_artisan?: boolean | null
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          created_at: string
          id: number
          manufacturer_id: string | null
          product_details: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          manufacturer_id?: string | null
          product_details: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          manufacturer_id?: string | null
          product_details?: string
          status?: string | null
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
      analyze_user_activity: {
        Args: {
          lookback_days?: number
          usage_threshold?: number
        }
        Returns: {
          user_id: string
          total_usage: number
        }[]
      }
      cleanup_expired_api_keys: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_image_metrics: {
        Args: {
          p_image_id: number
        }
        Returns: {
          metric_type: string
          total_value: number
        }[]
      }
      increment_views: {
        Args: {
          image_id: number
        }
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
