import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL_ID = process.env.OPENROUTER_MODEL_ID || 'google/gemini-2.0-flash-001'

interface SermonData {
  title: string
  date: string
  summary: string
  scriptures: string[]
  mainTheme: string
  keyPoints: string[]
}

interface UserProfile {
  age: number
  gender: string
  lifeStage: string
}

// Map age to age range for personalization
function getAgeRange(age: number): string {
  if (age < 18) return '13-17'
  if (age < 24) return '18-23'
  if (age < 65) return '24-64'
  return '65+'
}

// Get life stage description for prompting
function getLifeStageContext(lifeStage: string): string {
  const contexts: Record<string, string> = {
    'general': 'everyday life',
    'new_beginnings': 'starting something new (new job, relationship, chapter)',
    'struggling': 'facing challenges and difficulties',
    'transitions': 'going through major life changes',
    'grieving': 'processing loss or grief',
    'celebrating': 'experiencing joy and celebration',
    'parenting': 'raising children',
    'career': 'focusing on career and professional growth',
    'retirement': 'entering or enjoying retirement',
    'student': 'studying and learning'
  }
  return contexts[lifeStage] || contexts['general']
}

export async function POST(request: NextRequest) {
  try {
    const { sermon, userProfile }: { sermon: SermonData, userProfile: UserProfile } = await request.json()
    
    const ageRange = getAgeRange(userProfile.age)
    const lifeStageContext = getLifeStageContext(userProfile.lifeStage)
    
    // Build the prompt for generating personalized devotional content
    const systemPrompt = `You are a warm, wise spiritual guide who helps people connect Scripture to their daily lives. Your tone is conversational, encouraging, and relatable - like a trusted friend who happens to know the Bible well.

You're creating content for someone who is:
- Age range: ${ageRange}
- Gender: ${userProfile.gender}
- Currently experiencing: ${lifeStageContext}

Always make the content feel personal and applicable to their specific life situation.`

    const userPrompt = `Based on last week's sermon, create personalized devotional content:

**Sermon Title:** ${sermon.title}
**Date:** ${sermon.date}
**Main Theme:** ${sermon.mainTheme}

**Scripture Readings:**
${sermon.scriptures.map(s => `- ${s}`).join('\n')}

**Sermon Summary:**
${sermon.summary}

**Key Points:**
${sermon.keyPoints.map(p => `- ${p}`).join('\n')}

Please generate:

1. **interpretation** (2-3 paragraphs): A "Friendly Breakdown" that explains what this sermon message means for someone in their life stage. Make it conversational and relatable. Don't just summarize - help them see how it applies to their specific situation.

2. **reflection** (1-2 paragraphs): A personal reflection prompt that helps them think about how this message connects to their current life experiences.

3. **application** (3-5 bullet points): Specific, practical ways they can apply this message this week, tailored to their life stage.

4. **prayer** (1 paragraph): A short prayer based on the sermon themes that they can use this week.

5. **heroImagePrompt** (1 sentence): A vivid image prompt for generating an inspirational image that captures the essence of this sermon. Should be evocative and beautiful, suitable for a devotional app.

Respond in JSON format:
{
  "interpretation": "...",
  "reflection": "...",
  "application": ["point 1", "point 2", ...],
  "prayer": "...",
  "heroImagePrompt": "..."
}`

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'LifeStages Church'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL_ID,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    // Parse the JSON response
    let devotionalContent
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content
      devotionalContent = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('Error parsing LLM response:', parseError)
      // Return a default structure if parsing fails
      devotionalContent = {
        interpretation: content,
        reflection: '',
        application: [],
        prayer: '',
        heroImagePrompt: `A serene, spiritual scene representing ${sermon.mainTheme}, warm golden light, peaceful atmosphere`
      }
    }

    // Generate hero image using Runware if we have the prompt
    let heroImage = null
    if (devotionalContent.heroImagePrompt && process.env.RUNWARE_API_KEY) {
      try {
        const imageResponse = await fetch('https://api.runware.ai/v1/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RUNWARE_API_KEY}`
          },
          body: JSON.stringify({
            model: process.env.RUNWARE_MODEL_ID || 'runware:z-image@turbo',
            prompt: devotionalContent.heroImagePrompt,
            width: 512,
            height: 384,
            steps: 20
          })
        })

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          heroImage = imageData.images?.[0]?.url
        }
      } catch (imageError) {
        console.error('Error generating image:', imageError)
      }
    }

    // Build verse data from sermon scriptures
    const verseData = {
      reference: sermon.scriptures[sermon.scriptures.length - 1], // Usually Gospel is most relevant
      version: 'ESV',
      text: sermon.summary.split('.')[0] + '.' // First sentence as "verse text" 
    }

    return NextResponse.json({
      verse: verseData,
      interpretation: devotionalContent.interpretation,
      reflection: devotionalContent.reflection,
      application: devotionalContent.application,
      prayer: devotionalContent.prayer,
      heroImage: heroImage,
      heroImagePrompt: devotionalContent.heroImagePrompt,
      source: 'sermon',
      sermonTitle: sermon.title,
      sermonDate: sermon.date,
      sermonTheme: sermon.mainTheme,
      scriptures: sermon.scriptures
    })

  } catch (error) {
    console.error('Error generating devotional from sermon:', error)
    return NextResponse.json(
      { error: 'Failed to generate devotional content' },
      { status: 500 }
    )
  }
}
