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
      carrier_case_analyses: {
        Row: {
          case_id: string
          created_at: string | null
          id: string
          key_exposures: string | null
          missing_information: string | null
          reasoning: string | null
          recommendation:
            | Database["public"]["Enums"]["carrier_case_recommendation"]
            | null
          suggested_price_structure: string | null
          underwriter_id: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          id?: string
          key_exposures?: string | null
          missing_information?: string | null
          reasoning?: string | null
          recommendation?:
            | Database["public"]["Enums"]["carrier_case_recommendation"]
            | null
          suggested_price_structure?: string | null
          underwriter_id: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          id?: string
          key_exposures?: string | null
          missing_information?: string | null
          reasoning?: string | null
          recommendation?:
            | Database["public"]["Enums"]["carrier_case_recommendation"]
            | null
          suggested_price_structure?: string | null
          underwriter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carrier_case_analyses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "carrier_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrier_case_analyses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "carrier_cases_underwriter_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrier_case_analyses_underwriter_id_fkey"
            columns: ["underwriter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carrier_cases: {
        Row: {
          assigned_underwriter_id: string | null
          batch_id: string | null
          carrier_id: string
          construction_type: string | null
          coverage_requested: string | null
          created_at: string | null
          exclusion_reason:
            | Database["public"]["Enums"]["carrier_case_exclusion_reason"]
            | null
          exposure_basis_type: string | null
          exposure_basis_value: number | null
          id: string
          line_of_business: string | null
          loss_history_summary: string | null
          named_insured: string
          protection_class: string | null
          status: Database["public"]["Enums"]["carrier_case_status"]
        }
        Insert: {
          assigned_underwriter_id?: string | null
          batch_id?: string | null
          carrier_id: string
          construction_type?: string | null
          coverage_requested?: string | null
          created_at?: string | null
          exclusion_reason?:
            | Database["public"]["Enums"]["carrier_case_exclusion_reason"]
            | null
          exposure_basis_type?: string | null
          exposure_basis_value?: number | null
          id?: string
          line_of_business?: string | null
          loss_history_summary?: string | null
          named_insured: string
          protection_class?: string | null
          status?: Database["public"]["Enums"]["carrier_case_status"]
        }
        Update: {
          assigned_underwriter_id?: string | null
          batch_id?: string | null
          carrier_id?: string
          construction_type?: string | null
          coverage_requested?: string | null
          created_at?: string | null
          exclusion_reason?:
            | Database["public"]["Enums"]["carrier_case_exclusion_reason"]
            | null
          exposure_basis_type?: string | null
          exposure_basis_value?: number | null
          id?: string
          line_of_business?: string | null
          loss_history_summary?: string | null
          named_insured?: string
          protection_class?: string | null
          status?: Database["public"]["Enums"]["carrier_case_status"]
        }
        Relationships: [
          {
            foreignKeyName: "carrier_cases_assigned_underwriter_id_fkey"
            columns: ["assigned_underwriter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrier_cases_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrier_cases_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
        ]
      }
      carrier_users: {
        Row: {
          auth_id: string | null
          carrier_id: string
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          auth_id?: string | null
          carrier_id: string
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          auth_id?: string | null
          carrier_id?: string
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carrier_users_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
        ]
      }
      carriers: {
        Row: {
          contact_email: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      dojo_cases: {
        Row: {
          additional_specialties: string[]
          closes_at: string | null
          code: string
          created_at: string
          created_by: string | null
          difficulty: number
          id: string
          key_factors: Json
          model_premium_high_cents: number
          model_premium_low_cents: number
          model_rationale: string
          model_recommendation: Database["public"]["Enums"]["dojo_recommendation"]
          model_red_flags: string[]
          packet: Json
          primary_specialty: string
          red_flag_options: string[]
          scenario: string
          slug: string
          status: Database["public"]["Enums"]["dojo_case_status"]
          summary: string
          time_limit_minutes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          additional_specialties?: string[]
          closes_at?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          difficulty: number
          id?: string
          key_factors?: Json
          model_premium_high_cents: number
          model_premium_low_cents: number
          model_rationale: string
          model_recommendation: Database["public"]["Enums"]["dojo_recommendation"]
          model_red_flags?: string[]
          packet?: Json
          primary_specialty: string
          red_flag_options?: string[]
          scenario: string
          slug: string
          status?: Database["public"]["Enums"]["dojo_case_status"]
          summary: string
          time_limit_minutes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          additional_specialties?: string[]
          closes_at?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          difficulty?: number
          id?: string
          key_factors?: Json
          model_premium_high_cents?: number
          model_premium_low_cents?: number
          model_rationale?: string
          model_recommendation?: Database["public"]["Enums"]["dojo_recommendation"]
          model_red_flags?: string[]
          packet?: Json
          primary_specialty?: string
          red_flag_options?: string[]
          scenario?: string
          slug?: string
          status?: Database["public"]["Enums"]["dojo_case_status"]
          summary?: string
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dojo_cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dojo_model_reviews: {
        Row: {
          composite_score: number | null
          divergence: Json | null
          factor_coverage_score: number | null
          generated_at: string
          id: string
          model_id: string
          model_version: string | null
          premium_calibration: string | null
          prompt_version: string
          reasoning_score: number | null
          red_flag_score: number | null
          submission_id: string
          summary: string
        }
        Insert: {
          composite_score?: number | null
          divergence?: Json | null
          factor_coverage_score?: number | null
          generated_at?: string
          id?: string
          model_id: string
          model_version?: string | null
          premium_calibration?: string | null
          prompt_version?: string
          reasoning_score?: number | null
          red_flag_score?: number | null
          submission_id: string
          summary: string
        }
        Update: {
          composite_score?: number | null
          divergence?: Json | null
          factor_coverage_score?: number | null
          generated_at?: string
          id?: string
          model_id?: string
          model_version?: string | null
          premium_calibration?: string | null
          prompt_version?: string
          reasoning_score?: number | null
          red_flag_score?: number | null
          submission_id?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "dojo_model_reviews_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "dojo_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      dojo_peer_reviews: {
        Row: {
          action: Database["public"]["Enums"]["dojo_peer_action"]
          bound_at: string
          composite_score: number | null
          created_at: string
          factor_coverage_score: number | null
          id: string
          note: string | null
          premium_calibration: string | null
          reasoning_score: number | null
          red_flag_score: number | null
          reviewer_id: string
          submission_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["dojo_peer_action"]
          bound_at?: string
          composite_score?: number | null
          created_at?: string
          factor_coverage_score?: number | null
          id?: string
          note?: string | null
          premium_calibration?: string | null
          reasoning_score?: number | null
          red_flag_score?: number | null
          reviewer_id: string
          submission_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["dojo_peer_action"]
          bound_at?: string
          composite_score?: number | null
          created_at?: string
          factor_coverage_score?: number | null
          id?: string
          note?: string | null
          premium_calibration?: string | null
          reasoning_score?: number | null
          red_flag_score?: number | null
          reviewer_id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dojo_peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dojo_peer_reviews_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "dojo_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      dojo_submissions: {
        Row: {
          bound_at: string | null
          case_id: string
          confidence: number
          created_at: string
          factors_score: number | null
          id: string
          matched_factors: string[]
          missed_factors: string[]
          peer_review_avg: number | null
          peer_review_count: number
          premium_cents: number
          premium_score: number | null
          rationale: string
          recommendation: Database["public"]["Enums"]["dojo_recommendation"]
          red_flags: string[]
          score: number | null
          status: Database["public"]["Enums"]["dojo_submission_status"]
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["dojo_submission_visibility"]
        }
        Insert: {
          bound_at?: string | null
          case_id: string
          confidence: number
          created_at?: string
          factors_score?: number | null
          id?: string
          matched_factors?: string[]
          missed_factors?: string[]
          peer_review_avg?: number | null
          peer_review_count?: number
          premium_cents: number
          premium_score?: number | null
          rationale: string
          recommendation: Database["public"]["Enums"]["dojo_recommendation"]
          red_flags?: string[]
          score?: number | null
          status?: Database["public"]["Enums"]["dojo_submission_status"]
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["dojo_submission_visibility"]
        }
        Update: {
          bound_at?: string | null
          case_id?: string
          confidence?: number
          created_at?: string
          factors_score?: number | null
          id?: string
          matched_factors?: string[]
          missed_factors?: string[]
          peer_review_avg?: number | null
          peer_review_count?: number
          premium_cents?: number
          premium_score?: number | null
          rationale?: string
          recommendation?: Database["public"]["Enums"]["dojo_recommendation"]
          red_flags?: string[]
          score?: number | null
          status?: Database["public"]["Enums"]["dojo_submission_status"]
          updated_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["dojo_submission_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "dojo_submissions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "dojo_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dojo_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dojo_waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          referrer: string | null
          role_hint: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          referrer?: string | null
          role_hint?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          referrer?: string | null
          role_hint?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      import_batches: {
        Row: {
          carrier_id: string
          created_at: string | null
          field_mapping: Json | null
          id: string
          imported_by: string | null
          raw_file_url: string | null
          source_format:
            | Database["public"]["Enums"]["carrier_import_format"]
            | null
          status: Database["public"]["Enums"]["carrier_batch_status"]
        }
        Insert: {
          carrier_id: string
          created_at?: string | null
          field_mapping?: Json | null
          id?: string
          imported_by?: string | null
          raw_file_url?: string | null
          source_format?:
            | Database["public"]["Enums"]["carrier_import_format"]
            | null
          status?: Database["public"]["Enums"]["carrier_batch_status"]
        }
        Update: {
          carrier_id?: string
          created_at?: string | null
          field_mapping?: Json | null
          id?: string
          imported_by?: string | null
          raw_file_url?: string | null
          source_format?:
            | Database["public"]["Enums"]["carrier_import_format"]
            | null
          status?: Database["public"]["Enums"]["carrier_batch_status"]
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_batches_imported_by_fkey"
            columns: ["imported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          acquisition_source: string | null
          additional_specialties: string[]
          budget_cents: number | null
          budget_type: Database["public"]["Enums"]["budget_type"]
          claimed_at: string | null
          claimed_by: string | null
          completed_at: string | null
          created_at: string
          deadline_at: string | null
          description: string
          difficulty: number
          engagement_tier: string
          estimated_hours: number | null
          find_bounty_cents: number | null
          id: string
          is_demo: boolean
          job_type: Database["public"]["Enums"]["job_type"]
          milestones: Json | null
          platform_fee_bps: number
          poster_id: string
          primary_specialty: string
          requester_type: Database["public"]["Enums"]["requester_type"] | null
          sla_hours: number | null
          status: Database["public"]["Enums"]["job_status"]
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          acquisition_source?: string | null
          additional_specialties?: string[]
          budget_cents?: number | null
          budget_type?: Database["public"]["Enums"]["budget_type"]
          claimed_at?: string | null
          claimed_by?: string | null
          completed_at?: string | null
          created_at?: string
          deadline_at?: string | null
          description: string
          difficulty?: number
          engagement_tier?: string
          estimated_hours?: number | null
          find_bounty_cents?: number | null
          id?: string
          is_demo?: boolean
          job_type: Database["public"]["Enums"]["job_type"]
          milestones?: Json | null
          platform_fee_bps?: number
          poster_id: string
          primary_specialty: string
          requester_type?: Database["public"]["Enums"]["requester_type"] | null
          sla_hours?: number | null
          status?: Database["public"]["Enums"]["job_status"]
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          acquisition_source?: string | null
          additional_specialties?: string[]
          budget_cents?: number | null
          budget_type?: Database["public"]["Enums"]["budget_type"]
          claimed_at?: string | null
          claimed_by?: string | null
          completed_at?: string | null
          created_at?: string
          deadline_at?: string | null
          description?: string
          difficulty?: number
          engagement_tier?: string
          estimated_hours?: number | null
          find_bounty_cents?: number | null
          id?: string
          is_demo?: boolean
          job_type?: Database["public"]["Enums"]["job_type"]
          milestones?: Json | null
          platform_fee_bps?: number
          poster_id?: string
          primary_specialty?: string
          requester_type?: Database["public"]["Enums"]["requester_type"] | null
          sla_hours?: number | null
          status?: Database["public"]["Enums"]["job_status"]
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_poster_id_fkey"
            columns: ["poster_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_config: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profile_accolades: {
        Row: {
          accolade_slug: string
          awarded_at: string
          awarded_by: string | null
          id: string
          metadata: Json | null
          profile_id: string
        }
        Insert: {
          accolade_slug: string
          awarded_at?: string
          awarded_by?: string | null
          id?: string
          metadata?: Json | null
          profile_id: string
        }
        Update: {
          accolade_slug?: string
          awarded_at?: string
          awarded_by?: string | null
          id?: string
          metadata?: Json | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_accolades_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_accolades_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_specialties: {
        Row: {
          created_at: string
          profile_id: string
          specialty_slug: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          specialty_slug: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          specialty_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_specialties_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          completed_job_count: number
          created_at: string
          display_name: string
          dojo_peer_review_avg_received: number | null
          dojo_peer_review_count_received: number
          handle: string
          id: string
          is_admin: boolean
          is_carrier_reviewer: boolean
          is_council: boolean
          is_cpcu: boolean
          is_verified: boolean
          linkedin_url: string | null
          location_city: string | null
          location_state: string | null
          rating: number
          rating_count: number
          role: Database["public"]["Enums"]["profile_role"]
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          completed_job_count?: number
          created_at?: string
          display_name: string
          dojo_peer_review_avg_received?: number | null
          dojo_peer_review_count_received?: number
          handle: string
          id: string
          is_admin?: boolean
          is_carrier_reviewer?: boolean
          is_council?: boolean
          is_cpcu?: boolean
          is_verified?: boolean
          linkedin_url?: string | null
          location_city?: string | null
          location_state?: string | null
          rating?: number
          rating_count?: number
          role?: Database["public"]["Enums"]["profile_role"]
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          completed_job_count?: number
          created_at?: string
          display_name?: string
          dojo_peer_review_avg_received?: number | null
          dojo_peer_review_count_received?: number
          handle?: string
          id?: string
          is_admin?: boolean
          is_carrier_reviewer?: boolean
          is_council?: boolean
          is_cpcu?: boolean
          is_verified?: boolean
          linkedin_url?: string | null
          location_city?: string | null
          location_state?: string | null
          rating?: number
          rating_count?: number
          role?: Database["public"]["Enums"]["profile_role"]
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number
          key: string
          updated_at: string
          window_start: string
        }
        Insert: {
          count?: number
          key: string
          updated_at?: string
          window_start?: string
        }
        Update: {
          count?: number
          key?: string
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      revenue_events: {
        Row: {
          acquisition_source: string | null
          created_at: string
          engagement_tier: string
          event_type: string
          gross_amount_cents: number | null
          id: string
          job_id: string | null
          notes: string | null
          platform_fee_bps: number | null
          platform_fee_cents: number | null
          requester_type: string | null
        }
        Insert: {
          acquisition_source?: string | null
          created_at?: string
          engagement_tier?: string
          event_type: string
          gross_amount_cents?: number | null
          id?: string
          job_id?: string | null
          notes?: string | null
          platform_fee_bps?: number | null
          platform_fee_cents?: number | null
          requester_type?: string | null
        }
        Update: {
          acquisition_source?: string | null
          created_at?: string
          engagement_tier?: string
          event_type?: string
          gross_amount_cents?: number | null
          id?: string
          job_id?: string | null
          notes?: string | null
          platform_fee_bps?: number | null
          platform_fee_cents?: number | null
          requester_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          job_id: string
          poster_id: string
          rating: number
          submission_id: string
          underwriter_id: string
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          job_id: string
          poster_id: string
          rating: number
          submission_id: string
          underwriter_id: string
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          job_id?: string
          poster_id?: string
          rating?: number
          submission_id?: string
          underwriter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_poster_id_fkey"
            columns: ["poster_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_underwriter_id_fkey"
            columns: ["underwriter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          confidence: number
          created_at: string
          id: string
          job_id: string
          rationale: string
          recommendation: Database["public"]["Enums"]["recommendation"]
          red_flags: string[]
          suggested_premium_cents: number | null
          suggested_terms: Json | null
          underwriter_id: string
          updated_at: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          id?: string
          job_id: string
          rationale: string
          recommendation: Database["public"]["Enums"]["recommendation"]
          red_flags?: string[]
          suggested_premium_cents?: number | null
          suggested_terms?: Json | null
          underwriter_id: string
          updated_at?: string
        }
        Update: {
          confidence?: number
          created_at?: string
          id?: string
          job_id?: string
          rationale?: string
          recommendation?: Database["public"]["Enums"]["recommendation"]
          red_flags?: string[]
          suggested_premium_cents?: number | null
          suggested_terms?: Json | null
          underwriter_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_underwriter_id_fkey"
            columns: ["underwriter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      carrier_cases_underwriter_view: {
        Row: {
          assigned_underwriter_id: string | null
          batch_id: string | null
          carrier_id: string | null
          construction_type: string | null
          coverage_requested: string | null
          created_at: string | null
          exclusion_reason:
            | Database["public"]["Enums"]["carrier_case_exclusion_reason"]
            | null
          exposure_basis_type: string | null
          exposure_basis_value: number | null
          id: string | null
          line_of_business: string | null
          loss_history_summary: string | null
          protection_class: string | null
          status: Database["public"]["Enums"]["carrier_case_status"] | null
        }
        Insert: {
          assigned_underwriter_id?: string | null
          batch_id?: string | null
          carrier_id?: string | null
          construction_type?: string | null
          coverage_requested?: string | null
          created_at?: string | null
          exclusion_reason?:
            | Database["public"]["Enums"]["carrier_case_exclusion_reason"]
            | null
          exposure_basis_type?: string | null
          exposure_basis_value?: number | null
          id?: string | null
          line_of_business?: string | null
          loss_history_summary?: string | null
          protection_class?: string | null
          status?: Database["public"]["Enums"]["carrier_case_status"] | null
        }
        Update: {
          assigned_underwriter_id?: string | null
          batch_id?: string | null
          carrier_id?: string | null
          construction_type?: string | null
          coverage_requested?: string | null
          created_at?: string | null
          exclusion_reason?:
            | Database["public"]["Enums"]["carrier_case_exclusion_reason"]
            | null
          exposure_basis_type?: string | null
          exposure_basis_value?: number | null
          id?: string | null
          line_of_business?: string | null
          loss_history_summary?: string | null
          protection_class?: string | null
          status?: Database["public"]["Enums"]["carrier_case_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "carrier_cases_assigned_underwriter_id_fkey"
            columns: ["assigned_underwriter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrier_cases_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrier_cases_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_rate_limit: {
        Args: { p_key: string; p_max_count: number; p_window_seconds: number }
        Returns: Json
      }
      prune_rate_limits: {
        Args: { p_older_than_seconds?: number }
        Returns: number
      }
    }
    Enums: {
      budget_type: "hourly" | "flat" | "volunteer" | "per_find" | "milestone"
      carrier_batch_status:
        | "pending"
        | "mapping"
        | "imported"
        | "ready_for_review"
      carrier_case_exclusion_reason:
        | "non_response"
        | "ai_declined"
        | "pricing_dispute"
        | "other"
      carrier_case_recommendation:
        | "write"
        | "decline"
        | "write_with_modifications"
      carrier_case_status: "new" | "in_review" | "completed"
      carrier_import_format: "csv" | "xlsx" | "pdf" | "manual"
      dojo_case_status: "draft" | "published" | "closed"
      dojo_peer_action: "cosign" | "refer" | "decline"
      dojo_recommendation:
        | "approve"
        | "decline"
        | "quote_with_modifications"
        | "needs_more_info"
      dojo_submission_status: "draft" | "bound"
      dojo_submission_visibility: "private" | "network"
      job_status: "open" | "claimed" | "submitted" | "completed" | "cancelled"
      job_type:
        | "renewal_review"
        | "second_look"
        | "new_business_advisory"
        | "audit"
        | "program_design"
        | "other"
        | "pre_broker_consult"
        | "coverage_dispute"
        | "ai_benchmark"
        | "pricing_review"
        | "risk_assessment"
        | "portfolio_audit"
      notification_type:
        | "new_matching_job"
        | "claim_confirmed"
        | "submission_received"
        | "review_received"
        | "job_completed"
      profile_role: "underwriter" | "poster" | "both"
      recommendation:
        | "approve"
        | "decline"
        | "quote_with_modifications"
        | "needs_more_info"
      requester_type:
        | "carrier"
        | "mga"
        | "reinsurer"
        | "broker"
        | "agent"
        | "risk_manager"
        | "insured_commercial"
        | "insured_personal"
        | "tech_ai"
        | "other"
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
      budget_type: ["hourly", "flat", "volunteer", "per_find", "milestone"],
      carrier_batch_status: [
        "pending",
        "mapping",
        "imported",
        "ready_for_review",
      ],
      carrier_case_exclusion_reason: [
        "non_response",
        "ai_declined",
        "pricing_dispute",
        "other",
      ],
      carrier_case_recommendation: [
        "write",
        "decline",
        "write_with_modifications",
      ],
      carrier_case_status: ["new", "in_review", "completed"],
      carrier_import_format: ["csv", "xlsx", "pdf", "manual"],
      dojo_case_status: ["draft", "published", "closed"],
      dojo_peer_action: ["cosign", "refer", "decline"],
      dojo_recommendation: [
        "approve",
        "decline",
        "quote_with_modifications",
        "needs_more_info",
      ],
      dojo_submission_status: ["draft", "bound"],
      dojo_submission_visibility: ["private", "network"],
      job_status: ["open", "claimed", "submitted", "completed", "cancelled"],
      job_type: [
        "renewal_review",
        "second_look",
        "new_business_advisory",
        "audit",
        "program_design",
        "other",
        "pre_broker_consult",
        "coverage_dispute",
        "ai_benchmark",
        "pricing_review",
        "risk_assessment",
        "portfolio_audit",
      ],
      notification_type: [
        "new_matching_job",
        "claim_confirmed",
        "submission_received",
        "review_received",
        "job_completed",
      ],
      profile_role: ["underwriter", "poster", "both"],
      recommendation: [
        "approve",
        "decline",
        "quote_with_modifications",
        "needs_more_info",
      ],
      requester_type: [
        "carrier",
        "mga",
        "reinsurer",
        "broker",
        "agent",
        "risk_manager",
        "insured_commercial",
        "insured_personal",
        "tech_ai",
        "other",
      ],
    },
  },
} as const

