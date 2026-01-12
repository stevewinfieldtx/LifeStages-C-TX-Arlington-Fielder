import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (for browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our database
export interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  age_range: '13-17' | '18-23' | '24-64' | '65+' | null
  gender: 'male' | 'female' | 'other' | null
  life_stage: 'general' | 'new_beginnings' | 'struggling' | 'transitions' | null
  country: string
  language: string
  church_id: string | null
  created_at: string
  updated_at: string
}

export interface CachedDevotional {
  id: string
  verse_reference: string
  age_range: string
  gender: string
  life_stage: string
  language: string
  church_id: string | null
  verse_text: string
  reflection: string
  application: string
  prayer: string
  image_url: string | null
  audio_url: string | null
  llm_model: string | null
  created_at: string
  access_count: number
  last_accessed: string
}

export interface Verse {
  id: string
  date: string
  verse_reference: string
  verse_text: string
  bible_url: string | null
  church_id: string | null
  created_at: string
}

export interface Church {
  id: string
  name: string
  contact_email: string | null
  custom_verse_schedule: boolean
  active: boolean
  created_at: string
}
