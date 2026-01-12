import { supabaseAdmin } from './server'
import type { CachedDevotional } from './client'

export interface CacheKey {
  verse_reference: string
  age_range: string
  gender: string
  life_stage: string
  language: string
  church_id?: string | null
}

export interface DevotionalContent {
  verse_text: string
  reflection: string
  application: string
  prayer: string
  image_url?: string | null
  audio_url?: string | null
}

/**
 * Check if a devotional exists in the cache
 * Returns the cached content if found, null otherwise
 */
export async function getCachedDevotional(key: CacheKey): Promise<CachedDevotional | null> {
  console.log('[Cache] Looking up:', JSON.stringify(key))
  
  let query = supabaseAdmin
    .from('cached_devotionals')
    .select('*')
    .eq('verse_reference', key.verse_reference)
    .eq('age_range', key.age_range)
    .eq('gender', key.gender)
    .eq('life_stage', key.life_stage)
    .eq('language', key.language)
  
  // Handle null church_id properly - use .is() for null comparison
  if (key.church_id) {
    query = query.eq('church_id', key.church_id)
  } else {
    query = query.is('church_id', null)
  }
  
  const { data, error } = await query.single()

  if (error) {
    // PGRST116 = no rows found, which is fine
    if (error.code !== 'PGRST116') {
      console.error('[Supabase] getCachedDevotional error:', error)
    }
    return null
  }

  // Update access count and last_accessed
  if (data) {
    await supabaseAdmin
      .from('cached_devotionals')
      .update({ 
        access_count: data.access_count + 1,
        last_accessed: new Date().toISOString()
      })
      .eq('id', data.id)
  }

  return data
}

/**
 * Save a new devotional to the cache
 */
export async function saveCachedDevotional(
  key: CacheKey, 
  content: DevotionalContent,
  llm_model?: string
): Promise<CachedDevotional | null> {
  console.log('[Cache] Saving:', JSON.stringify(key))
  
  const { data, error } = await supabaseAdmin
    .from('cached_devotionals')
    .upsert({
      verse_reference: key.verse_reference,
      age_range: key.age_range,
      gender: key.gender,
      life_stage: key.life_stage,
      language: key.language,
      church_id: key.church_id || null,
      verse_text: content.verse_text,
      reflection: content.reflection,
      application: content.application,
      prayer: content.prayer,
      image_url: content.image_url || null,
      audio_url: content.audio_url || null,
      llm_model: llm_model || null,
      access_count: 1,
      last_accessed: new Date().toISOString()
    }, {
      onConflict: 'verse_reference,age_range,gender,life_stage,language,church_id'
    })
    .select()
    .single()

  if (error) {
    console.error('[Supabase] saveCachedDevotional error:', error)
    return null
  }

  return data
}

/**
 * Get today's verse from the database
 * Falls back to default schedule if church has no custom schedule
 */
export async function getTodaysVerse(churchId?: string | null): Promise<{
  verse_reference: string
  verse_text: string
  bible_url: string | null
} | null> {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  // First try church-specific verse if churchId provided
  if (churchId) {
    const { data: churchVerse } = await supabaseAdmin
      .from('verses')
      .select('verse_reference, verse_text, bible_url')
      .eq('date', today)
      .eq('church_id', churchId)
      .single()

    if (churchVerse) return churchVerse
  }

  // Fall back to default verse schedule (church_id = null)
  const { data: defaultVerse, error } = await supabaseAdmin
    .from('verses')
    .select('verse_reference, verse_text, bible_url')
    .eq('date', today)
    .is('church_id', null)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('[Supabase] getTodaysVerse error:', error)
  }

  return defaultVerse || null
}

/**
 * Bulk insert verses (for importing from CSV)
 */
export async function importVerses(verses: {
  date: string
  verse_reference: string
  verse_text: string
  bible_url?: string
  church_id?: string | null
}[]): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('verses')
    .upsert(verses, {
      onConflict: 'date,church_id'
    })

  if (error) {
    console.error('[Supabase] importVerses error:', error)
    return false
  }

  return true
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  total_entries: number
  total_accesses: number
  unique_verses: number
} | null> {
  const { data, error } = await supabaseAdmin
    .from('cached_devotionals')
    .select('verse_reference, access_count')

  if (error) {
    console.error('[Supabase] getCacheStats error:', error)
    return null
  }

  const uniqueVerses = new Set(data.map(d => d.verse_reference)).size
  const totalAccesses = data.reduce((sum, d) => sum + d.access_count, 0)

  return {
    total_entries: data.length,
    total_accesses: totalAccesses,
    unique_verses: uniqueVerses
  }
}
