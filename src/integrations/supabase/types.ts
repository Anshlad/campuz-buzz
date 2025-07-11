export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_private: boolean | null
          member_count: number | null
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          member_count?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          member_count?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      communities_enhanced: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          invite_code: string | null
          is_private: boolean | null
          member_count: number | null
          name: string
          rules: string | null
          slow_mode_seconds: number | null
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invite_code?: string | null
          is_private?: boolean | null
          member_count?: number | null
          name: string
          rules?: string | null
          slow_mode_seconds?: number | null
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invite_code?: string | null
          is_private?: boolean | null
          member_count?: number | null
          name?: string
          rules?: string | null
          slow_mode_seconds?: number | null
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      community_channels: {
        Row: {
          community_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_private: boolean | null
          name: string
          position: number | null
          slowmode_seconds: number | null
          topic: string | null
          type: string
          updated_at: string
        }
        Insert: {
          community_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          name: string
          position?: number | null
          slowmode_seconds?: number | null
          topic?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          community_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
          position?: number | null
          slowmode_seconds?: number | null
          topic?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_channels_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          banned: boolean | null
          community_id: string
          id: string
          joined_at: string
          muted_until: string | null
          nickname: string | null
          roles: string[] | null
          user_id: string
        }
        Insert: {
          banned?: boolean | null
          community_id: string
          id?: string
          joined_at?: string
          muted_until?: string | null
          nickname?: string | null
          roles?: string[] | null
          user_id: string
        }
        Update: {
          banned?: boolean | null
          community_id?: string
          id?: string
          joined_at?: string
          muted_until?: string | null
          nickname?: string | null
          roles?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      community_memberships: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_roles: {
        Row: {
          color: string | null
          community_id: string
          created_at: string
          id: string
          mentionable: boolean | null
          name: string
          permissions: Json | null
          position: number | null
        }
        Insert: {
          color?: string | null
          community_id: string
          created_at?: string
          id?: string
          mentionable?: boolean | null
          name: string
          permissions?: Json | null
          position?: number | null
        }
        Update: {
          color?: string | null
          community_id?: string
          created_at?: string
          id?: string
          mentionable?: boolean | null
          name?: string
          permissions?: Json | null
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_roles_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_emojis: {
        Row: {
          community_id: string
          created_at: string
          created_by: string
          id: string
          image_url: string
          name: string
        }
        Insert: {
          community_id: string
          created_at?: string
          created_by: string
          id?: string
          image_url: string
          name: string
        }
        Update: {
          community_id?: string
          created_at?: string
          created_by?: string
          id?: string
          image_url?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_emojis_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      dm_conversations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_group: boolean | null
          name: string | null
          participants: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          participants: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          participants?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mentorship_matches: {
        Row: {
          created_at: string
          id: string
          match_score: number | null
          mentee_id: string
          mentor_id: string
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_score?: number | null
          mentee_id: string
          mentor_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          match_score?: number | null
          mentee_id?: string
          mentor_id?: string
          status?: string | null
        }
        Relationships: []
      }
      message_reads: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          channel_id: string | null
          content: string
          created_at: string
          dm_conversation_id: string | null
          edited_at: string | null
          embeds: Json | null
          id: string
          is_edited: boolean | null
          is_pinned: boolean | null
          mentions: string[] | null
          message_type: string | null
          reactions: Json | null
          reply_to: string | null
          thread_root: string | null
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          channel_id?: string | null
          content: string
          created_at?: string
          dm_conversation_id?: string | null
          edited_at?: string | null
          embeds?: Json | null
          id?: string
          is_edited?: boolean | null
          is_pinned?: boolean | null
          mentions?: string[] | null
          message_type?: string | null
          reactions?: Json | null
          reply_to?: string | null
          thread_root?: string | null
          user_id: string
        }
        Update: {
          attachments?: Json | null
          channel_id?: string | null
          content?: string
          created_at?: string
          dm_conversation_id?: string | null
          edited_at?: string | null
          embeds?: Json | null
          id?: string
          is_edited?: boolean | null
          is_pinned?: boolean | null
          mentions?: string[] | null
          message_type?: string | null
          reactions?: Json | null
          reply_to?: string | null
          thread_root?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "community_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_root_fkey"
            columns: ["thread_root"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_logs: {
        Row: {
          action: string
          community_id: string
          created_at: string
          duration: number | null
          id: string
          metadata: Json | null
          moderator_id: string
          reason: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          community_id: string
          created_at?: string
          duration?: number | null
          id?: string
          metadata?: Json | null
          moderator_id: string
          reason?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          community_id?: string
          created_at?: string
          duration?: number | null
          id?: string
          metadata?: Json | null
          moderator_id?: string
          reason?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_logs_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pinned_messages: {
        Row: {
          channel_id: string | null
          dm_conversation_id: string | null
          id: string
          message_id: string
          pinned_at: string
          pinned_by: string
        }
        Insert: {
          channel_id?: string | null
          dm_conversation_id?: string | null
          id?: string
          message_id: string
          pinned_at?: string
          pinned_by: string
        }
        Update: {
          channel_id?: string | null
          dm_conversation_id?: string | null
          id?: string
          message_id?: string
          pinned_at?: string
          pinned_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinned_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "community_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinned_messages_dm_conversation_id_fkey"
            columns: ["dm_conversation_id"]
            isOneToOne: false
            referencedRelation: "dm_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinned_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: true
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          post_id: string
          reason: string
          reported_by: string
          status: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          post_id: string
          reason: string
          reported_by: string
          status?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string
          reason?: string
          reported_by?: string
          status?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          comments_count: number | null
          community_id: string | null
          content: string
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          image_url: string | null
          is_pinned: boolean | null
          likes_count: number | null
          poll_options: Json | null
          post_type: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          community_id?: string | null
          content: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number | null
          poll_options?: Json | null
          post_type?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          community_id?: string | null
          content?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number | null
          poll_options?: Json | null
          post_type?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          department: string | null
          display_name: string | null
          engagement_score: number | null
          id: string
          major: string | null
          role: string | null
          updated_at: string
          user_id: string
          year: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          engagement_score?: number | null
          id?: string
          major?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
          year?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          engagement_score?: number | null
          id?: string
          major?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
          year?: string | null
        }
        Relationships: []
      }
      typing_indicators: {
        Row: {
          channel_id: string | null
          dm_conversation_id: string | null
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          channel_id?: string | null
          dm_conversation_id?: string | null
          id?: string
          started_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string | null
          dm_conversation_id?: string | null
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "community_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "typing_indicators_dm_conversation_id_fkey"
            columns: ["dm_conversation_id"]
            isOneToOne: false
            referencedRelation: "dm_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_at: string
          blocked_id: string
          blocker_id: string
          id: string
        }
        Insert: {
          blocked_at?: string
          blocked_id: string
          blocker_id: string
          id?: string
        }
        Update: {
          blocked_at?: string
          blocked_id?: string
          blocker_id?: string
          id?: string
        }
        Relationships: []
      }
      user_bookmarks: {
        Row: {
          bookmarked_at: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          bookmarked_at?: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          bookmarked_at?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_sessions: {
        Row: {
          channel_id: string
          ended_at: string | null
          id: string
          is_active: boolean | null
          participants: string[] | null
          session_id: string
          started_at: string
          started_by: string
        }
        Insert: {
          channel_id: string
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          participants?: string[] | null
          session_id: string
          started_at?: string
          started_by: string
        }
        Update: {
          channel_id?: string
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          participants?: string[] | null
          session_id?: string
          started_at?: string
          started_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_sessions_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "community_channels"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_typing_indicators: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_study_suggestions: {
        Args: { user_uuid: string }
        Returns: {
          suggestion_type: string
          title: string
          description: string
          relevance_score: number
        }[]
      }
      increment_engagement_score: {
        Args: { user_uuid: string; points?: number }
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
