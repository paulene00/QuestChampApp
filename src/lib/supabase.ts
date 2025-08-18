import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types for our database schema
export interface Task {
  id: string
  user_id: string
  title: string
  description: string
  due_date: string | null
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  deleted_by: string | null
}

export interface TaskInsert {
  title: string
  description?: string
  due_date?: string | null
  priority?: 'low' | 'medium' | 'high'
  completed?: boolean
}

export interface TaskUpdate {
  title?: string
  description?: string
  due_date?: string | null
  priority?: 'low' | 'medium' | 'high'
  completed?: boolean
}