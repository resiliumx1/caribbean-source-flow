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
      orders: {
        Row: {
          address_line1: string
          address_line2: string | null
          admin_notes: string | null
          city: string
          country: string
          created_at: string | null
          currency_used: string
          customer_notes: string | null
          delivery_type: string
          delivery_zone_id: string | null
          email: string
          id: string
          order_number: string | null
          payment_method: string
          payment_status: string | null
          phone: string | null
          postal_code: string | null
          shipping_rate_id: string | null
          shipping_usd: number
          shipping_xcd: number
          state_province: string | null
          status: string | null
          subtotal_usd: number
          subtotal_xcd: number
          total_usd: number
          total_xcd: number
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
          created_at?: string | null
          currency_used: string
          customer_notes?: string | null
          delivery_type: string
          delivery_zone_id?: string | null
          email: string
          id?: string
          order_number?: string | null
          payment_method: string
          payment_status?: string | null
          phone?: string | null
          postal_code?: string | null
          shipping_rate_id?: string | null
          shipping_usd?: number
          shipping_xcd?: number
          state_province?: string | null
          status?: string | null
          subtotal_usd: number
          subtotal_xcd: number
          total_usd: number
          total_xcd: number
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
          created_at?: string | null
          currency_used?: string
          customer_notes?: string | null
          delivery_type?: string
          delivery_zone_id?: string | null
          email?: string
          id?: string
          order_number?: string | null
          payment_method?: string
          payment_status?: string | null
          phone?: string | null
          postal_code?: string | null
          shipping_rate_id?: string | null
          shipping_usd?: number
          shipping_xcd?: number
          state_province?: string | null
          status?: string | null
          subtotal_usd?: number
          subtotal_xcd?: number
          total_usd?: number
          total_xcd?: number
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
          id: string
          image_url: string | null
          ingredients: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          original_price_usd: number | null
          original_price_xcd: number | null
          pharmaceutical_info: string | null
          price_usd: number
          price_xcd: number
          product_type: string
          promotion_badge: string | null
          promotion_text: string | null
          short_description: string | null
          size_info: string | null
          slug: string
          stock_status: string | null
          traditional_use: string | null
          updated_at: string | null
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
          id?: string
          image_url?: string | null
          ingredients?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          original_price_usd?: number | null
          original_price_xcd?: number | null
          pharmaceutical_info?: string | null
          price_usd: number
          price_xcd: number
          product_type: string
          promotion_badge?: string | null
          promotion_text?: string | null
          short_description?: string | null
          size_info?: string | null
          slug: string
          stock_status?: string | null
          traditional_use?: string | null
          updated_at?: string | null
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
          id?: string
          image_url?: string | null
          ingredients?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          original_price_usd?: number | null
          original_price_xcd?: number | null
          pharmaceutical_info?: string | null
          price_usd?: number
          price_xcd?: number
          product_type?: string
          promotion_badge?: string | null
          promotion_text?: string | null
          short_description?: string | null
          size_info?: string | null
          slug?: string
          stock_status?: string | null
          traditional_use?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
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
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          deposit_usd: number
          end_date: string
          guest_count: number
          id: string
          payment_status: string
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
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          deposit_usd: number
          end_date: string
          guest_count?: number
          id?: string
          payment_status?: string
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
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          deposit_usd?: number
          end_date?: string
          guest_count?: number
          id?: string
          payment_status?: string
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
          end_date: string
          id: string
          is_published: boolean
          price_override_usd: number | null
          retreat_type_id: string
          spots_booked: number
          spots_total: number
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_published?: boolean
          price_override_usd?: number | null
          retreat_type_id: string
          spots_booked?: number
          spots_total?: number
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_published?: boolean
          price_override_usd?: number | null
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
          base_price_usd: number
          created_at: string
          description: string | null
          id: string
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
          base_price_usd: number
          created_at?: string
          description?: string | null
          id?: string
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
          base_price_usd?: number
          created_at?: string
          description?: string | null
          id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_verified_purchase: {
        Args: { p_email: string; p_product_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_order_owner_or_admin: {
        Args: { target_order_id: string }
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
