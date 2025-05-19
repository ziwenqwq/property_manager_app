export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string | null
          listing_agent: string | null
          listing_price: number | null
          square_footage: number | null
          bedrooms: number | null
          listing_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address?: string | null
          listing_agent?: string | null
          listing_price?: number | null
          square_footage?: number | null
          bedrooms?: number | null
          listing_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          address?: string | null
          listing_agent?: string | null
          listing_price?: number | null
          square_footage?: number | null
          bedrooms?: number | null
          listing_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          url: string
          is_floorplan: boolean
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          url: string
          is_floorplan?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          url?: string
          is_floorplan?: boolean
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          property_id: string
          user_id: string
          estate_agent: string | null
          date: string
          time: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          user_id: string
          estate_agent?: string | null
          date: string
          time: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string
          estate_agent?: string | null
          date?: string
          time?: string
          notes?: string | null
          created_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          property_id: string
          user_id: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          user_id: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string
          text?: string
          created_at?: string
        }
      }
      feedback_media: {
        Row: {
          id: string
          feedback_id: string
          url: string
          media_type: string
          created_at: string
        }
        Insert: {
          id?: string
          feedback_id: string
          url: string
          media_type: string
          created_at?: string
        }
        Update: {
          id?: string
          feedback_id?: string
          url?: string
          media_type?: string
          created_at?: string
        }
      }
    }
  }
}
