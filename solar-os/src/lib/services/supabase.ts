import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client (with RLS)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (bypasses RLS)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)

// Helper functions for common operations
export const supabaseHelpers = {
  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password })
  },

  // Sign up with email and password
  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({ email, password })
  },

  // Sign out
  async signOut() {
    return await supabase.auth.signOut()
  },

  // Upload file to storage
  async uploadFile(bucket: string, path: string, file: File) {
    return await supabase.storage
      .from(bucket)
      .upload(path, file)
  },

  // Get public URL for file
  getPublicUrl(bucket: string, path: string) {
    return supabase.storage
      .from(bucket)
      .getPublicUrl(path)
  }
}

// Real-time subscriptions helper
export const createRealtimeSubscription = (
  table: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', 
        { event: '*', schema: 'public', table }, 
        callback)
    .subscribe()
}

export default supabase