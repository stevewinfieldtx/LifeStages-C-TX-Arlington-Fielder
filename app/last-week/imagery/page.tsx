"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

interface ImageryItem {
  symbol: string
  meaning: string
  imageUrl?: string
}

export default function SermonImageryPage() {
  const router = useRouter()
  const mainRef = useRef<HTMLDivElement>(null)
  const [imagery, setImagery] = useState<ImageryItem[]>([])
  const [sermonTitle, setSermonTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    mainRef.current?.scrollTo(0, 0)
    loadImagery()
  }, [])

  const loadImagery = async () => {
    try {
      const sermonRes = await fetch('/api/sermon/last-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchId: 'fielder-church' })
      })
      
      const sermonData = sermonRes.ok ? await sermonRes.json() : {
        title: "Abiding in the Vine",
        summary: "Jesus calls us to remain connected to Him.",
        scriptures: ["John 15:1-11"],
        mainTheme: "Connection"
      }
      setSermonTitle(sermonData.title)

      const imgRes = await fetch('/api/generate-imagery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verse: sermonData.scriptures[0],
          verseText: sermonData.summary,
          theme: sermonData.mainTheme
        })
      })

      if (imgRes.ok) {
        const data = await imgRes.json()
        if (data.imagery && Array.isArray(data.imagery)) {
          setImagery(data.imagery)
        } else if (data.images) {
          setImagery(data.images)
        }
      } else {
        setImagery([
          {
            symbol: "The Vine",
            meaning: "Jesus as the source of all spiritual life and nourishment. Just as a vine provides everything a branch needs to grow and bear fruit, Christ provides everything we need for spiritual vitality. The vine is the life-source—without it, there is no fruit, no growth, no life."
          },
          {
            symbol: "The Branches",
            meaning: "Believers who are connected to Christ. A branch has no life of its own—it depends entirely on the vine for water, nutrients, and the ability to produce fruit. This represents our complete dependence on Jesus for spiritual life."
          },
          {
            symbol: "The Fruit",
            meaning: "The natural result of staying connected to Christ—love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control. Fruit isn't forced or manufactured; it grows naturally when the branch stays connected to its life source."
          },
          {
            symbol: "The Gardener",
            meaning: "God the Father who tends, prunes, and cares for the vineyard. His pruning, though sometimes painful, leads to greater fruitfulness. He removes what hinders growth and shapes what remains for maximum productivity."
          }
        ])
      }
    } catch (error) {
      console.error('Error:', error)
      setImagery([{ symbol: "Error", meaning: "Unable to load imagery." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      ref={mainRef}
      className="relative flex min-h-screen w-full flex-col bg-[#0c1929] max-w-md mx-auto shadow-2xl"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between bg-[#0c1929]/95 backdrop-blur-md p-4 border-b border-white/10">
        <button
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-base font-bold text-cyan-400">Imagery</h2>
        <div className="size-10"></div>
      </div>

      <main className="flex-1 pb-10">
        {/* Title Section */}
        <div className="px-6 py-6 mb-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-400 mb-4">
            <span className="material-symbols-outlined text-sm">image</span>
            <span className="text-xs font-semibold uppercase tracking-wide">From the Sermon</span>
          </div>
          <p className="text-cyan-400 font-bold text-sm tracking-widest uppercase mb-2">{sermonTitle}</p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white">Visual Symbols</h1>
          <p className="mt-2 text-blue-200/70">The powerful imagery in this message.</p>
        </div>

        {/* Imagery Content */}
        <div className="px-4 mb-10 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <div className="size-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 animate-pulse">
                <span className="material-symbols-outlined text-cyan-400">image</span>
              </div>
              <p className="text-blue-200/70">Discovering visual symbols...</p>
            </div>
          ) : imagery.length > 0 ? (
            imagery.map((item, idx) => (
              <div key={idx} className="bg-white/5 rounded-2xl overflow-hidden shadow-lg border border-white/10">
                {item.imageUrl ? (
                  <img alt={item.symbol} className="w-full aspect-video object-cover" src={item.imageUrl} />
                ) : (
                  <div className="w-full aspect-[3/1] bg-gradient-to-br from-cyan-900/30 to-blue-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-cyan-500/50 text-4xl">image</span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white">
                      <span className="material-symbols-outlined">image</span>
                    </div>
                    <h3 className="font-bold text-lg text-white">{item.symbol}</h3>
                  </div>
                  <p className="text-blue-100/80 leading-relaxed">{item.meaning}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-blue-200/70">No imagery available</div>
          )}
        </div>
      </main>
    </div>
  )
}
