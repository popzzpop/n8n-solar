// Database types for Supabase
// This file will be auto-generated once the database schema is created

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: any // JSON
          status: CustomerStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: any
          status?: CustomerStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: any
          status?: CustomerStatus
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          customer_id: string
          type: JobType
          status: JobStatus
          scheduled_date: string | null
          crew_assigned: string[] | null
          system_size: number | null
          estimated_cost: number | null
          actual_cost: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          type: JobType
          status?: JobStatus
          scheduled_date?: string | null
          crew_assigned?: string[] | null
          system_size?: number | null
          estimated_cost?: number | null
          actual_cost?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          type?: JobType
          status?: JobStatus
          scheduled_date?: string | null
          crew_assigned?: string[] | null
          system_size?: number | null
          estimated_cost?: number | null
          actual_cost?: number | null
          updated_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          item_name: string
          category: string | null
          quantity: number
          unit_cost: number | null
          supplier_id: string | null
          reorder_level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_name: string
          category?: string | null
          quantity?: number
          unit_cost?: number | null
          supplier_id?: string | null
          reorder_level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_name?: string
          category?: string | null
          quantity?: number
          unit_cost?: number | null
          supplier_id?: string | null
          reorder_level?: number
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          source: string | null
          status: LeadStatus
          customer_id: string
          assigned_to: string | null
          estimated_value: number | null
          probability: number
          next_action: string | null
          next_action_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source?: string | null
          status?: LeadStatus
          customer_id: string
          assigned_to?: string | null
          estimated_value?: number | null
          probability?: number
          next_action?: string | null
          next_action_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          source?: string | null
          status?: LeadStatus
          customer_id?: string
          assigned_to?: string | null
          estimated_value?: number | null
          probability?: number
          next_action?: string | null
          next_action_date?: string | null
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
      customer_status: CustomerStatus
      job_type: JobType
      job_status: JobStatus
      lead_status: LeadStatus
    }
  }
}

// Enum types
export type CustomerStatus = 'prospect' | 'active' | 'completed' | 'inactive'
export type JobType = 'residential' | 'commercial' | 'maintenance' | 'repair'
export type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'quoted' | 'won' | 'lost'

// Helper types for easier usage
export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']

export type Job = Database['public']['Tables']['jobs']['Row']
export type JobInsert = Database['public']['Tables']['jobs']['Insert']
export type JobUpdate = Database['public']['Tables']['jobs']['Update']

export type InventoryItem = Database['public']['Tables']['inventory']['Row']
export type InventoryInsert = Database['public']['Tables']['inventory']['Insert']
export type InventoryUpdate = Database['public']['Tables']['inventory']['Update']

export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadInsert = Database['public']['Tables']['leads']['Insert']
export type LeadUpdate = Database['public']['Tables']['leads']['Update']