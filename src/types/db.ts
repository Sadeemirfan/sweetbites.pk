/**
 * Hand-authored to match the exact shape `supabase gen types typescript`
 * would produce from the migrations in supabase/migrations/. There is no
 * linked Supabase project yet to generate this from directly - once one
 * exists, regenerate for real with:
 *
 *   supabase gen types typescript --project-id <id> > src/types/db.ts
 *
 * Check-constrained text columns (e.g. orders.status) are typed as
 * `string` here, not a literal union - that matches what the real CLI
 * outputs for a `text ... check (...)` column (Postgres CHECK
 * constraints aren't enums, so the generator can't see the allowed
 * values). Convenience literal-union aliases for those are exported
 * separately at the bottom of this file for use in application code.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          description: string | null;
          base_price: number | null;
          cost_estimate: number | null;
          image_url: string | null;
          images: Json | null;
          sizes: Json | null;
          flavors: Json | null;
          lead_time_days: number;
          is_featured: boolean;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          description?: string | null;
          base_price?: number | null;
          cost_estimate?: number | null;
          image_url?: string | null;
          images?: Json | null;
          sizes?: Json | null;
          flavors?: Json | null;
          lead_time_days?: number;
          is_featured?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          base_price?: number | null;
          cost_estimate?: number | null;
          image_url?: string | null;
          images?: Json | null;
          sizes?: Json | null;
          flavors?: Json | null;
          lead_time_days?: number;
          is_featured?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      addons: {
        Row: {
          id: string;
          name: string;
          price: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          price?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      delivery_areas: {
        Row: {
          id: string;
          name: string;
          fee: number;
          is_inside_city: boolean;
          is_active: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          fee?: number;
          is_inside_city?: boolean;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          fee?: number;
          is_inside_city?: boolean;
          is_active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          phone: string;
          name: string | null;
          whatsapp: string | null;
          address: string | null;
          area_id: string | null;
          first_order_date: string | null;
          last_order_date: string | null;
          total_orders: number;
          total_spent: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          name?: string | null;
          whatsapp?: string | null;
          address?: string | null;
          area_id?: string | null;
          first_order_date?: string | null;
          last_order_date?: string | null;
          total_orders?: number;
          total_spent?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          name?: string | null;
          whatsapp?: string | null;
          address?: string | null;
          area_id?: string | null;
          first_order_date?: string | null;
          last_order_date?: string | null;
          total_orders?: number;
          total_spent?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customers_area_id_fkey";
            columns: ["area_id"];
            isOneToOne: false;
            referencedRelation: "delivery_areas";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: string | null;
          customer_id: string | null;
          source: string;
          customer_name: string | null;
          phone: string;
          whatsapp: string | null;
          fulfillment: string | null;
          delivery_area_id: string | null;
          address: string | null;
          required_date: string;
          time_slot: string | null;
          subtotal: number | null;
          delivery_fee: number;
          late_night_fee: number;
          discount: number;
          total: number | null;
          is_first_order: boolean;
          advance_required: boolean;
          advance_paid: number;
          payment_method: string | null;
          payment_status: string;
          payment_proof_url: string | null;
          occasion: string | null;
          occasion_person: string | null;
          occasion_date: string | null;
          /** Generated column (MM-DD from occasion_date) - read-only. */
          occasion_md: string | null;
          status: string;
          customer_note: string | null;
          admin_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string | null;
          customer_id?: string | null;
          source?: string;
          customer_name?: string | null;
          phone: string;
          whatsapp?: string | null;
          fulfillment?: string | null;
          delivery_area_id?: string | null;
          address?: string | null;
          required_date: string;
          time_slot?: string | null;
          subtotal?: number | null;
          delivery_fee?: number;
          late_night_fee?: number;
          discount?: number;
          total?: number | null;
          is_first_order?: boolean;
          advance_required?: boolean;
          advance_paid?: number;
          payment_method?: string | null;
          payment_status?: string;
          payment_proof_url?: string | null;
          occasion?: string | null;
          occasion_person?: string | null;
          occasion_date?: string | null;
          status?: string;
          customer_note?: string | null;
          admin_note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string | null;
          customer_id?: string | null;
          source?: string;
          customer_name?: string | null;
          phone?: string;
          whatsapp?: string | null;
          fulfillment?: string | null;
          delivery_area_id?: string | null;
          address?: string | null;
          required_date?: string;
          time_slot?: string | null;
          subtotal?: number | null;
          delivery_fee?: number;
          late_night_fee?: number;
          discount?: number;
          total?: number | null;
          is_first_order?: boolean;
          advance_required?: boolean;
          advance_paid?: number;
          payment_method?: string | null;
          payment_status?: string;
          payment_proof_url?: string | null;
          occasion?: string | null;
          occasion_person?: string | null;
          occasion_date?: string | null;
          status?: string;
          customer_note?: string | null;
          admin_note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_delivery_area_id_fkey";
            columns: ["delivery_area_id"];
            isOneToOne: false;
            referencedRelation: "delivery_areas";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          name_snapshot: string | null;
          size_label: string | null;
          flavor: string | null;
          weight_kg: number | null;
          unit_price: number | null;
          qty: number;
          cake_message: string | null;
          addons: Json | null;
          reference_image_url: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          name_snapshot?: string | null;
          size_label?: string | null;
          flavor?: string | null;
          weight_kg?: number | null;
          unit_price?: number | null;
          qty?: number;
          cake_message?: string | null;
          addons?: Json | null;
          reference_image_url?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          name_snapshot?: string | null;
          size_label?: string | null;
          flavor?: string | null;
          weight_kg?: number | null;
          unit_price?: number | null;
          qty?: number;
          cake_message?: string | null;
          addons?: Json | null;
          reference_image_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      order_events: {
        Row: {
          id: string;
          order_id: string;
          status: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          status?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      expense_categories: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          category_id: string | null;
          item: string;
          vendor: string | null;
          quantity: number | null;
          unit: string | null;
          unit_price: number | null;
          amount: number;
          purchased_on: string;
          payment_method: string | null;
          note: string | null;
          receipt_url: string | null;
          expense_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          item: string;
          vendor?: string | null;
          quantity?: number | null;
          unit?: string | null;
          unit_price?: number | null;
          amount: number;
          purchased_on: string;
          payment_method?: string | null;
          note?: string | null;
          receipt_url?: string | null;
          expense_type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          item?: string;
          vendor?: string | null;
          quantity?: number | null;
          unit?: string | null;
          unit_price?: number | null;
          amount?: number;
          purchased_on?: string;
          payment_method?: string | null;
          note?: string | null;
          receipt_url?: string | null;
          expense_type?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "expense_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      reminder_log: {
        Row: {
          id: string;
          order_id: string | null;
          customer_id: string | null;
          reminder_date: string;
          occasion_date: string | null;
          status: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          customer_id?: string | null;
          reminder_date: string;
          occasion_date?: string | null;
          status?: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          customer_id?: string | null;
          reminder_date?: string;
          occasion_date?: string | null;
          status?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reminder_log_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reminder_log_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      custom_cake_requests: {
        Row: {
          id: string;
          name: string | null;
          phone: string | null;
          occasion: string | null;
          tiers: number | null;
          weight_kg: number | null;
          flavor: string | null;
          theme_description: string | null;
          reference_images: Json | null;
          budget_min: number | null;
          budget_max: number | null;
          required_date: string | null;
          status: string;
          quoted_price: number | null;
          admin_reply: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          phone?: string | null;
          occasion?: string | null;
          tiers?: number | null;
          weight_kg?: number | null;
          flavor?: string | null;
          theme_description?: string | null;
          reference_images?: Json | null;
          budget_min?: number | null;
          budget_max?: number | null;
          required_date?: string | null;
          status?: string;
          quoted_price?: number | null;
          admin_reply?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          phone?: string | null;
          occasion?: string | null;
          tiers?: number | null;
          weight_kg?: number | null;
          flavor?: string | null;
          theme_description?: string | null;
          reference_images?: Json | null;
          budget_min?: number | null;
          budget_max?: number | null;
          required_date?: string | null;
          status?: string;
          quoted_price?: number | null;
          admin_reply?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      availability_rules: {
        Row: {
          id: string;
          weekday: number;
          is_open: boolean;
        };
        Insert: {
          id?: string;
          weekday: number;
          is_open?: boolean;
        };
        Update: {
          id?: string;
          weekday?: number;
          is_open?: boolean;
        };
        Relationships: [];
      };
      blackout_dates: {
        Row: {
          id: string;
          date: string;
          reason: string | null;
        };
        Insert: {
          id?: string;
          date: string;
          reason?: string | null;
        };
        Update: {
          id?: string;
          date?: string;
          reason?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          customer_name: string | null;
          rating: number | null;
          body: string | null;
          image_url: string | null;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_name?: string | null;
          rating?: number | null;
          body?: string | null;
          image_url?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string | null;
          rating?: number | null;
          body?: string | null;
          image_url?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          value: Json | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: Json | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      create_website_order: {
        Args: {
          p_customer_name: string;
          p_phone: string;
          p_whatsapp: string | null;
          p_fulfillment: string;
          p_delivery_area_id: string | null;
          p_address: string | null;
          p_required_date: string;
          p_time_slot: string;
          p_subtotal: number;
          p_delivery_fee: number;
          p_late_night_fee: number;
          p_total: number;
          p_payment_method: string;
          p_payment_proof_url: string | null;
          p_occasion: string | null;
          p_occasion_person: string | null;
          p_occasion_date: string | null;
          p_customer_note: string | null;
          p_items: Json;
        };
        Returns: {
          order_id: string;
          order_number: string;
          is_first_order: boolean;
          advance_required: boolean;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ─────────────────────────────────────────────────────────────────
// Hand-written convenience aliases (not part of the generated shape) - // mirror each CHECK constraint in supabase/migrations/20260821000002_tables.sql
// so application code can use a literal union instead of a bare string.
// Keep these in sync by hand if a migration ever changes a constraint.
// ─────────────────────────────────────────────────────────────────
export type OrderSource =
  | "website"
  | "whatsapp"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "walk_in"
  | "phone"
  | "other";

export type FulfillmentType = "pickup" | "delivery";

export type TimeSlot = "10-1" | "1-4" | "4-7" | "7-10" | "after-10";

export type PaymentMethod = "cod" | "jazzcash" | "easypaisa" | "bank";

export type PaymentStatus = "unpaid" | "partial" | "paid";

export type Occasion =
  | "birthday"
  | "anniversary"
  | "wedding"
  | "graduation"
  | "religious"
  | "other"
  | "none";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "baking"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export type ReminderStatus = "pending" | "contacted" | "ordered" | "dismissed";

export type CustomCakeRequestStatus = "new" | "quoted" | "accepted" | "declined" | "converted";

export type ProfileRole = "admin";
