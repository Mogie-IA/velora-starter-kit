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
