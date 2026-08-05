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
      abandoned_cart_events: {
        Row: {
          cart_id: string | null
          channel: string | null
          created_at: string
          detail: string | null
          event_type: string
          id: string
          value_usd: number
        }
        Insert: {
          cart_id?: string | null
          channel?: string | null
          created_at?: string
          detail?: string | null
          event_type: string
          id?: string
          value_usd?: number
        }
        Update: {
          cart_id?: string | null
          channel?: string | null
          created_at?: string
          detail?: string | null
          event_type?: string
          id?: string
          value_usd?: number
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_cart_events_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "abandoned_carts"
            referencedColumns: ["id"]
          },
        ]
      }
      abandoned_carts: {
        Row: {
          admin_notes: string | null
          created_at: string
          customer_name: string | null
          email: string | null
          id: string
          items: Json
          last_reminder_at: string | null
          last_seen_at: string
          phone: string | null
          recovered: boolean
          recovered_order_id: string | null
          recovery_sent_at: string | null
          recovery_sent_count: number
          reminder_stage: number
          subtotal_usd: number
          updated_at: string
          user_id: string | null
          webhook_last_status: string | null
          webhook_synced_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          customer_name?: string | null
          email?: string | null
          id?: string
          items?: Json
          last_reminder_at?: string | null
          last_seen_at?: string
          phone?: string | null
          recovered?: boolean
          recovered_order_id?: string | null
          recovery_sent_at?: string | null
          recovery_sent_count?: number
          reminder_stage?: number
          subtotal_usd?: number
          updated_at?: string
          user_id?: string | null
          webhook_last_status?: string | null
          webhook_synced_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          customer_name?: string | null
          email?: string | null
          id?: string
          items?: Json
          last_reminder_at?: string | null
          last_seen_at?: string
          phone?: string | null
          recovered?: boolean
          recovered_order_id?: string | null
          recovery_sent_at?: string | null
          recovery_sent_count?: number
          reminder_stage?: number
          subtotal_usd?: number
          updated_at?: string
          user_id?: string | null
          webhook_last_status?: string | null
          webhook_synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_carts_recovered_order_id_fkey"
            columns: ["recovered_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author: string
          body_markdown: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          meta_description: string | null
          published_date: string | null
          slug: string
          title: string
          updated_at: string
          updated_date: string | null
        }
        Insert: {
          author?: string
          body_markdown?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          published_date?: string | null
          slug: string
          title: string
          updated_at?: string
          updated_date?: string | null
        }
        Update: {
          author?: string
          body_markdown?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          published_date?: string | null
          slug?: string
          title?: string
          updated_at?: string
          updated_date?: string | null
        }
        Relationships: []
      }
      bundle_items: {
        Row: {
          bundle_id: string
          created_at: string | null
          id: string
          product_id: string
          quantity: number | null
        }
        Insert: {
          bundle_id: string
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number | null
        }
        Update: {
          bundle_id?: string
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          updated_at: string | null
          user_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string | null
          user_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          product_name: string | null
          session_id: string | null
          symptom: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          product_name?: string | null
          session_id?: string | null
          symptom?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          product_name?: string | null
          session_id?: string | null
          symptom?: string | null
        }
        Relationships: []
      }
      concierge_conversations: {
        Row: {
          created_at: string
          escalated: boolean
          escalation_reason: string | null
          id: string
          messages: Json
          session_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          escalated?: boolean
          escalation_reason?: string | null
          id?: string
          messages?: Json
          session_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          escalated?: boolean
          escalation_reason?: string | null
          id?: string
          messages?: Json
          session_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concierge_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          discount_usd: number
          email: string | null
          id: string
          order_id: string | null
        }
        Insert: {
          coupon_id: string
          created_at?: string
          discount_usd?: number
          email?: string | null
          id?: string
          order_id?: string | null
        }
        Update: {
          coupon_id?: string
          created_at?: string
          discount_usd?: number
          email?: string | null
          id?: string
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          category_ids: string[]
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          max_uses_per_customer: number | null
          min_order_usd: number
          product_ids: string[]
          starts_at: string | null
          updated_at: string
          used_count: number
        }
        Insert: {
          category_ids?: string[]
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          max_uses_per_customer?: number | null
          min_order_usd?: number
          product_ids?: string[]
          starts_at?: string | null
          updated_at?: string
          used_count?: number
        }
        Update: {
          category_ids?: string[]
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          max_uses_per_customer?: number | null
          min_order_usd?: number
          product_ids?: string[]
          starts_at?: string | null
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          areas: string[]
          created_at: string | null
          delivery_time: string | null
          fee_usd: number
          fee_xcd: number
          id: string
          is_active: boolean | null
          name: string
          same_day_available: boolean | null
          same_day_cutoff: string | null
        }
        Insert: {
          areas: string[]
          created_at?: string | null
          delivery_time?: string | null
          fee_usd: number
          fee_xcd: number
          id?: string
          is_active?: boolean | null
          name: string
          same_day_available?: boolean | null
          same_day_cutoff?: string | null
        }
        Update: {
          areas?: string[]
          created_at?: string | null
          delivery_time?: string | null
          fee_usd?: number
          fee_xcd?: number
          id?: string
          is_active?: boolean | null
          name?: string
          same_day_available?: boolean | null
          same_day_cutoff?: string | null
        }
        Relationships: []
      }
      email_send_failures: {
        Row: {
          created_at: string
          email_type: string
          error_message: string
          id: string
          order_id: string | null
          recipient: string | null
        }
        Insert: {
          created_at?: string
          email_type: string
          error_message: string
          id?: string
          order_id?: string | null
          recipient?: string | null
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string
          id?: string
          order_id?: string | null
          recipient?: string | null
        }
        Relationships: []
      }
      failed_order_alerts: {
        Row: {
          amount_usd: number | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          error_message: string | null
          id: string
          payload: Json | null
          paypal_capture_id: string
          paypal_order_id: string | null
          resolved: boolean
        }
        Insert: {
          amount_usd?: number | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          error_message?: string | null
          id?: string
          payload?: Json | null
          paypal_capture_id: string
          paypal_order_id?: string | null
          resolved?: boolean
        }
        Update: {
          amount_usd?: number | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          error_message?: string | null
          id?: string
          payload?: Json | null
          paypal_capture_id?: string
          paypal_order_id?: string | null
          resolved?: boolean
        }
        Relationships: []
      }
      legacy_woocommerce_orders: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          currency: string | null
          email: string | null
          first_name: string | null
          items: string | null
          last_name: string | null
          order_date: string
          order_id: number
          order_total: number | null
          payment_method: string | null
          phone: string | null
          postcode: string | null
          state: string | null
          status: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          currency?: string | null
          email?: string | null
          first_name?: string | null
          items?: string | null
          last_name?: string | null
          order_date: string
          order_id: number
          order_total?: number | null
          payment_method?: string | null
          phone?: string | null
          postcode?: string | null
          state?: string | null
          status: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          currency?: string | null
          email?: string | null
          first_name?: string | null
          items?: string | null
          last_name?: string | null
          order_date?: string
          order_id?: number
          order_total?: number | null
          payment_method?: string | null
          phone?: string | null
          postcode?: string | null
          state?: string | null
          status?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          related_order_id: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          related_order_id?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          related_order_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price_usd: number
          price_xcd: number
          product_id: string
          product_name: string
          quantity: number
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price_usd: number
          price_xcd: number
          product_id: string
          product_name: string
          quantity: number
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price_usd?: number
          price_xcd?: number
          product_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_refunds: {
        Row: {
          admin_note: string | null
          amount_usd: number
          created_at: string
          created_by: string | null
          id: string
          kind: string
          order_id: string
          reason: string
          refund_transaction_id: string | null
          status: string
          transaction_id: string | null
        }
        Insert: {
          admin_note?: string | null
          amount_usd: number
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          order_id: string
          reason: string
          refund_transaction_id?: string | null
          status?: string
          transaction_id?: string | null
        }
        Update: {
          admin_note?: string | null
          amount_usd?: number
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          order_id?: string
          reason?: string
          refund_transaction_id?: string | null
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          notes: string | null
          order_id: string
          previous_status: string | null
          status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          previous_status?: string | null
          status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          previous_status?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_line1: string
          address_line2: string | null
          admin_notes: string | null
          city: string
          country: string
          coupon_code: string | null
          created_at: string | null
          currency_used: string
          customer_name: string
          customer_notes: string | null
          delivery_type: string
          delivery_zone_id: string | null
          discount_usd: number
          email: string
          fulfillment_status: string | null
          id: string
          is_test: boolean
          note: string | null
          order_number: string | null
          payment_method: string
          payment_status: string | null
          payment_transaction_id: string | null
          phone: string | null
          postal_code: string | null
          refunded_usd: number
          shipping_address: Json | null
          shipping_rate_id: string | null
          shipping_usd: number
          shipping_xcd: number
          state_province: string | null
          status: string | null
          subtotal_usd: number
          subtotal_xcd: number
          total_usd: number
          total_xcd: number
          tracking_carrier: string | null
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
          whatsapp_notes: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          admin_notes?: string | null
          city: string
          country?: string
          coupon_code?: string | null
          created_at?: string | null
          currency_used: string
          customer_name: string
          customer_notes?: string | null
          delivery_type: string
          delivery_zone_id?: string | null
          discount_usd?: number
          email: string
          fulfillment_status?: string | null
          id?: string
          is_test?: boolean
          note?: string | null
          order_number?: string | null
          payment_method: string
          payment_status?: string | null
          payment_transaction_id?: string | null
          phone?: string | null
          postal_code?: string | null
          refunded_usd?: number
          shipping_address?: Json | null
          shipping_rate_id?: string | null
          shipping_usd?: number
          shipping_xcd?: number
          state_province?: string | null
          status?: string | null
          subtotal_usd: number
          subtotal_xcd: number
          total_usd: number
          total_xcd: number
          tracking_carrier?: string | null
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_notes?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          admin_notes?: string | null
          city?: string
          country?: string
          coupon_code?: string | null
          created_at?: string | null
          currency_used?: string
          customer_name?: string
          customer_notes?: string | null
          delivery_type?: string
          delivery_zone_id?: string | null
          discount_usd?: number
          email?: string
          fulfillment_status?: string | null
          id?: string
          is_test?: boolean
          note?: string | null
          order_number?: string | null
          payment_method?: string
          payment_status?: string | null
          payment_transaction_id?: string | null
          phone?: string | null
          postal_code?: string | null
          refunded_usd?: number
          shipping_address?: Json | null
          shipping_rate_id?: string | null
          shipping_usd?: number
          shipping_xcd?: number
          state_province?: string | null
          status?: string | null
          subtotal_usd?: number
          subtotal_xcd?: number
          total_usd?: number
          total_xcd?: number
          tracking_carrier?: string | null
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipping_rate_id_fkey"
            columns: ["shipping_rate_id"]
            isOneToOne: false
            referencedRelation: "shipping_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_attempts: {
        Row: {
          cart_total_usd: number | null
          created_at: string
          customer_email: string | null
          error_message: string | null
          error_name: string | null
          id: string
          payload: Json | null
          paypal_debug_id: string | null
          paypal_order_id: string | null
          stage: string
          user_agent: string | null
        }
        Insert: {
          cart_total_usd?: number | null
          created_at?: string
          customer_email?: string | null
          error_message?: string | null
          error_name?: string | null
          id?: string
          payload?: Json | null
          paypal_debug_id?: string | null
          paypal_order_id?: string | null
          stage: string
          user_agent?: string | null
        }
        Update: {
          cart_total_usd?: number | null
          created_at?: string
          customer_email?: string | null
          error_message?: string | null
          error_name?: string | null
          id?: string
          payload?: Json | null
          paypal_debug_id?: string | null
          paypal_order_id?: string | null
          stage?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      payment_plan_audit: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          changes: Json
          created_at: string
          id: string
          plan_id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          changes?: Json
          created_at?: string
          id?: string
          plan_id: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          changes?: Json
          created_at?: string
          id?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_plan_audit_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_plans: {
        Row: {
          amount_paid: number
          archived_at: string | null
          archived_by: string | null
          balance_remaining: number
          created_at: string
          created_by: string | null
          customer_email: string
          customer_name: string
          id: string
          min_payment: number | null
          notes: string | null
          package_name: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          archived_at?: string | null
          archived_by?: string | null
          balance_remaining: number
          created_at?: string
          created_by?: string | null
          customer_email: string
          customer_name: string
          id?: string
          min_payment?: number | null
          notes?: string | null
          package_name: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          archived_at?: string | null
          archived_by?: string | null
          balance_remaining?: number
          created_at?: string
          created_by?: string | null
          customer_email?: string
          customer_name?: string
          id?: string
          min_payment?: number | null
          notes?: string | null
          package_name?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          admin_note: string | null
          amount: number
          card_last4: string | null
          card_type: string | null
          created_at: string
          created_by: string | null
          id: string
          parent_payment_id: string | null
          paypal_capture_id: string
          plan_id: string
          reason: string | null
          refunded_amount: number
          status: string
          type: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          card_last4?: string | null
          card_type?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          parent_payment_id?: string | null
          paypal_capture_id: string
          plan_id: string
          reason?: string | null
          refunded_amount?: number
          status?: string
          type?: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          card_last4?: string | null
          card_type?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          parent_payment_id?: string | null
          paypal_capture_id?: string
          plan_id?: string
          reason?: string | null
          refunded_amount?: number
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_parent_payment_id_fkey"
            columns: ["parent_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_billing_schedules: {
        Row: {
          amount: number
          authnet_subscription_id: string | null
          cadence: string
          created_at: string
          created_by: string | null
          customer_profile_id: string | null
          failure_count: number
          id: string
          last_error: string | null
          last_run_at: string | null
          next_run_date: string | null
          payment_profile_id: string | null
          plan_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          authnet_subscription_id?: string | null
          cadence?: string
          created_at?: string
          created_by?: string | null
          customer_profile_id?: string | null
          failure_count?: number
          id?: string
          last_error?: string | null
          last_run_at?: string | null
          next_run_date?: string | null
          payment_profile_id?: string | null
          plan_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          authnet_subscription_id?: string | null
          cadence?: string
          created_at?: string
          created_by?: string | null
          customer_profile_id?: string | null
          failure_count?: number
          id?: string
          last_error?: string | null
          last_run_at?: string | null
          next_run_date?: string | null
          payment_profile_id?: string | null
          plan_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_billing_schedules_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      product_condition_assignments: {
        Row: {
          condition_id: string
          created_at: string
          id: string
          product_id: string
        }
        Insert: {
          condition_id: string
          created_at?: string
          id?: string
          product_id: string
        }
        Update: {
          condition_id?: string
          created_at?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_condition_assignments_condition_id_fkey"
            columns: ["condition_id"]
            isOneToOne: false
            referencedRelation: "product_conditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_condition_assignments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_conditions: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          created_at: string
          discount_percent: number
          id: string
          is_default: boolean
          price_usd: number
          price_xcd: number
          product_id: string
          size_label: string
          size_oz: number
          stock_status: string
        }
        Insert: {
          created_at?: string
          discount_percent?: number
          id?: string
          is_default?: boolean
          price_usd: number
          price_xcd: number
          product_id: string
          size_label: string
          size_oz: number
          stock_status?: string
        }
        Update: {
          created_at?: string
          discount_percent?: number
          id?: string
          is_default?: boolean
          price_usd?: number
          price_xcd?: number
          product_id?: string
          size_label?: string
          size_oz?: number
          stock_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          additional_images: string[] | null
          badge: string | null
          category_id: string | null
          contraindications: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          dosage_instructions: string | null
          expires_at: string | null
          id: string
          image_url: string | null
          ingredients: string | null
          is_active: boolean | null
          is_digital: boolean
          is_featured: boolean | null
          label_image_url: string | null
          low_stock_threshold: number
          name: string
          original_price_usd: number | null
          original_price_xcd: number | null
          pharmaceutical_info: string | null
          price_usd: number
          price_xcd: number
          product_type: string
          promotion_badge: string | null
          promotion_text: string | null
          secondary_category_id: string | null
          short_description: string | null
          size_info: string | null
          slug: string
          stock_quantity: number
          stock_status: string | null
          track_inventory: boolean
          traditional_use: string | null
          updated_at: string | null
          woo_product_id: number | null
        }
        Insert: {
          additional_images?: string[] | null
          badge?: string | null
          category_id?: string | null
          contraindications?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          dosage_instructions?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          is_active?: boolean | null
          is_digital?: boolean
          is_featured?: boolean | null
          label_image_url?: string | null
          low_stock_threshold?: number
          name: string
          original_price_usd?: number | null
          original_price_xcd?: number | null
          pharmaceutical_info?: string | null
          price_usd: number
          price_xcd: number
          product_type: string
          promotion_badge?: string | null
          promotion_text?: string | null
          secondary_category_id?: string | null
          short_description?: string | null
          size_info?: string | null
          slug: string
          stock_quantity?: number
          stock_status?: string | null
          track_inventory?: boolean
          traditional_use?: string | null
          updated_at?: string | null
          woo_product_id?: number | null
        }
        Update: {
          additional_images?: string[] | null
          badge?: string | null
          category_id?: string | null
          contraindications?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          dosage_instructions?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          is_active?: boolean | null
          is_digital?: boolean
          is_featured?: boolean | null
          label_image_url?: string | null
          low_stock_threshold?: number
          name?: string
          original_price_usd?: number | null
          original_price_xcd?: number | null
          pharmaceutical_info?: string | null
          price_usd?: number
          price_xcd?: number
          product_type?: string
          promotion_badge?: string | null
          promotion_text?: string | null
          secondary_category_id?: string | null
          short_description?: string | null
          size_info?: string | null
          slug?: string
          stock_quantity?: number
          stock_status?: string | null
          track_inventory?: boolean
          traditional_use?: string | null
          updated_at?: string | null
          woo_product_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_secondary_category_id_fkey"
            columns: ["secondary_category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          country_code: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          phone: string | null
          preferred_currency: string | null
          updated_at: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          phone?: string | null
          preferred_currency?: string | null
          updated_at?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          phone?: string | null
          preferred_currency?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      retreat_bookings: {
        Row: {
          amount_paid_usd: number | null
          balance_due_usd: number | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          deposit_usd: number
          end_date: string
          guest_count: number
          id: string
          payment_option: string
          payment_status: string
          paypal_capture_id: string | null
          paypal_order_id: string | null
          retreat_date_id: string | null
          retreat_type_id: string
          special_requests: string | null
          start_date: string
          status: string
          total_usd: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_paid_usd?: number | null
          balance_due_usd?: number | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          deposit_usd: number
          end_date: string
          guest_count?: number
          id?: string
          payment_option?: string
          payment_status?: string
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          retreat_date_id?: string | null
          retreat_type_id: string
          special_requests?: string | null
          start_date: string
          status?: string
          total_usd: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_paid_usd?: number | null
          balance_due_usd?: number | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          deposit_usd?: number
          end_date?: string
          guest_count?: number
          id?: string
          payment_option?: string
          payment_status?: string
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          retreat_date_id?: string | null
          retreat_type_id?: string
          special_requests?: string | null
          start_date?: string
          status?: string
          total_usd?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retreat_bookings_retreat_date_id_fkey"
            columns: ["retreat_date_id"]
            isOneToOne: false
            referencedRelation: "retreat_dates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retreat_bookings_retreat_type_id_fkey"
            columns: ["retreat_type_id"]
            isOneToOne: false
            referencedRelation: "retreat_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retreat_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      retreat_dates: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_published: boolean
          price_override_usd: number | null
          promo_label: string | null
          retreat_type_id: string
          spots_booked: number
          spots_total: number
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_published?: boolean
          price_override_usd?: number | null
          promo_label?: string | null
          retreat_type_id: string
          spots_booked?: number
          spots_total?: number
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_published?: boolean
          price_override_usd?: number | null
          promo_label?: string | null
          retreat_type_id?: string
          spots_booked?: number
          spots_total?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retreat_dates_retreat_type_id_fkey"
            columns: ["retreat_type_id"]
            isOneToOne: false
            referencedRelation: "retreat_types"
            referencedColumns: ["id"]
          },
        ]
      }
      retreat_gallery: {
        Row: {
          category: string
          created_at: string
          custom_category_label: string | null
          description: string | null
          display_order: number
          id: string
          image_url: string
          is_featured: boolean
          title: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          custom_category_label?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_featured?: boolean
          title?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          custom_category_label?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_featured?: boolean
          title?: string | null
        }
        Relationships: []
      }
      retreat_types: {
        Row: {
          additional_images: string[]
          base_price_usd: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          includes: Json | null
          is_active: boolean
          max_capacity: number
          max_nights: number
          min_nights: number
          name: string
          price_type: string
          slug: string
          type: string
          updated_at: string
        }
        Insert: {
          additional_images?: string[]
          base_price_usd: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          includes?: Json | null
          is_active?: boolean
          max_capacity?: number
          max_nights?: number
          min_nights?: number
          name: string
          price_type: string
          slug: string
          type: string
          updated_at?: string
        }
        Update: {
          additional_images?: string[]
          base_price_usd?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          includes?: Json | null
          is_active?: boolean
          max_capacity?: number
          max_nights?: number
          min_nights?: number
          name?: string
          price_type?: string
          slug?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      retreat_videos: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_featured: boolean
          thumbnail_url: string | null
          title: string | null
          video_url: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_featured?: boolean
          thumbnail_url?: string | null
          title?: string | null
          video_url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_featured?: boolean
          thumbnail_url?: string | null
          title?: string | null
          video_url?: string
        }
        Relationships: []
      }
      review_helpfulness: {
        Row: {
          created_at: string
          id: string
          review_id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpfulness_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_helpfulness_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews_public"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string
          created_at: string
          helpful_count: number
          id: string
          images: Json | null
          is_verified_purchase: boolean
          product_id: string
          rating: number
          status: string
          title: string
          user_email: string
          user_name: string
        }
        Insert: {
          content: string
          created_at?: string
          helpful_count?: number
          id?: string
          images?: Json | null
          is_verified_purchase?: boolean
          product_id: string
          rating: number
          status?: string
          title: string
          user_email: string
          user_name: string
        }
        Update: {
          content?: string
          created_at?: string
          helpful_count?: number
          id?: string
          images?: Json | null
          is_verified_purchase?: boolean
          product_id?: string
          rating?: number
          status?: string
          title?: string
          user_email?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_rates: {
        Row: {
          base_rate_usd: number
          countries: string[] | null
          created_at: string | null
          estimated_days: string | null
          id: string
          is_active: boolean | null
          per_item_rate_usd: number | null
          region: string
        }
        Insert: {
          base_rate_usd: number
          countries?: string[] | null
          created_at?: string | null
          estimated_days?: string | null
          id?: string
          is_active?: boolean | null
          per_item_rate_usd?: number | null
          region: string
        }
        Update: {
          base_rate_usd?: number
          countries?: string[] | null
          created_at?: string | null
          estimated_days?: string | null
          id?: string
          is_active?: boolean | null
          per_item_rate_usd?: number | null
          region?: string
        }
        Relationships: []
      }
      solo_pricing_tiers: {
        Row: {
          created_at: string
          discount_percent: number
          id: string
          max_nights: number
          min_nights: number
          nightly_rate_usd: number
        }
        Insert: {
          created_at?: string
          discount_percent?: number
          id?: string
          max_nights: number
          min_nights: number
          nightly_rate_usd: number
        }
        Update: {
          created_at?: string
          discount_percent?: number
          id?: string
          max_nights?: number
          min_nights?: number
          nightly_rate_usd?: number
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          audience: string
          author_name: string
          author_title: string | null
          condition_addressed: string | null
          created_at: string
          display_order: number
          id: string
          is_featured: boolean
          quote: string
          results: string | null
        }
        Insert: {
          audience: string
          author_name: string
          author_title?: string | null
          condition_addressed?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_featured?: boolean
          quote: string
          results?: string | null
        }
        Update: {
          audience?: string
          author_name?: string
          author_title?: string | null
          condition_addressed?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_featured?: boolean
          quote?: string
          results?: string | null
        }
        Relationships: []
      }
      tracking_subscriptions: {
        Row: {
          active: boolean
          channel: string
          contact: string
          created_at: string
          id: string
          last_known_fulfillment: string | null
          last_known_status: string | null
          last_known_tracking: string | null
          last_notified_at: string | null
          order_id: string
          unsubscribe_token: string
          updated_at: string
          verified: boolean
          verify_token: string
        }
        Insert: {
          active?: boolean
          channel: string
          contact: string
          created_at?: string
          id?: string
          last_known_fulfillment?: string | null
          last_known_status?: string | null
          last_known_tracking?: string | null
          last_notified_at?: string | null
          order_id: string
          unsubscribe_token?: string
          updated_at?: string
          verified?: boolean
          verify_token?: string
        }
        Update: {
          active?: boolean
          channel?: string
          contact?: string
          created_at?: string
          id?: string
          last_known_fulfillment?: string | null
          last_known_status?: string | null
          last_known_tracking?: string | null
          last_notified_at?: string | null
          order_id?: string
          unsubscribe_token?: string
          updated_at?: string
          verified?: boolean
          verify_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_subscriptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      wce_faqs: {
        Row: {
          answer: string | null
          created_at: string
          display_order: number
          id: string
          published: boolean
          question: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          display_order?: number
          id?: string
          published?: boolean
          question: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          display_order?: number
          id?: string
          published?: boolean
          question?: string
        }
        Relationships: []
      }
      wce_leads: {
        Row: {
          consent_marketing: boolean
          consent_timestamp: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          ip_address: string | null
          landing_path: string | null
          notes: string | null
          pathway_interest: string | null
          preferred_contact: string | null
          reason: string | null
          referral_code: string | null
          referrer: string | null
          status: string
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          whatsapp: string | null
        }
        Insert: {
          consent_marketing?: boolean
          consent_timestamp?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          ip_address?: string | null
          landing_path?: string | null
          notes?: string | null
          pathway_interest?: string | null
          preferred_contact?: string | null
          reason?: string | null
          referral_code?: string | null
          referrer?: string | null
          status?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp?: string | null
        }
        Update: {
          consent_marketing?: boolean
          consent_timestamp?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          ip_address?: string | null
          landing_path?: string | null
          notes?: string | null
          pathway_interest?: string | null
          preferred_contact?: string | null
          reason?: string | null
          referral_code?: string | null
          referrer?: string | null
          status?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      wce_media: {
        Row: {
          category: string | null
          created_at: string
          display_order: number
          id: string
          published: boolean
          thumbnail_url: string | null
          title: string | null
          video_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          display_order?: number
          id?: string
          published?: boolean
          thumbnail_url?: string | null
          title?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          display_order?: number
          id?: string
          published?: boolean
          thumbnail_url?: string | null
          title?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      wce_orders: {
        Row: {
          amount: number
          created_at: string
          currency: string
          email: string | null
          id: string
          order_number: string | null
          pathway_key: string | null
          referral_code: string | null
          status: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          woo_order_id: number | null
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          order_number?: string | null
          pathway_key?: string | null
          referral_code?: string | null
          status?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          woo_order_id?: number | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          order_number?: string | null
          pathway_key?: string | null
          referral_code?: string | null
          status?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          woo_order_id?: number | null
        }
        Relationships: []
      }
      wce_pathways: {
        Row: {
          capacity: number | null
          created_at: string
          currency: string
          display_order: number
          features: Json
          id: string
          is_highlighted: boolean
          is_open: boolean
          key: string
          label: string
          price: number
          product_id: string | null
          sold_count: number
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          currency?: string
          display_order?: number
          features?: Json
          id?: string
          is_highlighted?: boolean
          is_open?: boolean
          key: string
          label: string
          price?: number
          product_id?: string | null
          sold_count?: number
        }
        Update: {
          capacity?: number | null
          created_at?: string
          currency?: string
          display_order?: number
          features?: Json
          id?: string
          is_highlighted?: boolean
          is_open?: boolean
          key?: string
          label?: string
          price?: number
          product_id?: string | null
          sold_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "wce_pathways_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      wce_referral_codes: {
        Row: {
          code: string
          created_at: string
          discount_percent: number
          id: string
          is_active: boolean
          last_used_at: string | null
          last_woo_coupon_found: boolean | null
          owner_name: string | null
          owner_type: string | null
          use_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_percent?: number
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          last_woo_coupon_found?: boolean | null
          owner_name?: string | null
          owner_type?: string | null
          use_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_percent?: number
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          last_woo_coupon_found?: boolean | null
          owner_name?: string | null
          owner_type?: string | null
          use_count?: number
        }
        Relationships: []
      }
      wce_settings: {
        Row: {
          created_at: string
          event_dates: string | null
          hero_headline: string | null
          hero_subline: string | null
          id: string
          popup_cta_text: string | null
          popup_enabled: boolean
          popup_flyer_url: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          event_dates?: string | null
          hero_headline?: string | null
          hero_subline?: string | null
          id?: string
          popup_cta_text?: string | null
          popup_enabled?: boolean
          popup_flyer_url?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          event_dates?: string | null
          hero_headline?: string | null
          hero_subline?: string | null
          id?: string
          popup_cta_text?: string | null
          popup_enabled?: boolean
          popup_flyer_url?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      wce_speakers: {
        Row: {
          bio: string | null
          created_at: string
          display_order: number
          id: string
          is_featured: boolean
          name: string
          portrait_url: string | null
          published: boolean
          session_time: string | null
          session_title: string | null
          theme: string | null
          title: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_featured?: boolean
          name: string
          portrait_url?: string | null
          published?: boolean
          session_time?: string | null
          session_title?: string | null
          theme?: string | null
          title?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_featured?: boolean
          name?: string
          portrait_url?: string | null
          published?: boolean
          session_time?: string | null
          session_title?: string | null
          theme?: string | null
          title?: string | null
        }
        Relationships: []
      }
      webinar_videos: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_featured: boolean
          published_at: string | null
          thumbnail_url: string | null
          title: string | null
          youtube_video_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_featured?: boolean
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          youtube_video_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_featured?: boolean
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          youtube_video_id?: string
        }
        Relationships: []
      }
      wholesale_leads: {
        Row: {
          admin_notes: string | null
          business_type: string | null
          company_name: string
          created_at: string
          email: string
          id: string
          needs: string | null
          source: string | null
          status: Database["public"]["Enums"]["wholesale_lead_status"]
          updated_at: string
          whatsapp_sent: boolean | null
        }
        Insert: {
          admin_notes?: string | null
          business_type?: string | null
          company_name: string
          created_at?: string
          email: string
          id?: string
          needs?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["wholesale_lead_status"]
          updated_at?: string
          whatsapp_sent?: boolean | null
        }
        Update: {
          admin_notes?: string | null
          business_type?: string | null
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          needs?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["wholesale_lead_status"]
          updated_at?: string
          whatsapp_sent?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      reviews_public: {
        Row: {
          content: string | null
          created_at: string | null
          helpful_count: number | null
          id: string | null
          images: Json | null
          is_verified_purchase: boolean | null
          product_id: string | null
          rating: number | null
          status: string | null
          title: string | null
          user_name: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string | null
          images?: Json | null
          is_verified_purchase?: boolean | null
          product_id?: string | null
          rating?: number | null
          status?: string | null
          title?: string | null
          user_name?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string | null
          images?: Json | null
          is_verified_purchase?: boolean | null
          product_id?: string | null
          rating?: number | null
          status?: string | null
          title?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_get_reviews: {
        Args: { p_sort?: string; p_status?: string }
        Returns: {
          content: string
          created_at: string
          helpful_count: number
          id: string
          images: Json
          is_verified_purchase: boolean
          product_id: string
          product_name: string
          product_slug: string
          rating: number
          status: string
          title: string
          user_email: string
          user_name: string
        }[]
      }
      apply_payment: {
        Args: { p_amount: number; p_plan_id: string }
        Returns: {
          amount_paid: number
          archived_at: string | null
          archived_by: string | null
          balance_remaining: number
          created_at: string
          created_by: string | null
          customer_email: string
          customer_name: string
          id: string
          min_payment: number | null
          notes: string | null
          package_name: string
          status: string
          total_amount: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payment_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_plan_refund: {
        Args: { p_amount: number; p_plan_id: string }
        Returns: {
          amount_paid: number
          archived_at: string | null
          archived_by: string | null
          balance_remaining: number
          created_at: string
          created_by: string | null
          customer_email: string
          customer_name: string
          id: string
          min_payment: number | null
          notes: string | null
          package_name: string
          status: string
          total_amount: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payment_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      check_verified_purchase: {
        Args: { p_email: string; p_product_id: string }
        Returns: boolean
      }
      clean_product_text: { Args: { t: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_order_owner_or_admin: {
        Args: { target_order_id: string }
        Returns: boolean
      }
    }
    Enums: {
      wholesale_lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "converted"
        | "lost"
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
      wholesale_lead_status: [
        "new",
        "contacted",
        "qualified",
        "converted",
        "lost",
      ],
    },
  },
} as const
