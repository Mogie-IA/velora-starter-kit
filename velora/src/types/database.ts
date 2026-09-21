export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          primary_wallet_address: string | null;
          display_name: string | null;
          avatar_url: string | null;
          email: string | null;
          is_merchant: boolean;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          primary_wallet_address?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          is_merchant?: boolean;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          primary_wallet_address?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          is_merchant?: boolean;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      wallets: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          address: string;
          wallet_type: string;
          is_primary: boolean;
          last_connected_at: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          address: string;
          wallet_type?: string;
          is_primary?: boolean;
          last_connected_at?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          address?: string;
          wallet_type?: string;
          is_primary?: boolean;
          last_connected_at?: string | null;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      merchants: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          wallet_address: string;
          business_name: string;
          business_description: string | null;
          logo_url: string | null;
          website_url: string | null;
          is_verified: boolean;
          is_active: boolean;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          wallet_address: string;
          business_name: string;
          business_description?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          wallet_address?: string;
          business_name?: string;
          business_description?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "merchants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      merchant_profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          wallet_address: string;
          business_name: string;
          display_name: string | null;
          logo_url: string | null;
          website: string | null;
          description: string | null;
          support_email: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          wallet_address: string;
          business_name: string;
          display_name?: string | null;
          logo_url?: string | null;
          website?: string | null;
          description?: string | null;
          support_email?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          wallet_address?: string;
          business_name?: string;
          display_name?: string | null;
          logo_url?: string | null;
          website?: string | null;
          description?: string | null;
          support_email?: string | null;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      consumers: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          wallet_address: string;
          display_name: string | null;
          is_active: boolean;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          wallet_address: string;
          display_name?: string | null;
          is_active?: boolean;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          wallet_address?: string;
          display_name?: string | null;
          is_active?: boolean;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "consumers_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          merchant_id: string;
          name: string;
          description: string | null;
          price_lamports: number;
          currency: string;
          image_url: string | null;
          is_active: boolean;
          product_type: "one_time" | "subscription";
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          merchant_id: string;
          name: string;
          description?: string | null;
          price_lamports: number;
          currency?: string;
          image_url?: string | null;
          is_active?: boolean;
          product_type?: "one_time" | "subscription";
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          merchant_id?: string;
          name?: string;
          description?: string | null;
          price_lamports?: number;
          currency?: string;
          image_url?: string | null;
          is_active?: boolean;
          product_type?: "one_time" | "subscription";
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_merchant_id_fkey";
            columns: ["merchant_id"];
            isOneToOne: false;
            referencedRelation: "merchants";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_links: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          slug: string;
          merchant_user_id: string | null;
          merchant_wallet: string;
          merchant_name: string;
          title: string;
          description: string | null;
          amount: number;
          currency: "SOL" | "USDC";
          customer_contact: string | null;
          status: "draft" | "active" | "paid" | "expired";
          expires_at: string | null;
          network: string;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          slug: string;
          merchant_user_id?: string | null;
          merchant_wallet: string;
          merchant_name: string;
          title: string;
          description?: string | null;
          amount: number;
          currency?: "SOL" | "USDC";
          customer_contact?: string | null;
          status?: "draft" | "active" | "paid" | "expired";
          expires_at?: string | null;
          network?: string;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          slug?: string;
          merchant_user_id?: string | null;
          merchant_wallet?: string;
          merchant_name?: string;
          title?: string;
          description?: string | null;
          amount?: number;
          currency?: "SOL" | "USDC";
          customer_contact?: string | null;
          status?: "draft" | "active" | "paid" | "expired";
          expires_at?: string | null;
          network?: string;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          payment_link_id: string;
          payer_wallet: string;
          amount: number;
          currency: string;
          status: "pending" | "confirmed" | "failed";
          network: string;
          tx_signature: string | null;
          confirmed_at: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          payment_link_id: string;
          payer_wallet: string;
          amount: number;
          currency: string;
          status?: "pending" | "confirmed" | "failed";
          network?: string;
          tx_signature?: string | null;
          confirmed_at?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          payment_link_id?: string;
          payer_wallet?: string;
          amount?: number;
          currency?: string;
          status?: "pending" | "confirmed" | "failed";
          network?: string;
          tx_signature?: string | null;
          confirmed_at?: string | null;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_payment_link_id_fkey";
            columns: ["payment_link_id"];
            isOneToOne: false;
            referencedRelation: "payment_links";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          payment_id: string | null;
          payment_link_id: string | null;
          merchant_id: string | null;
          merchant_wallet: string | null;
          consumer_wallet_address: string | null;
          product_id: string | null;
          subscription_id: string | null;
          amount_lamports: number | null;
          currency: string;
          status: "pending" | "confirmed" | "failed" | "refunded";
          transaction_type: "payment" | "subscription" | "refund";
          solana_signature: string | null;
          block_time: string | null;
          slot: number | null;
          network: string;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          payment_id?: string | null;
          payment_link_id?: string | null;
          merchant_id?: string | null;
          merchant_wallet?: string | null;
          consumer_wallet_address?: string | null;
          product_id?: string | null;
          subscription_id?: string | null;
          amount_lamports?: number | null;
          currency?: string;
          status?: "pending" | "confirmed" | "failed" | "refunded";
          transaction_type?: "payment" | "subscription" | "refund";
          solana_signature?: string | null;
          block_time?: string | null;
          slot?: number | null;
          network?: string;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          payment_id?: string | null;
          payment_link_id?: string | null;
          merchant_id?: string | null;
          merchant_wallet?: string | null;
          consumer_wallet_address?: string | null;
          product_id?: string | null;
          subscription_id?: string | null;
          amount_lamports?: number | null;
          currency?: string;
          status?: "pending" | "confirmed" | "failed" | "refunded";
          transaction_type?: "payment" | "subscription" | "refund";
          solana_signature?: string | null;
          block_time?: string | null;
          slot?: number | null;
          network?: string;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_payment_link_id_fkey";
            columns: ["payment_link_id"];
            isOneToOne: false;
            referencedRelation: "payment_links";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          merchant_id: string;
          consumer_wallet_address: string;
          product_id: string;
          status: "active" | "paused" | "cancelled" | "expired";
          interval: "daily" | "weekly" | "monthly" | "yearly";
          interval_count: number;
          amount_lamports: number;
          currency: string;
          current_period_start: string;
          current_period_end: string;
          next_billing_date: string | null;
          cancelled_at: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          merchant_id: string;
          consumer_wallet_address: string;
          product_id: string;
          status?: "active" | "paused" | "cancelled" | "expired";
          interval: "daily" | "weekly" | "monthly" | "yearly";
          interval_count?: number;
          amount_lamports: number;
          currency?: string;
          current_period_start: string;
          current_period_end: string;
          next_billing_date?: string | null;
          cancelled_at?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          merchant_id?: string;
          consumer_wallet_address?: string;
          product_id?: string;
          status?: "active" | "paused" | "cancelled" | "expired";
          interval?: "daily" | "weekly" | "monthly" | "yearly";
          interval_count?: number;
          amount_lamports?: number;
          currency?: string;
          current_period_start?: string;
          current_period_end?: string;
          next_billing_date?: string | null;
          cancelled_at?: string | null;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_merchant_id_fkey";
            columns: ["merchant_id"];
            isOneToOne: false;
            referencedRelation: "merchants";
            referencedColumns: ["id"];
          },
        ];
      };
      marketplace_profiles: {
        Row: {
          id: string;
          wallet_address: string;
          role: string;
          display_name: string;
          email: string | null;
          phone: string | null;
          country: string;
          city: string | null;
          avatar_url: string | null;
          bio: string | null;
          company_name: string | null;
          years_experience: number | null;
          specialties: string[] | null;
          qualification: string | null;
          license_number: string | null;
          service_areas: string[] | null;
          verification_status: string;
          jobs_completed: number;
          disputes_raised: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          role: string;
          display_name: string;
          email?: string | null;
          phone?: string | null;
          country?: string;
          city?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          company_name?: string | null;
          years_experience?: number | null;
          specialties?: string[] | null;
          qualification?: string | null;
          license_number?: string | null;
          service_areas?: string[] | null;
          verification_status?: string;
          jobs_completed?: number;
          disputes_raised?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          role?: string;
          display_name?: string;
          email?: string | null;
          phone?: string | null;
          country?: string;
          city?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          company_name?: string | null;
          years_experience?: number | null;
          specialties?: string[] | null;
          qualification?: string | null;
          license_number?: string | null;
          service_areas?: string[] | null;
          verification_status?: string;
          jobs_completed?: number;
          disputes_raised?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          client_wallet: string;
          title: string;
          description: string;
          location_city: string;
          location_state: string | null;
          country: string;
          budget_min_usd: number | null;
          budget_max_usd: number | null;
          expected_milestones: number;
          status: string;
          bids_close_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_wallet: string;
          title: string;
          description: string;
          location_city: string;
          location_state?: string | null;
          country?: string;
          budget_min_usd?: number | null;
          budget_max_usd?: number | null;
          expected_milestones?: number;
          status?: string;
          bids_close_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_wallet?: string;
          title?: string;
          description?: string;
          location_city?: string;
          location_state?: string | null;
          country?: string;
          budget_min_usd?: number | null;
          budget_max_usd?: number | null;
          expected_milestones?: number;
          status?: string;
          bids_close_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bids: {
        Row: {
          id: string;
          job_id: string;
          contractor_wallet: string;
          amount_usd: number;
          timeline_days: number;
          proposal: string;
          proposed_milestones: Json;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          contractor_wallet: string;
          amount_usd: number;
          timeline_days: number;
          proposal: string;
          proposed_milestones?: Json;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          contractor_wallet?: string;
          amount_usd?: number;
          timeline_days?: number;
          proposal?: string;
          proposed_milestones?: Json;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      construction_projects: {
        Row: {
          id: string;
          job_id: string | null;
          bid_id: string | null;
          client_wallet: string;
          contractor_wallet: string;
          inspector_wallet: string | null;
          title: string;
          location_city: string;
          country: string;
          onchain_project_id: string | null;
          onchain_project_pda: string | null;
          onchain_vault_ata: string | null;
          mint: string | null;
          total_amount_usd: number;
          inspection_fee_usd: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id?: string | null;
          bid_id?: string | null;
          client_wallet: string;
          contractor_wallet: string;
          inspector_wallet?: string | null;
          title: string;
          location_city: string;
          country?: string;
          onchain_project_id?: string | null;
          onchain_project_pda?: string | null;
          onchain_vault_ata?: string | null;
          mint?: string | null;
          total_amount_usd: number;
          inspection_fee_usd?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string | null;
          bid_id?: string | null;
          client_wallet?: string;
          contractor_wallet?: string;
          inspector_wallet?: string | null;
          title?: string;
          location_city?: string;
          country?: string;
          onchain_project_id?: string | null;
          onchain_project_pda?: string | null;
          onchain_vault_ata?: string | null;
          mint?: string | null;
          total_amount_usd?: number;
          inspection_fee_usd?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      construction_milestones: {
        Row: {
          id: string;
          project_id: string;
          index: number;
          title: string;
          description: string | null;
          amount_usd: number;
          inspection_fee_usd: number;
          status: string;
          inspector_approved: boolean;
          client_approved: boolean;
          evidence_uri: string | null;
          funded_tx: string | null;
          submitted_tx: string | null;
          inspector_approved_tx: string | null;
          released_tx: string | null;
          refunded_tx: string | null;
          funded_at: string | null;
          submitted_at: string | null;
          released_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          index: number;
          title: string;
          description?: string | null;
          amount_usd: number;
          inspection_fee_usd?: number;
          status?: string;
          inspector_approved?: boolean;
          client_approved?: boolean;
          evidence_uri?: string | null;
          funded_tx?: string | null;
          submitted_tx?: string | null;
          inspector_approved_tx?: string | null;
          released_tx?: string | null;
          refunded_tx?: string | null;
          funded_at?: string | null;
          submitted_at?: string | null;
          released_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          index?: number;
          title?: string;
          description?: string | null;
          amount_usd?: number;
          inspection_fee_usd?: number;
          status?: string;
          inspector_approved?: boolean;
          client_approved?: boolean;
          evidence_uri?: string | null;
          funded_tx?: string | null;
          submitted_tx?: string | null;
          inspector_approved_tx?: string | null;
          released_tx?: string | null;
          refunded_tx?: string | null;
          funded_at?: string | null;
          submitted_at?: string | null;
          released_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      milestone_evidence: {
        Row: {
          id: string;
          milestone_id: string;
          uploaded_by_wallet: string;
          uploader_role: string;
          file_url: string;
          file_type: string;
          caption: string | null;
          captured_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          milestone_id: string;
          uploaded_by_wallet: string;
          uploader_role: string;
          file_url: string;
          file_type?: string;
          caption?: string | null;
          captured_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          milestone_id?: string;
          uploaded_by_wallet?: string;
          uploader_role?: string;
          file_url?: string;
          file_type?: string;
          caption?: string | null;
          captured_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      inspector_assignments: {
        Row: {
          id: string;
          project_id: string;
          inspector_wallet: string;
          fee_usd: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          inspector_wallet: string;
          fee_usd?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          inspector_wallet?: string;
          fee_usd?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      transaction_status: "pending" | "confirmed" | "failed" | "refunded";
      transaction_type: "payment" | "subscription" | "refund";
      subscription_status: "active" | "paused" | "cancelled" | "expired";
      subscription_interval: "daily" | "weekly" | "monthly" | "yearly";
      product_type: "one_time" | "subscription";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
