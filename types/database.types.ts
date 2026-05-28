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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          actor_action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          actor_action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          actor_action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      judging_assignments: {
        Row: {
          assigned_at: string
          completed_at: string | null
          id: string
          is_complete: boolean
          judge_user_id: string
          sprint_id: string
        }
        Insert: {
          assigned_at?: string
          completed_at?: string | null
          id?: string
          is_complete?: boolean
          judge_user_id: string
          sprint_id: string
        }
        Update: {
          assigned_at?: string
          completed_at?: string | null
          id?: string
          is_complete?: boolean
          judge_user_id?: string
          sprint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "judging_assignments_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          arena_role: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          rank_tier: string
          sprint_count: number
          total_points: number
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          arena_role?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          rank_tier?: string
          sprint_count?: number
          total_points?: number
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          arena_role?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          rank_tier?: string
          sprint_count?: number
          total_points?: number
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          id: string
          normalized_score: number
          points_awarded: number
          published_at: string | null
          rank: number
          sprint_id: string
          submission_id: string
        }
        Insert: {
          id?: string
          normalized_score: number
          points_awarded: number
          published_at?: string | null
          rank: number
          sprint_id: string
          submission_id: string
        }
        Update: {
          id?: string
          normalized_score?: number
          points_awarded?: number
          published_at?: string | null
          rank?: number
          sprint_id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          adherence_score: number
          concept_score: number
          craft_score: number
          feedback: string | null
          id: string
          impact_score: number
          judge_user_id: string
          originality_score: number
          raw_total_score: number | null
          scored_at: string
          submission_id: string
          updated_at: string
        }
        Insert: {
          adherence_score: number
          concept_score: number
          craft_score: number
          feedback?: string | null
          id?: string
          impact_score: number
          judge_user_id: string
          originality_score: number
          raw_total_score?: number | null
          scored_at?: string
          submission_id: string
          updated_at?: string
        }
        Update: {
          adherence_score?: number
          concept_score?: number
          craft_score?: number
          feedback?: string | null
          id?: string
          impact_score?: number
          judge_user_id?: string
          originality_score?: number
          raw_total_score?: number | null
          scored_at?: string
          submission_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      sprints: {
        Row: {
          brief_content: Json
          close_at: string | null
          created_at: string
          created_by: string | null
          discipline: string
          id: string
          open_at: string | null
          prize_data: Json
          results_at: string | null
          sprint_number: number
          sprint_status: string
          title: string
          updated_at: string
        }
        Insert: {
          brief_content?: Json
          close_at?: string | null
          created_at?: string
          created_by?: string | null
          discipline?: string
          id?: string
          open_at?: string | null
          prize_data?: Json
          results_at?: string | null
          sprint_number: number
          sprint_status?: string
          title: string
          updated_at?: string
        }
        Update: {
          brief_content?: Json
          close_at?: string | null
          created_at?: string
          created_by?: string | null
          discipline?: string
          id?: string
          open_at?: string | null
          prize_data?: Json
          results_at?: string | null
          sprint_number?: number
          sprint_status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          brief_interpretation: string
          disqualified_at: string | null
          disqualified_by: string | null
          disqualify_reason: string | null
          id: string
          is_disqualified: boolean
          main_file_type: string
          main_file_url: string
          note_to_judges: string | null
          process_file_urls: string[]
          sprint_id: string
          submitted_at: string
          time_spent_hours: number
          tools_used: string
          user_id: string
        }
        Insert: {
          brief_interpretation: string
          disqualified_at?: string | null
          disqualified_by?: string | null
          disqualify_reason?: string | null
          id?: string
          is_disqualified?: boolean
          main_file_type: string
          main_file_url: string
          note_to_judges?: string | null
          process_file_urls?: string[]
          sprint_id: string
          submitted_at?: string
          time_spent_hours: number
          tools_used: string
          user_id: string
        }
        Update: {
          brief_interpretation?: string
          disqualified_at?: string | null
          disqualified_by?: string | null
          disqualify_reason?: string | null
          id?: string
          is_disqualified?: boolean
          main_file_type?: string
          main_file_url?: string
          note_to_judges?: string | null
          process_file_urls?: string[]
          sprint_id?: string
          submitted_at?: string
          time_spent_hours?: number
          tools_used?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_all_judges_complete: {
        Args: { p_sprint_id: string }
        Returns: boolean
      }
      check_is_admin: { Args: never; Returns: boolean }
      execute_sprint_publication_pipeline: {
        Args: { p_published_at: string; p_sprint_id: string }
        Returns: undefined
      }
      get_emails_for_users_list: {
        Args: { p_user_ids: string[] }
        Returns: {
          email: string
          user_id: string
        }[]
      }
      get_judge_progress: {
        Args: { p_judge_id: string; p_sprint_id: string }
        Returns: {
          scored: number
          total: number
        }[]
      }
      get_sprint_entry_count: { Args: { p_sprint_id: string }; Returns: number }
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
