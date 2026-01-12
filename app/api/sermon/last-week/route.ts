import { NextRequest, NextResponse } from 'next/server'

// Lectionary data for liturgical churches
const LECTIONARY_DATA: Record<string, {
  title: string
  date: string
  readings: {
    oldTestament: string
    psalm: string
    epistle: string
    gospel: string
  }
  theme: string
  summary: string
}> = {
  // January 11, 2026 - Baptism of Our Lord (Year A)
  '2026-01-11': {
    title: 'The Baptism of Our Lord',
    date: 'January 11, 2026',
    readings: {
      oldTestament: 'Isaiah 42:1-9',
      psalm: 'Psalm 29',
      epistle: 'Acts 10:34-43',
      gospel: 'Matthew 3:13-17'
    },
    theme: 'Identity and Calling Through Baptism',
    summary: 'This Sunday celebrated Jesus\' baptism in the Jordan River. The readings emphasize God\'s identification of Jesus as "my beloved Son" and the descent of the Holy Spirit. Isaiah\'s servant song describes one who brings justice gently. Peter\'s speech to Cornelius declares that God shows no partiality - the Gospel is for all. The congregation reflected on their own baptismal identity and calling.'
  },
  // January 18, 2026 - Second Sunday after Epiphany (Year A)
  '2026-01-18': {
    title: 'Second Sunday after Epiphany',
    date: 'January 18, 2026',
    readings: {
      oldTestament: 'Isaiah 49:1-7',
      psalm: 'Psalm 40:1-11',
      epistle: '1 Corinthians 1:1-9',
      gospel: 'John 1:29-42'
    },
    theme: 'Calling and Identity - Behold the Lamb of God',
    summary: 'The readings focus on calling and identity. Isaiah describes being called before birth. John the Baptist points to Jesus as "the Lamb of God." The first disciples follow Jesus and discover where he dwells. This is about recognizing Jesus and responding to his invitation: "Come and see."'
  }
}

// Church denomination configurations
const CHURCH_CONFIGS: Record<string, {
  denomination: string
  lectionary: 'rcl' | 'catholic' | 'lutheran' | 'custom'
  sermonSource?: string
}> = {
  'st-gregorys-mansfield': {
    denomination: 'Anglican (ACNA)',
    lectionary: 'rcl', // Revised Common Lectionary
    sermonSource: undefined // No online sermon archive found
  },
  'fielder-church': {
    denomination: 'Non-denominational',
    lectionary: 'custom',
    sermonSource: 'https://fielder.church/messages' // Example
  }
}

// Function to get last Sunday's date
function getLastSunday(): string {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = dayOfWeek === 0 ? 7 : dayOfWeek // If Sunday, go back 7 days
  const lastSunday = new Date(today)
  lastSunday.setDate(today.getDate() - diff)
  return lastSunday.toISOString().split('T')[0]
}

// Function to scrape sermon data from a church website
async function scrapeChurchSermon(churchUrl: string): Promise<any | null> {
  try {
    // In production, this would use puppeteer or similar to scrape sermon content
    // For now, we'll return null to trigger fallback
    
    // Check common sermon archive patterns
    const sermonPaths = [
      '/sermons',
      '/messages', 
      '/media',
      '/watch',
      '/listen'
    ]
    
    // This would need actual scraping logic
    return null
  } catch (error) {
    console.error('Error scraping church sermon:', error)
    return null
  }
}

// Function to search YouTube for church sermons
async function searchYouTubeSermons(churchName: string): Promise<any | null> {
  try {
    // In production, this would use YouTube Data API
    // Search for: "[Church Name] sermon" sorted by date
    return null
  } catch (error) {
    console.error('Error searching YouTube:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { churchId, churchUrl } = await request.json()
    
    // Get church configuration
    const churchConfig = CHURCH_CONFIGS[churchId]
    
    let sermonData = null
    
    // Strategy 1: Try to scrape from church website
    if (churchUrl) {
      sermonData = await scrapeChurchSermon(churchUrl)
    }
    
    // Strategy 2: Try YouTube search
    if (!sermonData) {
      // Extract church name from churchId for YouTube search
      const churchName = churchId.replace(/-/g, ' ')
      sermonData = await searchYouTubeSermons(churchName)
    }
    
    // Strategy 3: Fall back to lectionary data for liturgical churches
    if (!sermonData && churchConfig?.lectionary === 'rcl') {
      const lastSunday = getLastSunday()
      const lectionaryEntry = LECTIONARY_DATA[lastSunday]
      
      if (lectionaryEntry) {
        sermonData = {
          title: lectionaryEntry.title,
          date: lectionaryEntry.date,
          summary: lectionaryEntry.summary,
          scriptures: [
            lectionaryEntry.readings.oldTestament,
            lectionaryEntry.readings.psalm,
            lectionaryEntry.readings.epistle,
            lectionaryEntry.readings.gospel
          ],
          mainTheme: lectionaryEntry.theme,
          keyPoints: [
            `Old Testament: ${lectionaryEntry.readings.oldTestament}`,
            `Psalm: ${lectionaryEntry.readings.psalm}`,
            `Epistle: ${lectionaryEntry.readings.epistle}`,
            `Gospel: ${lectionaryEntry.readings.gospel}`
          ],
          source: 'lectionary'
        }
      }
    }
    
    // Strategy 4: Use hardcoded fallback
    if (!sermonData) {
      // Default to Baptism of Our Lord for demo
      const fallback = LECTIONARY_DATA['2026-01-11']
      sermonData = {
        title: fallback.title,
        date: fallback.date,
        summary: fallback.summary,
        scriptures: [
          fallback.readings.oldTestament,
          fallback.readings.psalm,
          fallback.readings.epistle,
          fallback.readings.gospel
        ],
        mainTheme: fallback.theme,
        keyPoints: [
          'God declares Jesus as His beloved Son',
          'The Holy Spirit descends like a dove',
          'God shows no partiality - the Gospel is for all',
          'Jesus identifies with humanity by being baptized'
        ],
        source: 'lectionary-fallback'
      }
    }
    
    return NextResponse.json(sermonData)
    
  } catch (error) {
    console.error('Error in sermon API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sermon data' },
      { status: 500 }
    )
  }
}
