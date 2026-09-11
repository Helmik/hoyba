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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      curated_stories: {
        Row: {
          compiled_at: string
          created_at: string
          edition: string
          event_ids: Json
          id: string
          is_published: boolean
          metadata: Json | null
          story_image_url: string | null
          target_date: string
          title: string
          updated_at: string
        }
        Insert: {
          compiled_at?: string
          created_at?: string
          edition: string
          event_ids?: Json
          id?: string
          is_published?: boolean
          metadata?: Json | null
          story_image_url?: string | null
          target_date?: string
          title: string
          updated_at?: string
        }
        Update: {
          compiled_at?: string
          created_at?: string
          edition?: string
          event_ids?: Json
          id?: string
          is_published?: boolean
          metadata?: Json | null
          story_image_url?: string | null
          target_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          address: string | null
          category: string
          coordinates: unknown
          cover_image_url: string | null
          created_at: string
          currency: string
          description: Json
          end_date: string | null
          id: string
          is_free: boolean | null
          is_published: boolean
          location_name: string
          organizer_id: string | null
          original_lang: string
          price: number
          search_document: unknown
          start_date: string
          ticket_url: string | null
          title: Json
          updated_at: string
        }
        Insert: {
          address?: string | null
          category: string
          coordinates: unknown
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description: Json
          end_date?: string | null
          id?: string
          is_free?: boolean | null
          is_published?: boolean
          location_name: string
          organizer_id?: string | null
          original_lang: string
          price?: number
          search_document?: unknown
          start_date: string
          ticket_url?: string | null
          title: Json
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string
          coordinates?: unknown
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description?: Json
          end_date?: string | null
          id?: string
          is_free?: boolean | null
          is_published?: boolean
          location_name?: string
          organizer_id?: string | null
          original_lang?: string
          price?: number
          search_document?: unknown
          start_date?: string
          ticket_url?: string | null
          title?: Json
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          contact_email: string | null
          created_at: string
          full_name: string | null
          id: string
          instagram_handle: string | null
          organization_name: string | null
          role: string
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          contact_email?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          instagram_handle?: string | null
          organization_name?: string | null
          role?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          contact_email?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          instagram_handle?: string | null
          organization_name?: string | null
          role?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      saved_events: {
        Row: {
          created_at: string
          event_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      translation_jobs: {
        Row: {
          attempts: number
          created_at: string
          error_message: string | null
          event_id: string
          id: string
          source_lang: string
          status: string
          target_lang: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          event_id: string
          id?: string
          source_lang: string
          status?: string
          target_lang: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          event_id?: string
          id?: string
          source_lang?: string
          status?: string
          target_lang?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "translation_jobs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_translation_jobs: {
        Args: { batch_size?: number; max_attempts?: number }
        Returns: {
          desc_to_translate: string
          event_id: string
          job_id: string
          source_lang: string
          target_lang: string
          title_to_translate: string
        }[]
      }
      complete_translation_job: {
        Args: {
          p_job_id: string
          p_translated_description: string
          p_translated_title: string
        }
        Returns: boolean
      }
      get_story_candidates: {
        Args: { p_date?: string; p_edition?: string; p_limit?: number }
        Returns: {
          category: string
          cover_image_url: string
          currency: string
          id: string
          is_free: boolean
          location_name: string
          price: number
          start_date: string
          title: string
        }[]
      }
      search_events: {
        Args: {
          filter_category?: string
          filter_date_from?: string
          filter_date_to?: string
          filter_locale?: string
          limit_val?: number
          offset_val?: number
          radius_meters?: number
          search_query?: string
          user_lat?: number
          user_lon?: number
        }
        Returns: {
          address: string
          category: string
          coordinates: unknown
          cover_image_url: string
          created_at: string
          currency: string
          description: Json
          distance_meters: number
          end_date: string
          id: string
          is_free: boolean
          is_published: boolean
          location_name: string
          organizer_id: string
          original_lang: string
          price: number
          relevance_score: number
          start_date: string
          ticket_url: string
          title: Json
          updated_at: string
        }[]
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
