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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      cities: {
        Row: {
          country: string
          created_at: string
          description: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          slug: string
          state: string
          status: Database["public"]["Enums"]["city_status"]
          updated_at: string
        }
        Insert: {
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          slug: string
          state: string
          status?: Database["public"]["Enums"]["city_status"]
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          slug?: string
          state?: string
          status?: Database["public"]["Enums"]["city_status"]
          updated_at?: string
        }
        Relationships: []
      }
      city_requests: {
        Row: {
          city_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          city_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          city_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_requests_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_requests_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_requests_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_stats"
            referencedColumns: ["city_id"]
          },
        ]
      }
      city_tallies: {
        Row: {
          city_id: string
          last_vote_at: string | null
          rating_count: number
          rating_sum: number
          recent_vote_count: number
          updated_at: string
          vote_count: number
        }
        Insert: {
          city_id: string
          last_vote_at?: string | null
          rating_count?: number
          rating_sum?: number
          recent_vote_count?: number
          updated_at?: string
          vote_count?: number
        }
        Update: {
          city_id?: string
          last_vote_at?: string | null
          rating_count?: number
          rating_sum?: number
          recent_vote_count?: number
          updated_at?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "city_tallies_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: true
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_tallies_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: true
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_tallies_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: true
            referencedRelation: "city_stats"
            referencedColumns: ["city_id"]
          },
        ]
      }
      city_votes: {
        Row: {
          city_id: string
          created_at: string
          id: string
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city_id: string
          created_at?: string
          id?: string
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city_id?: string
          created_at?: string
          id?: string
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_votes_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_votes_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_votes_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_stats"
            referencedColumns: ["city_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          home_city_id: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          home_city_id?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          home_city_id?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_home_city_fkey"
            columns: ["home_city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_home_city_fkey"
            columns: ["home_city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_home_city_fkey"
            columns: ["home_city_id"]
            isOneToOne: false
            referencedRelation: "city_stats"
            referencedColumns: ["city_id"]
          },
        ]
      }
      ranking_snapshots: {
        Row: {
          captured_at: string
          city_id: string
          id: string
          index_score: number | null
          rank: number
          vote_count: number
        }
        Insert: {
          captured_at?: string
          city_id: string
          id?: string
          index_score?: number | null
          rank: number
          vote_count: number
        }
        Update: {
          captured_at?: string
          city_id?: string
          id?: string
          index_score?: number | null
          rank?: number
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "ranking_snapshots_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_snapshots_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_snapshots_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_stats"
            referencedColumns: ["city_id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          resolved: boolean
          review_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          resolved?: boolean
          review_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          resolved?: boolean
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          area: string | null
          city_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          area?: string | null
          city_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          area?: string | null
          city_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_stats"
            referencedColumns: ["city_id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          city_id: string
          created_at: string
          id: string
          meat: number | null
          overall: number
          photo_path: string | null
          restaurant_id: string
          rice: number | null
          spice: number | null
          status: Database["public"]["Enums"]["content_status"]
          taste: number | null
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          body?: string | null
          city_id: string
          created_at?: string
          id?: string
          meat?: number | null
          overall: number
          photo_path?: string | null
          restaurant_id: string
          rice?: number | null
          spice?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          taste?: number | null
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          body?: string | null
          city_id?: string
          created_at?: string
          id?: string
          meat?: number | null
          overall?: number
          photo_path?: string | null
          restaurant_id?: string
          rice?: number | null
          spice?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          taste?: number | null
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_stats"
            referencedColumns: ["city_id"]
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant_stats"
            referencedColumns: ["restaurant_id"]
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      city_rankings: {
        Row: {
          country: string | null
          created_at: string | null
          description: string | null
          id: string | null
          index_score: number | null
          latitude: number | null
          longitude: number | null
          name: string | null
          photo_count: number | null
          previous_rank: number | null
          rank: number | null
          rank_movement: number | null
          rating_count: number | null
          raw_average: number | null
          recent_review_count: number | null
          recent_vote_count: number | null
          review_count: number | null
          slug: string | null
          state: string | null
          status: Database["public"]["Enums"]["city_status"] | null
          vote_count: number | null
        }
        Relationships: []
      }
      city_stats: {
        Row: {
          city_id: string | null
          index_score: number | null
          photo_count: number | null
          rank: number | null
          rating_count: number | null
          raw_average: number | null
          recent_review_count: number | null
          recent_vote_count: number | null
          review_count: number | null
          vote_count: number | null
        }
        Relationships: []
      }
      platform_stats: {
        Row: {
          cities_ranked: number | null
          live_cities: number | null
          photo_reviews: number | null
          total_reviews: number | null
          total_votes: number | null
        }
        Relationships: []
      }
      restaurant_stats: {
        Row: {
          city_id: string | null
          community_score: number | null
          meat_avg: number | null
          photo_count: number | null
          rank: number | null
          raw_average: number | null
          restaurant_id: string | null
          review_count: number | null
          rice_avg: number | null
          spice_avg: number | null
          taste_avg: number | null
          value_avg: number | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_stats"
            referencedColumns: ["city_id"]
          },
        ]
      }
    }
    Functions: {
      capture_ranking_snapshot: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      recount_city: { Args: { _city_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      city_status: "live" | "coming_soon"
      content_status: "published" | "hidden"
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
      app_role: ["admin", "moderator", "user"],
      city_status: ["live", "coming_soon"],
      content_status: ["published", "hidden"],
    },
  },
} as const
