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
      admin_notifications: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          message: string
          priority: string
          target_audience: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          message: string
          priority?: string
          target_audience?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          message?: string
          priority?: string
          target_audience?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
      areas: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      bugs: {
        Row: {
          created_at: string
          description: string
          email: string
          id: string
          name: string
          page_url: string | null
          player_id: string | null
          player_name: string | null
          screenshot_url: string | null
        }
        Insert: {
          created_at?: string
          description: string
          email: string
          id?: string
          name: string
          page_url?: string | null
          player_id?: string | null
          player_name?: string | null
          screenshot_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          email?: string
          id?: string
          name?: string
          page_url?: string | null
          player_id?: string | null
          player_name?: string | null
          screenshot_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bugs_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      card_game_rankings: {
        Row: {
          average_game_duration: number
          created_at: string
          current_streak: number
          difficulty_level: string
          favorite_element_type: string | null
          games_lost: number
          games_won: number
          highest_score: number
          id: string
          last_played_at: string | null
          longest_streak: number
          player_name: string
          total_cards_played: number
          total_games: number
          total_score: number
          updated_at: string
          user_id: string | null
          win_rate: number
        }
        Insert: {
          average_game_duration?: number
          created_at?: string
          current_streak?: number
          difficulty_level?: string
          favorite_element_type?: string | null
          games_lost?: number
          games_won?: number
          highest_score?: number
          id?: string
          last_played_at?: string | null
          longest_streak?: number
          player_name: string
          total_cards_played?: number
          total_games?: number
          total_score?: number
          updated_at?: string
          user_id?: string | null
          win_rate?: number
        }
        Update: {
          average_game_duration?: number
          created_at?: string
          current_streak?: number
          difficulty_level?: string
          favorite_element_type?: string | null
          games_lost?: number
          games_won?: number
          highest_score?: number
          id?: string
          last_played_at?: string | null
          longest_streak?: number
          player_name?: string
          total_cards_played?: number
          total_games?: number
          total_score?: number
          updated_at?: string
          user_id?: string | null
          win_rate?: number
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          check_in_time: string
          check_out_time: string | null
          created_at: string
          id: string
          table_id: string
          user_id: string
        }
        Insert: {
          check_in_time?: string
          check_out_time?: string | null
          created_at?: string
          id?: string
          table_id: string
          user_id: string
        }
        Update: {
          check_in_time?: string
          check_out_time?: string | null
          created_at?: string
          id?: string
          table_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          description: string
          end_date: string
          id: string
          is_active: boolean | null
          reward_points: number | null
          start_date: string
          target_metric: string
          target_value: number
          title: string
        }
        Insert: {
          challenge_type: string
          created_at?: string
          description: string
          end_date: string
          id?: string
          is_active?: boolean | null
          reward_points?: number | null
          start_date: string
          target_metric: string
          target_value: number
          title: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean | null
          reward_points?: number | null
          start_date?: string
          target_metric?: string
          target_value?: number
          title?: string
        }
        Relationships: []
      }
      element_cards: {
        Row: {
          atomic_mass: number
          atomic_number: number
          created_at: string | null
          density: number | null
          description: string | null
          electronegativity: number | null
          element_type: string
          group_number: number | null
          id: string
          image_url: string | null
          is_super_trump: boolean | null
          knight_name: string
          melting_point: number | null
          name: string
          period_number: number | null
          radioactivity: number | null
          rarity: string
          reactivity: number | null
          special_ability: string | null
          symbol: string
          trump_weakness: string | null
          updated_at: string | null
        }
        Insert: {
          atomic_mass: number
          atomic_number: number
          created_at?: string | null
          density?: number | null
          description?: string | null
          electronegativity?: number | null
          element_type: string
          group_number?: number | null
          id?: string
          image_url?: string | null
          is_super_trump?: boolean | null
          knight_name: string
          melting_point?: number | null
          name: string
          period_number?: number | null
          radioactivity?: number | null
          rarity?: string
          reactivity?: number | null
          special_ability?: string | null
          symbol: string
          trump_weakness?: string | null
          updated_at?: string | null
        }
        Update: {
          atomic_mass?: number
          atomic_number?: number
          created_at?: string | null
          density?: number | null
          description?: string | null
          electronegativity?: number | null
          element_type?: string
          group_number?: number | null
          id?: string
          image_url?: string | null
          is_super_trump?: boolean | null
          knight_name?: string
          melting_point?: number | null
          name?: string
          period_number?: number | null
          radioactivity?: number | null
          rarity?: string
          reactivity?: number | null
          special_ability?: string | null
          symbol?: string
          trump_weakness?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      game_attempts: {
        Row: {
          attempt_number: number
          created_at: string
          guess: string
          id: string
          is_correct: boolean
          player_name: string
          target_player_id: string | null
          target_player_name: string
        }
        Insert: {
          attempt_number?: number
          created_at?: string
          guess: string
          id?: string
          is_correct?: boolean
          player_name: string
          target_player_id?: string | null
          target_player_name: string
        }
        Update: {
          attempt_number?: number
          created_at?: string
          guess?: string
          id?: string
          is_correct?: boolean
          player_name?: string
          target_player_id?: string | null
          target_player_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_attempts_target_player_id_fkey"
            columns: ["target_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          created_at: string
          id: string
          max_streak: number
          player_name: string
          total_attempts: number
          total_correct: number
        }
        Insert: {
          created_at?: string
          id?: string
          max_streak?: number
          player_name: string
          total_attempts?: number
          total_correct?: number
        }
        Update: {
          created_at?: string
          id?: string
          max_streak?: number
          player_name?: string
          total_attempts?: number
          total_correct?: number
        }
        Relationships: []
      }
      game_starts: {
        Row: {
          created_at: string
          game_mode: string | null
          id: string
          player_type: string
          session_id: string | null
          started_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          game_mode?: string | null
          id?: string
          player_type?: string
          session_id?: string | null
          started_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          game_mode?: string | null
          id?: string
          player_type?: string
          session_id?: string | null
          started_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      live_events: {
        Row: {
          created_at: string
          description: string
          end_time: string | null
          event_type: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          start_time: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          end_time?: string | null
          event_type: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          start_time: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          end_time?: string | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          start_time?: string
          title?: string
        }
        Relationships: []
      }
      live_stats: {
        Row: {
          id: string
          stat_key: string
          stat_value: number
          updated_at: string
        }
        Insert: {
          id?: string
          stat_key: string
          stat_value?: number
          updated_at?: string
        }
        Update: {
          id?: string
          stat_key?: string
          stat_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author_name: string
          category_id: string | null
          content: string
          created_at: string
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          published_at: string | null
          slug: string | null
          source: string | null
          summary: string | null
          title: string
          updated_at: string
          url: string | null
          views_count: number | null
        }
        Insert: {
          author_name?: string
          category_id?: string | null
          content: string
          created_at?: string
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          slug?: string | null
          source?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          url?: string | null
          views_count?: number | null
        }
        Update: {
          author_name?: string
          category_id?: string | null
          content?: string
          created_at?: string
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          slug?: string | null
          source?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          url?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "news_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      news_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      player_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          is_approved: boolean | null
          is_moderated: boolean | null
          player_id: string
          rating: number | null
          updated_at: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_moderated?: boolean | null
          player_id: string
          rating?: number | null
          updated_at?: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_moderated?: boolean | null
          player_id?: string
          rating?: number | null
          updated_at?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_comments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_difficulty_stats: {
        Row: {
          created_at: string
          device_type: string | null
          guess_time: number
          id: string
          is_correct: boolean
          player_id: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          guess_time: number
          id?: string
          is_correct?: boolean
          player_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          guess_time?: number
          id?: string
          is_correct?: boolean
          player_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_difficulty_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          achievements: string[] | null
          average_guess_time: number | null
          correct_attempts: number | null
          created_at: string
          decades: string[] | null
          difficulty_confidence: number | null
          difficulty_level: string | null
          difficulty_score: number | null
          fun_fact: string | null
          id: string
          image_url: string
          name: string
          nicknames: string[] | null
          position: string
          statistics: Json | null
          total_attempts: number | null
          year_highlight: string | null
        }
        Insert: {
          achievements?: string[] | null
          average_guess_time?: number | null
          correct_attempts?: number | null
          created_at?: string
          decades?: string[] | null
          difficulty_confidence?: number | null
          difficulty_level?: string | null
          difficulty_score?: number | null
          fun_fact?: string | null
          id?: string
          image_url: string
          name: string
          nicknames?: string[] | null
          position?: string
          statistics?: Json | null
          total_attempts?: number | null
          year_highlight?: string | null
        }
        Update: {
          achievements?: string[] | null
          average_guess_time?: number | null
          correct_attempts?: number | null
          created_at?: string
          decades?: string[] | null
          difficulty_confidence?: number | null
          difficulty_level?: string | null
          difficulty_score?: number | null
          fun_fact?: string | null
          id?: string
          image_url?: string
          name?: string
          nicknames?: string[] | null
          position?: string
          statistics?: Json | null
          total_attempts?: number | null
          year_highlight?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          experience: number | null
          full_name: string | null
          id: string
          level: number | null
          points: number | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          experience?: number | null
          full_name?: string | null
          id: string
          level?: number | null
          points?: number | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          experience?: number | null
          full_name?: string | null
          id?: string
          level?: number | null
          points?: number | null
          role?: string | null
        }
        Relationships: []
      }
      rankings: {
        Row: {
          created_at: string
          difficulty_level: string | null
          game_mode: string | null
          games_played: number
          id: string
          player_name: string
          score: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          difficulty_level?: string | null
          game_mode?: string | null
          games_played?: number
          id?: string
          player_name: string
          score?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          difficulty_level?: string | null
          game_mode?: string | null
          games_played?: number
          id?: string
          player_name?: string
          score?: number
          user_id?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          description: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description: string
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tables: {
        Row: {
          area_id: string
          created_at: string
          id: string
          is_occupied: boolean
          number: number
          occupied_by: string | null
          occupied_since: string | null
        }
        Insert: {
          area_id: string
          created_at?: string
          id?: string
          is_occupied?: boolean
          number: number
          occupied_by?: string | null
          occupied_since?: string | null
        }
        Update: {
          area_id?: string
          created_at?: string
          id?: string
          is_occupied?: boolean
          number?: number
          occupied_by?: string | null
          occupied_since?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tables_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tables_occupied_by_fkey"
            columns: ["occupied_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorials: {
        Row: {
          content: Json
          created_at: string
          description: string | null
          difficulty: string
          duration_minutes: number | null
          id: string
          is_required: boolean | null
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_minutes?: number | null
          id?: string
          is_required?: boolean | null
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_minutes?: number | null
          id?: string
          is_required?: boolean | null
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          max_progress: number | null
          progress: number | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          max_progress?: number | null
          progress?: number | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          max_progress?: number | null
          progress?: number | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_behavioral_metrics: {
        Row: {
          created_at: string
          id: string
          metrics_data: Json
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metrics_data?: Json
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metrics_data?: Json
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_behavioral_profiles: {
        Row: {
          average_session_duration: number | null
          churn_risk_score: number | null
          created_at: string
          engagement_level: string | null
          game_completion_rate: number | null
          help_seeking_frequency: number | null
          id: string
          learning_progression_score: number | null
          player_type_preferences: string[] | null
          preferred_play_times: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          average_session_duration?: number | null
          churn_risk_score?: number | null
          created_at?: string
          engagement_level?: string | null
          game_completion_rate?: number | null
          help_seeking_frequency?: number | null
          id?: string
          learning_progression_score?: number | null
          player_type_preferences?: string[] | null
          preferred_play_times?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          average_session_duration?: number | null
          churn_risk_score?: number | null
          created_at?: string
          engagement_level?: string | null
          game_completion_rate?: number | null
          help_seeking_frequency?: number | null
          id?: string
          learning_progression_score?: number | null
          player_type_preferences?: string[] | null
          preferred_play_times?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_cards: {
        Row: {
          card_id: string
          id: string
          obtained_at: string | null
          quantity: number | null
          user_id: string
        }
        Insert: {
          card_id: string
          id?: string
          obtained_at?: string | null
          quantity?: number | null
          user_id: string
        }
        Update: {
          card_id?: string
          id?: string
          obtained_at?: string | null
          quantity?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "element_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          current_progress: number | null
          id: string
          is_completed: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_customization: {
        Row: {
          avatar_style: string | null
          created_at: string
          id: string
          notification_preferences: Json | null
          theme_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_style?: string | null
          created_at?: string
          id?: string
          notification_preferences?: Json | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_style?: string | null
          created_at?: string
          id?: string
          notification_preferences?: Json | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_decks: {
        Row: {
          card_ids: string[]
          created_at: string
          id: string
          is_favorite: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_ids?: string[]
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_ids?: string[]
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          category: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          status: string
          updated_at: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          category?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          status?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          status?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_game_history: {
        Row: {
          correct_guesses: number
          created_at: string
          current_streak: number | null
          difficulty_level: string | null
          difficulty_multiplier: number | null
          game_duration: number | null
          game_mode: string | null
          id: string
          max_streak: number | null
          score: number
          time_taken: number | null
          total_attempts: number
          user_id: string
        }
        Insert: {
          correct_guesses?: number
          created_at?: string
          current_streak?: number | null
          difficulty_level?: string | null
          difficulty_multiplier?: number | null
          game_duration?: number | null
          game_mode?: string | null
          id?: string
          max_streak?: number | null
          score?: number
          time_taken?: number | null
          total_attempts?: number
          user_id: string
        }
        Update: {
          correct_guesses?: number
          created_at?: string
          current_streak?: number | null
          difficulty_level?: string | null
          difficulty_multiplier?: number | null
          game_duration?: number | null
          game_mode?: string | null
          id?: string
          max_streak?: number | null
          score?: number
          time_taken?: number | null
          total_attempts?: number
          user_id?: string
        }
        Relationships: []
      }
      user_notification_reads: {
        Row: {
          id: string
          notification_id: string
          read_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          notification_id: string
          read_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          notification_id?: string
          read_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "admin_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_pack_openings: {
        Row: {
          cards_obtained: Json
          created_at: string
          id: string
          opened_at: string
          pack_type: string
          user_id: string
        }
        Insert: {
          cards_obtained?: Json
          created_at?: string
          id?: string
          opened_at?: string
          pack_type: string
          user_id: string
        }
        Update: {
          cards_obtained?: Json
          created_at?: string
          id?: string
          opened_at?: string
          pack_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_tutorial_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: number | null
          id: string
          is_completed: boolean | null
          tutorial_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: number | null
          id?: string
          is_completed?: boolean | null
          tutorial_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: number | null
          id?: string
          is_completed?: boolean | null
          tutorial_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tutorial_progress_tutorial_id_fkey"
            columns: ["tutorial_id"]
            isOneToOne: false
            referencedRelation: "tutorials"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_user_open_pack: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      cleanup_expired_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_next_pack_opening_date: {
        Args: { user_uuid: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
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
