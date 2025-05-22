export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          name: string
          address: string | null
          listing_agent: string | null
          listing_price: number | null
          square_footage: number | null
          bedrooms: number | null
          listing_url: string | null
          listing_pdf: string | null
          rating: number | null
          created_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          listing_agent?: string | null
          listing_price?: number | null
          square_footage?: number | null
          bedrooms?: number | null
          listing_url?: string | null
          listing_pdf?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          listing_agent?: string | null
          listing_price?: number | null
          square_footage?: number | null
          bedrooms?: number | null
          listing_url?: string | null
          listing_pdf?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          property_id: string
          date: string
          time: string
          estate_agent: string | null
          notes: string | null
          created_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          property_id: string
          date: string
          time: string
          estate_agent?: string | null
          notes?: string | null
          created_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          date?: string
          time?: string
          estate_agent?: string | null
          notes?: string | null
          created_at?: string
          user_id?: string | null
        }
      }
      feedback: {
        Row: {
          id: string
          property_id: string
          text: string
          created_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          property_id: string
          text: string
          created_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          text?: string
          created_at?: string
          user_id?: string | null
        }
      }
      feedback_media: {
        Row: {
          id: string
          feedback_id: string
          media_type: string
          media_url: string
          created_at: string
        }
        Insert: {
          id?: string
          feedback_id: string
          media_type: string
          media_url: string
          created_at?: string
        }
        Update: {
          id?: string
          feedback_id?: string
          media_type?: string
          media_url?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
