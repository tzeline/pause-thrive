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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      emergency_sessions: {
        Row: {
          ai_reappraisal: string | null
          created_at: string
          friend_message_shown: string | null
          goal_id: string | null
          id: string
          outcome: string | null
          user_id: string
          what_helped: string | null
        }
        Insert: {
          ai_reappraisal?: string | null
          created_at?: string
          friend_message_shown?: string | null
          goal_id?: string | null
          id?: string
          outcome?: string | null
          user_id: string
          what_helped?: string | null
        }
        Update: {
          ai_reappraisal?: string | null
          created_at?: string
          friend_message_shown?: string | null
          goal_id?: string | null
          id?: string
          outcome?: string | null
          user_id?: string
          what_helped?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_sessions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          started_at: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          started_at?: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          started_at?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      friend_messages: {
        Row: {
          created_at: string
          friend_email: string | null
          friend_name: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_email?: string | null
          friend_name: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_email?: string | null
          friend_name?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          time_horizon: string | null
          title: string
          updated_at: string
          user_id: string
          why_it_matters: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          time_horizon?: string | null
          title: string
          updated_at?: string
          user_id: string
          why_it_matters?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          time_horizon?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          why_it_matters?: string | null
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          appreciation_message: string | null
          created_at: string
          id: string
          message_id: string
          notify_friend: boolean | null
          reaction_type: string
          user_id: string
        }
        Insert: {
          appreciation_message?: string | null
          created_at?: string
          id?: string
          message_id: string
          notify_friend?: boolean | null
          reaction_type: string
          user_id: string
        }
        Update: {
          appreciation_message?: string | null
          created_at?: string
          id?: string
          message_id?: string
          notify_friend?: boolean | null
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "friend_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      micro_learning_views: {
        Row: {
          id: string
          learning_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          learning_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          learning_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: []
      }
      pause_usage: {
        Row: {
          created_at: string
          id: string
          pause_count: number
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pause_count?: number
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pause_count?: number
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      pilot_feedback: {
        Row: {
          created_at: string
          feature: string
          feedback_text: string | null
          helpful: boolean | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feature: string
          feedback_text?: string | null
          helpful?: boolean | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feature?: string
          feedback_text?: string | null
          helpful?: boolean | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          notification_preferences: Json | null
          onboarding_completed: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          notification_preferences?: Json | null
          onboarding_completed?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          notification_preferences?: Json | null
          onboarding_completed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan_type: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      temptation_patterns: {
        Row: {
          created_at: string
          desired_alternative: string
          goal_id: string
          id: string
          temptation_behavior: string
          trigger_description: string
          user_id: string
        }
        Insert: {
          created_at?: string
          desired_alternative: string
          goal_id: string
          id?: string
          temptation_behavior: string
          trigger_description: string
          user_id: string
        }
        Update: {
          created_at?: string
          desired_alternative?: string
          goal_id?: string
          id?: string
          temptation_behavior?: string
          trigger_description?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "temptation_patterns_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_insights: {
        Row: {
          awareness_signs: string | null
          created_at: string
          generated_at: string
          id: string
          patterns: string | null
          resisted_count: number | null
          sessions_count: number | null
          strengths: string | null
          suggestion: string | null
          user_id: string
          viewed_at: string | null
          week_end: string
          week_start: string
        }
        Insert: {
          awareness_signs?: string | null
          created_at?: string
          generated_at?: string
          id?: string
          patterns?: string | null
          resisted_count?: number | null
          sessions_count?: number | null
          strengths?: string | null
          suggestion?: string | null
          user_id: string
          viewed_at?: string | null
          week_end: string
          week_start: string
        }
        Update: {
          awareness_signs?: string | null
          created_at?: string
          generated_at?: string
          id?: string
          patterns?: string | null
          resisted_count?: number | null
          sessions_count?: number | null
          strengths?: string | null
          suggestion?: string | null
          user_id?: string
          viewed_at?: string | null
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
