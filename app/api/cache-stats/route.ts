import { NextResponse } from 'next/server'
import { getCacheStats } from '@/lib/supabase/cache'

export async function GET() {
  try {
    const stats = await getCacheStats()
    
    if (!stats) {
      return NextResponse.json({ error: 'Failed to get cache stats' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Supabase cache is working!',
      stats: {
        total_cached_devotionals: stats.total_entries,
        total_times_served_from_cache: stats.total_accesses,
        unique_verses_cached: stats.unique_verses,
        estimated_api_calls_saved: stats.total_accesses - stats.total_entries,
      }
    })
  } catch (error) {
    console.error('Cache stats error:', error)
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
