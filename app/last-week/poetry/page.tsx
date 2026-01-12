"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

interface Poem {
  title: string
  text: string
  style?: string
}

export default function SermonPoetryPage() {
  const router = useRouter()
  const mainRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [poems, setPoems] = useState<Poem[]>([])
  const [sermonTitle, setSermonTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    mainRef.current?.scrollTo(0, 0)
    loadPoetry()
  }, [])

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [activeTab])

  const loadPoetry = async () => {
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

      const poemRes = await fetch('/api/generate-poem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verse: sermonData.scriptures[0],
          verseText: sermonData.summary,
          theme: sermonData.mainTheme
        })
      })

      if (poemRes.ok) {
        const data = await poemRes.json()
        if (data.poems && Array.isArray(data.poems)) {
          setPoems(data.poems)
        } else if (data.poem) {
          setPoems([{ title: "Reflection", text: data.poem }])
        }
      } else {
        setPoems([
          {
            title: "The Vine",
            style: "Free Verse",
            text: `I tried to grow alone,
Reaching for the sun,
But withered in my striving—
Apart from You, undone.

Now rooted in Your presence,
I feel the life flow through,
Each leaf, each fruit, each blossom
A testament to You.

Not by my might or power,
But by Your Spirit's call,
I learn to simply abide—
And find You're all in all.`
          },
          {
            title: "Connection",
            style: "Haiku",
            text: `Branch and vine entwined,
Life flows where love resides deep,
In surrender, fruit.`
          }
        ])
      }
    } catch (error) {
      console.error('Error:', error)
      setPoems([{ title: "Poetry", text: "Unable to load poetry. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  const activePoem = poems[activeTab]
  const tabLabels = poems.length > 0 ? poems.map(p => p.title) : ["Poem 1", "Poem 2"]

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
        <h2 className="text-base font-bold text-fuchsia-400">Poetry</h2>
        <div className="size-10"></div>
      </div>

      <main className="flex-1 pb-10">
        {/* Title Section */}
        <div className="px-6 py-6 mb-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/20 text-fuchsia-400 mb-4">
            <span className="material-symbols-outlined text-sm">edit_note</span>
            <span className="text-xs font-semibold uppercase tracking-wide">From the Sermon</span>
          </div>
          <p className="text-fuchsia-400 font-bold text-sm tracking-widest uppercase mb-2">{sermonTitle}</p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white">Beautiful Verses</h1>
          <p className="mt-2 text-blue-200/70">Poetry inspired by this message.</p>
        </div>

        {/* Tabs */}
        {!isLoading && poems.length > 1 && (
          <div className="px-4 mb-6">
            <div className="flex bg-white/10 rounded-xl p-1">
              {tabLabels.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === i ? "bg-fuchsia-500 text-white shadow-md" : "text-white/70 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Poem Content */}
        <div className="px-4 mb-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <div className="size-12 rounded-full bg-fuchsia-500/20 flex items-center justify-center mb-4 animate-pulse">
                <span className="material-symbols-outlined text-fuchsia-400">edit_note</span>
              </div>
              <p className="text-blue-200/70">Crafting poetry from the sermon...</p>
            </div>
          ) : activePoem ? (
            <div className="bg-white/5 rounded-2xl overflow-hidden shadow-lg border border-white/10">
              <div className="w-full aspect-video bg-gradient-to-br from-fuchsia-900/30 to-purple-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-fuchsia-500/50 text-4xl">edit_note</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">edit_note</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white">{activePoem.title}</h3>
                    {activePoem.style && <p className="text-xs text-fuchsia-300">{activePoem.style}</p>}
                  </div>
                </div>
                <div className="prose max-w-none text-blue-100/80 leading-relaxed">
                  <p className="whitespace-pre-wrap font-serif italic text-center text-lg">{activePoem.text}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-blue-200/70">No poetry available</div>
          )}
        </div>
      </main>
    </div>
  )
}
