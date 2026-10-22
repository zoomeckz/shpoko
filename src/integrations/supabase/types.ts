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
      account_access: {
        Row: {
          created_at: string
          disabled: boolean
          expires_at: string | null
          managed: boolean
          note: string | null
          unlock_all: boolean
          units: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          disabled?: boolean
          expires_at?: string | null
          managed?: boolean
          note?: string | null
          unlock_all?: boolean
          units?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          disabled?: boolean
          expires_at?: string | null
          managed?: boolean
          note?: string | null
          unlock_all?: boolean
          units?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audio_cache: {
        Row: {
          audio_base64: string
          created_at: string
          id: string
          language: string
          text_content: string
          text_hash: string
          voice: string
        }
        Insert: {
          audio_base64: string
          created_at?: string
          id?: string
          language?: string
          text_content: string
          text_hash: string
          voice?: string
        }
        Update: {
          audio_base64?: string
          created_at?: string
          id?: string
          language?: string
          text_content?: string
          text_hash?: string
          voice?: string
        }
        Relationships: []
      }
      deep_dive_progress: {
        Row: {
          badge_earned: string | null
          completed_at: string
          created_at: string
          deep_dive_id: string
          id: string
          lesson_id: string
          skin_earned: string | null
          user_id: string
          xp_earned: number
        }
        Insert: {
          badge_earned?: string | null
          completed_at?: string
          created_at?: string
          deep_dive_id: string
          id?: string
          lesson_id: string
          skin_earned?: string | null
          user_id: string
          xp_earned?: number
        }
        Update: {
          badge_earned?: string | null
          completed_at?: string
          created_at?: string
          deep_dive_id?: string
          id?: string
          lesson_id?: string
          skin_earned?: string | null
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      flashcard_decks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_lesson_based: boolean
          is_public: boolean
          lesson_ids: string[] | null
          source_language: string
          target_language: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_lesson_based?: boolean
          is_public?: boolean
          lesson_ids?: string[] | null
          source_language?: string
          target_language?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_lesson_based?: boolean
          is_public?: boolean
          lesson_ids?: string[] | null
          source_language?: string
          target_language?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          back_text: string
          created_at: string
          deck_id: string
          front_text: string
          id: string
          last_reviewed_at: string | null
          pronunciation: string | null
          times_correct: number
          times_reviewed: number
          updated_at: string
        }
        Insert: {
          back_text: string
          created_at?: string
          deck_id: string
          front_text: string
          id?: string
          last_reviewed_at?: string | null
          pronunciation?: string | null
          times_correct?: number
          times_reviewed?: number
          updated_at?: string
        }
        Update: {
          back_text?: string
          created_at?: string
          deck_id?: string
          front_text?: string
          id?: string
          last_reviewed_at?: string | null
          pronunciation?: string | null
          times_correct?: number
          times_reviewed?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          language: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          language?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          language?: string
          name?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_solution: boolean
          thread_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_solution?: boolean
          thread_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_solution?: boolean
          thread_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads: {
        Row: {
          category_id: string
          content: string
          created_at: string
          id: string
          is_locked: boolean
          is_pinned: boolean
          last_reply_at: string | null
          last_reply_user_id: string | null
          reply_count: number
          title: string
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          category_id: string
          content: string
          created_at?: string
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          last_reply_at?: string | null
          last_reply_user_id?: string | null
          reply_count?: number
          title: string
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          category_id?: string
          content?: string
          created_at?: string
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          last_reply_at?: string | null
          last_reply_user_id?: string | null
          reply_count?: number
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_votes: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          thread_id: string | null
          user_id: string
          vote_type: number
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          thread_id?: string | null
          user_id: string
          vote_type: number
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          thread_id?: string | null
          user_id?: string
          vote_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_votes_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string
          read: boolean
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string
          read?: boolean
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      game_attempts: {
        Row: {
          created_at: string
          high_score: number
          id: string
          last_played_at: string
          total_games: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          high_score?: number
          id?: string
          last_played_at?: string
          total_games?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          high_score?: number
          id?: string
          last_played_at?: string
          total_games?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hall_of_fame: {
        Row: {
          created_at: string
          id: string
          month_year: string
          place: number
          stars: number
          user_id: string
          xp_at_win: number
        }
        Insert: {
          created_at?: string
          id?: string
          month_year: string
          place: number
          stars?: number
          user_id: string
          xp_at_win?: number
        }
        Update: {
          created_at?: string
          id?: string
          month_year?: string
          place?: number
          stars?: number
          user_id?: string
          xp_at_win?: number
        }
        Relationships: []
      }
      leagues: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          min_xp_to_promote: number
          name: string
          tier: number
        }
        Insert: {
          color: string
          created_at?: string
          icon: string
          id?: string
          min_xp_to_promote?: number
          name: string
          tier: number
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          min_xp_to_promote?: number
          name?: string
          tier?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_premium: boolean
          last_activity_date: string | null
          last_username_change: string | null
          level: number
          premium_until: string | null
          profile_picture: string | null
          streak: number
          streak_freeze_used_at: string | null
          streak_freezes: number
          updated_at: string
          username: string
          username_set: boolean
          xp: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          is_premium?: boolean
          last_activity_date?: string | null
          last_username_change?: string | null
          level?: number
          premium_until?: string | null
          profile_picture?: string | null
          streak?: number
          streak_freeze_used_at?: string | null
          streak_freezes?: number
          updated_at?: string
          username: string
          username_set?: boolean
          xp?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_premium?: boolean
          last_activity_date?: string | null
          last_username_change?: string | null
          level?: number
          premium_until?: string | null
          profile_picture?: string | null
          streak?: number
          streak_freeze_used_at?: string | null
          streak_freezes?: number
          updated_at?: string
          username?: string
          username_set?: boolean
          xp?: number
        }
        Relationships: []
      }
      quests: {
        Row: {
          action_type: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          target_count: number
          title: string
          type: string
          xp_reward: number
        }
        Insert: {
          action_type: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          target_count?: number
          title: string
          type: string
          xp_reward?: number
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          target_count?: number
          title?: string
          type?: string
          xp_reward?: number
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          completed_at: string
          id: string
          quiz_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          quiz_id: string
          score?: number
          total_questions?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          quiz_id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          quiz_id: string
          rating: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          quiz_id: string
          rating?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          quiz_id?: string
          rating?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_feedback_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          id: string
          options: string[] | null
          order_index: number
          question_text: string
          question_type: Database["public"]["Enums"]["quiz_question_type"]
          quiz_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          id?: string
          options?: string[] | null
          order_index?: number
          question_text: string
          question_type?: Database["public"]["Enums"]["quiz_question_type"]
          quiz_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          id?: string
          options?: string[] | null
          order_index?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["quiz_question_type"]
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          category: string | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          is_public: boolean
          is_timed: boolean
          language: string
          time_limit_seconds: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          is_public?: boolean
          is_timed?: boolean
          language?: string
          time_limit_seconds?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          is_public?: boolean
          is_timed?: boolean
          language?: string
          time_limit_seconds?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      skin_trades: {
        Row: {
          created_at: string
          id: string
          message: string | null
          recipient_id: string
          recipient_skin_id: string | null
          responded_at: string | null
          sender_id: string
          sender_skin_id: string | null
          status: string
          trade_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          recipient_id: string
          recipient_skin_id?: string | null
          responded_at?: string | null
          sender_id: string
          sender_skin_id?: string | null
          status?: string
          trade_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          recipient_id?: string
          recipient_skin_id?: string | null
          responded_at?: string | null
          sender_id?: string
          sender_skin_id?: string | null
          status?: string
          trade_type?: string
        }
        Relationships: []
      }
      streak_freeze_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          transaction_type: string
          user_id: string
          xp_cost: number | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          transaction_type: string
          user_id: string
          xp_cost?: number | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          transaction_type?: string
          user_id?: string
          xp_cost?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          source: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          source?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      user_leagues: {
        Row: {
          created_at: string
          demoted: boolean | null
          id: string
          league_id: string
          position: number | null
          promoted: boolean | null
          user_id: string
          week_start: string
          week_xp: number
        }
        Insert: {
          created_at?: string
          demoted?: boolean | null
          id?: string
          league_id: string
          position?: number | null
          promoted?: boolean | null
          user_id: string
          week_start: string
          week_xp?: number
        }
        Update: {
          created_at?: string
          demoted?: boolean | null
          id?: string
          league_id?: string
          position?: number | null
          promoted?: boolean | null
          user_id?: string
          week_start?: string
          week_xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_leagues_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          correct_answers: number
          created_at: string
          id: string
          lesson_id: string
          score: number
          total_answers: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          correct_answers?: number
          created_at?: string
          id?: string
          lesson_id: string
          score?: number
          total_answers?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          correct_answers?: number
          created_at?: string
          id?: string
          lesson_id?: string
          score?: number
          total_answers?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_quests: {
        Row: {
          assigned_at: string
          completed: boolean
          completed_at: string | null
          created_at: string
          current_count: number
          expires_at: string
          id: string
          quest_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_count?: number
          expires_at: string
          id?: string
          quest_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_count?: number
          expires_at?: string
          id?: string
          quest_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quests_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_skins: {
        Row: {
          acquired_at: string
          acquired_from: string | null
          equipped: boolean
          gifted_by: string | null
          id: string
          skin_id: string
          user_id: string
        }
        Insert: {
          acquired_at?: string
          acquired_from?: string | null
          equipped?: boolean
          gifted_by?: string | null
          id?: string
          skin_id: string
          user_id: string
        }
        Update: {
          acquired_at?: string
          acquired_from?: string | null
          equipped?: boolean
          gifted_by?: string | null
          id?: string
          skin_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_vocabulary: {
        Row: {
          created_at: string
          id: string
          last_reviewed_at: string | null
          next_review_at: string | null
          notes: string | null
          romanization: string | null
          status: number
          times_correct: number
          times_seen: number
          translation: string | null
          updated_at: string
          user_id: string
          word: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          next_review_at?: string | null
          notes?: string | null
          romanization?: string | null
          status?: number
          times_correct?: number
          times_seen?: number
          translation?: string | null
          updated_at?: string
          user_id: string
          word: string
        }
        Update: {
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          next_review_at?: string | null
          notes?: string | null
          romanization?: string | null
          status?: number
          times_correct?: number
          times_seen?: number
          translation?: string | null
          updated_at?: string
          user_id?: string
          word?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_leaderboard: {
        Args: { limit_count?: number }
        Returns: {
          id: string
          is_premium: boolean
          level: number
          profile_picture: string
          streak: number
          username: string
          xp: number
        }[]
      }
      get_weekly_top_quiz: {
        Args: never
        Returns: {
          avg_rating: number
          creator_id: string
          quiz_id: string
          quiz_title: string
          rating_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "premium"
      quiz_question_type: "choose_word" | "fill_blank"
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
  public: {
    Enums: {
      app_role: ["admin", "user", "premium"],
      quiz_question_type: ["choose_word", "fill_blank"],
    },
  },
} as const
