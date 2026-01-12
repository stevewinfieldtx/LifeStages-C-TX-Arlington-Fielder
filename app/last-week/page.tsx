"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface SermonData {
  title: string
  date: string
  summary: string
  scriptures: string[]
  mainTheme: string
  keyPoints: string[]
}

interface SermonDevotional {
  interpretation: string
  heroImage?: string
  reflection?: string
  prayer?: string
}

export default function LastWeekPage() {
  const router = useRouter()
  const [sermon, setSermon] = useState<SermonData | null>(null)
  const [devotional, setDevotional] = useState<SermonDevotional | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingStep, setLoadingStep] = useState("Loading sermon...")

  useEffect(() => {
    loadSermonAndDevotional()
  }, [])

  const loadSermonAndDevotional = async () => {
    try {
      setLoadingStep("Finding last week's message...")
      
      // Try to fetch from API
      const sermonResponse = await fetch('/api/sermon/last-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchId: 'fielder-church' })
      })

      let sermonData: SermonData

      if (sermonResponse.ok) {
        sermonData = await sermonResponse.json()
      } else {
        // Fallback demo data for Fielder
        sermonData = {
          title: "Abiding in the Vine",
          date: "January 5, 2026",
          summary: "Jesus calls us to remain connected to Him as branches to a vine. Apart from Him, we can do nothing of eternal significance. But when we abide in His love, we bear fruit that lasts. This isn't about striving harder—it's about staying close, drawing life from the source.",
          scriptures: ["John 15:1-11"],
          mainTheme: "Connection and Fruitfulness",
          keyPoints: [
            "Jesus is the vine, we are the branches",
            "Fruitfulness comes from connection, not effort",
            "Pruning is painful but purposeful",
            "Abiding leads to joy that is complete"
          ]
        }
      }

      setSermon(sermonData)

      // Generate personalized devotional
      setLoadingStep("Personalizing for your life stage...")
      
      const devotionalResponse = await fetch('/api/devotional-from-sermon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sermon: sermonData,
          userProfile: { age: 35, gender: 'male', lifeStage: 'general' }
        })
      })

      if (devotionalResponse.ok) {
        const devotionalData = await devotionalResponse.json()
        setDevotional(devotionalData)
      } else {
        setDevotional({
          interpretation: `This message about "${sermonData.mainTheme}" speaks to the heart of our daily walk with God. ${sermonData.summary} As you reflect on this truth, consider: What does it look like for you to "abide" in Christ this week? Where might you be trying to produce fruit through your own effort rather than staying connected to the vine?`
        })
      }

    } catch (error) {
      console.error('Error loading sermon:', error)
      setSermon({
        title: "Abiding in the Vine",
        date: "January 5, 2026",
        summary: "Jesus calls us to remain connected to Him. When we abide in His love, we bear fruit that lasts.",
        scriptures: ["John 15:1-11"],
        mainTheme: "Connection and Fruitfulness",
        keyPoints: ["Fruitfulness comes from connection"]
      })
      setDevotional({
        interpretation: "This powerful message reminds us that our spiritual vitality depends on staying connected to Jesus, the true vine."
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col max-w-md mx-auto bg-[#0c1929] shadow-2xl items-center justify-center">
        <div className="text-center px-6">
          <div className="size-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">{loadingStep}</p>
          <p className="text-blue-200/60 text-sm mt-2">Preparing your personalized content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-[#0c1929] shadow-2xl">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      <main className="flex-1 overflow-y-auto pt-16">
        
        {/* Header */}
        <div className="px-6 pb-4 text-center">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Last Week's Message</span>
          <h1 className="text-2xl font-bold text-white mt-2">{sermon?.title}</h1>
          <p className="text-blue-200/60 text-sm mt-1">{sermon?.date}</p>
        </div>

        {/* Hero Image Placeholder */}
        <div className="w-full px-4 pb-4">
          {devotional?.heroImage ? (
            <img src={devotional.heroImage} alt="Sermon illustration" className="w-full h-auto rounded-xl shadow-lg"/>
          ) : (
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-xl flex items-center justify-center border border-amber-400/20">
              <div className="text-center p-6">
                <span className="material-symbols-outlined text-5xl text-amber-400/50 mb-2">church</span>
                <p className="text-amber-200/60 text-sm">{sermon?.mainTheme}</p>
              </div>
            </div>
          )}
        </div>

        {/* Message Summary */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-amber-400/40"></div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Message Summary</span>
            <div className="h-px w-10 bg-amber-400/40"></div>
          </div>

          <p className="font-serif text-lg leading-relaxed text-white/90 text-center mb-4">
            &ldquo;{sermon?.summary}&rdquo;
          </p>

          {/* Scripture References */}
          <div className="flex flex-wrap justify-center gap-2">
            {sermon?.scriptures.map((ref, i) => (
              <span key={i} className="px-3 py-1 bg-amber-400/20 rounded-full text-xs text-amber-300 font-medium">
                {ref}
              </span>
            ))}
          </div>
        </div>

        {/* Friendly Breakdown */}
        <div className="px-6 pb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-amber-400/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
              </div>
              <h2 className="text-base font-bold text-white">Friendly Breakdown</h2>
            </div>
            <p className="text-blue-100/80 text-sm leading-relaxed">{devotional?.interpretation}</p>
          </div>
        </div>

        {/* Premium CTA */}
        <div className="px-6 pb-4">
          <p className="text-center text-lg font-semibold text-amber-100">&ldquo;Customized for your life...&rdquo;</p>
        </div>
        
        <div className="px-6 pb-6">
          <button
            onClick={() => router.push("/verse")}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            Explore Stories, Poetry & More...
          </button>
        </div>

        {/* Key Points */}
        {sermon?.keyPoints && sermon.keyPoints.length > 0 && (
          <div className="px-6 pb-8">
            <h3 className="text-sm font-bold text-white/80 mb-3">Key Takeaways:</h3>
            <ul className="space-y-2">
              {sermon.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-blue-100/70 text-sm">
                  <span className="text-amber-400 mt-1">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
