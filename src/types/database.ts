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
      impact: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          source_type: Database["public"]["Enums"]["impact_source_type"] | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          source_type?: Database["public"]["Enums"]["impact_source_type"] | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          source_type?: Database["public"]["Enums"]["impact_source_type"] | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_action: {
        Row: {
          area_key: string | null
          closed_at: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          impact_id: string
          owner: string | null
          status: Database["public"]["Enums"]["action_status"]
        }
        Insert: {
          area_key?: string | null
          closed_at?: string | null
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          impact_id: string
          owner?: string | null
          status?: Database["public"]["Enums"]["action_status"]
        }
        Update: {
          area_key?: string | null
          closed_at?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          impact_id?: string
          owner?: string | null
          status?: Database["public"]["Enums"]["action_status"]
        }
        Relationships: [
          {
            foreignKeyName: "impact_action_area_key_fkey"
            columns: ["area_key"]
            isOneToOne: false
            referencedRelation: "impact_area"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "impact_action_impact_id_fkey"
            columns: ["impact_id"]
            isOneToOne: false
            referencedRelation: "impact"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_area: {
        Row: {
          key: string
          sort_order: number
        }
        Insert: {
          key: string
          sort_order: number
        }
        Update: {
          key?: string
          sort_order?: number
        }
        Relationships: []
      }
      impact_area_state: {
        Row: {
          area_key: string
          id: string
          impact_id: string
          notes: string | null
          state: Database["public"]["Enums"]["area_state"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          area_key: string
          id?: string
          impact_id: string
          notes?: string | null
          state?: Database["public"]["Enums"]["area_state"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          area_key?: string
          id?: string
          impact_id?: string
          notes?: string | null
          state?: Database["public"]["Enums"]["area_state"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_area_state_area_key_fkey"
            columns: ["area_key"]
            isOneToOne: false
            referencedRelation: "impact_area"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "impact_area_state_impact_id_fkey"
            columns: ["impact_id"]
            isOneToOne: false
            referencedRelation: "impact"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_reference: {
        Row: {
          area_key: string | null
          created_at: string
          id: string
          impact_id: string
          label: string | null
          url: string
        }
        Insert: {
          area_key?: string | null
          created_at?: string
          id?: string
          impact_id: string
          label?: string | null
          url: string
        }
        Update: {
          area_key?: string | null
          created_at?: string
          id?: string
          impact_id?: string
          label?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_reference_area_key_fkey"
            columns: ["area_key"]
            isOneToOne: false
            referencedRelation: "impact_area"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "impact_reference_impact_id_fkey"
            columns: ["impact_id"]
            isOneToOne: false
            referencedRelation: "impact"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      workspace: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      workspace_invitation: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["workspace_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invitation_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_member: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_member_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_pending_invitations: { Args: never; Returns: number }
      accept_workspace_invitation: {
        Args: { p_invitation_id: string }
        Returns: boolean
      }
      archive_impact: { Args: { p_impact_id: string }; Returns: boolean }
      cancel_workspace_invitation: {
        Args: { p_invitation_id: string }
        Returns: boolean
      }
      create_impact: {
        Args: {
          p_description?: string
          p_source_type?: Database["public"]["Enums"]["impact_source_type"]
          p_title: string
          ws_id: string
        }
        Returns: string
      }
      create_workspace: { Args: { workspace_name: string }; Returns: string }
      delete_workspace: { Args: { p_workspace_id: string }; Returns: boolean }
      get_impact_detail: {
        Args: { p_impact_id: string }
        Returns: {
          created_at: string
          created_by: string
          created_by_email: string
          created_by_name: string
          description: string
          id: string
          source_type: Database["public"]["Enums"]["impact_source_type"]
          status: string
          title: string
          updated_at: string
          workspace_id: string
        }[]
      }
      get_user_workspaces: {
        Args: never
        Returns: {
          created_at: string
          id: string
          member_count: number
          name: string
          role: Database["public"]["Enums"]["workspace_role"]
        }[]
      }
      get_workspace_impacts: {
        Args: { ws_id: string }
        Returns: {
          actions_done: number
          actions_open: number
          areas_impacted: number
          areas_not_impacted: number
          areas_to_review: number
          created_at: string
          created_by: string
          created_by_email: string
          created_by_name: string
          description: string
          id: string
          source_type: Database["public"]["Enums"]["impact_source_type"]
          status: string
          title: string
          updated_at: string
        }[]
      }
      get_workspace_members: {
        Args: { p_workspace_id: string }
        Returns: {
          avatar_url: string
          display_name: string
          email: string
          joined_at: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
        }[]
      }
      get_workspace_pending_invitations: {
        Args: { p_workspace_id: string }
        Returns: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          invited_by_email: string
          invited_by_name: string
          role: Database["public"]["Enums"]["workspace_role"]
        }[]
      }
      leave_workspace: { Args: { p_workspace_id: string }; Returns: boolean }
      remove_workspace_member: {
        Args: { p_user_id: string; p_workspace_id: string }
        Returns: boolean
      }
      rename_workspace: {
        Args: { p_new_name: string; p_workspace_id: string }
        Returns: boolean
      }
      send_workspace_invitation: {
        Args: {
          p_email: string
          p_role?: Database["public"]["Enums"]["workspace_role"]
          p_workspace_id: string
        }
        Returns: string
      }
      update_area_state: {
        Args: {
          p_area_key: string
          p_impact_id: string
          p_notes?: string
          p_state: Database["public"]["Enums"]["area_state"]
        }
        Returns: boolean
      }
      update_impact: {
        Args: {
          p_description?: string
          p_impact_id: string
          p_source_type?: Database["public"]["Enums"]["impact_source_type"]
          p_title?: string
        }
        Returns: boolean
      }
      update_member_role: {
        Args: {
          p_new_role: Database["public"]["Enums"]["workspace_role"]
          p_user_id: string
          p_workspace_id: string
        }
        Returns: boolean
      }
      get_current_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          email: string
          id: string
          updated_at: string
        }[]
      }
      update_profile: {
        Args: { p_display_name?: string }
        Returns: boolean
      }
    }
    Enums: {
      action_status: "open" | "done"
      area_state: "to_review" | "impacted" | "not_impacted"
      impact_source_type:
        | "decision"
        | "incident"
        | "audit"
        | "requirement"
        | "organizational"
        | "technical"
        | "near_miss"
      invitation_status: "pending" | "accepted" | "expired"
      workspace_role: "owner" | "member"
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
    Enums: {
      action_status: ["open", "done"],
      area_state: ["to_review", "impacted", "not_impacted"],
      impact_source_type: [
        "decision",
        "incident",
        "audit",
        "requirement",
        "organizational",
        "technical",
        "near_miss",
      ],
      invitation_status: ["pending", "accepted", "expired"],
      workspace_role: ["owner", "member"],
    },
  },
} as const
