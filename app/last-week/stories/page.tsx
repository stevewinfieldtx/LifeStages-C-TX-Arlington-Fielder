"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

interface Story {
  title: string
  text: string
  img?: string
}

export default function SermonStoriesPage() {
  const router = useRouter()
  const mainRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [stories, setStories] = useState<Story[]>([])
  const [sermonTitle, setSermonTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    mainRef.current?.scrollTo(0, 0)
    loadStories()
  }, [])

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [activeTab])

  const loadStories = async () => {
    try {
      // Get sermon data
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

      // Generate stories
      const storyRes = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verse: sermonData.scriptures[0],
          verseText: sermonData.summary,
          theme: sermonData.mainTheme
        })
      })

      if (storyRes.ok) {
        const data = await storyRes.json()
        if (data.stories && Array.isArray(data.stories)) {
          setStories(data.stories)
        } else if (data.story) {
          setStories([{ title: "Today's World", text: data.story }, { title: "Different Time", text: data.story }])
        }
      } else {
        // Fallback stories
        setStories([
          {
            title: "Today's World",
            text: "Sarah had always prided herself on her independence. As a successful entrepreneur, she built her business from nothing, working 80-hour weeks and rarely asking for help. But when her health began to fail and her business teetered on collapse, she found herself alone in a hospital room, wondering where she'd gone wrong.\n\nIt wasn't until her pastor visited and shared about the vine and branches that she understood—she'd been trying to bear fruit while completely disconnected from her source of life. Recovery became not just physical, but spiritual, as she learned that true success meant staying connected to Christ first."
          },
          {
            title: "Different Time",
            text: "Marcus watched his grandfather tend the family vineyard every summer in the hills of Tuscany. 'See this branch?' his grandfather would say, holding a withered stick. 'It tried to grow its own way, away from the vine. Now it's good for nothing but the fire.'\n\nYears later, facing a crossroads in his career, Marcus remembered those words. The lucrative job offer would take him away from his church, his community, his roots. He chose to stay connected, and though the path was harder, the fruit that came was sweeter than anything money could buy."
          }
        ])
      }
    } catch (error) {
      console.error('Error:', error)
      setStories([{ title: "Story", text: "Unable to load stories. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  const activeStory = stories[activeTab]
  const tabLabels = stories.length > 0 ? stories.map(s => s.title) : ["Today's World", "Different Time"]

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
        <h2 className="text-base font-bold text-emerald-400">Stories</h2>
        <div className="size-10"></div>
      </div>

      <main className="flex-1 pb-10">
        {/* Title Section */}
        <div className="px-6 py-6 mb-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
            <span className="material-symbols-outlined text-sm">menu_book</span>
            <span className="text-xs font-semibold uppercase tracking-wide">From the Sermon</span>
          </div>
          <p className="text-emerald-400 font-bold text-sm tracking-widest uppercase mb-2">{sermonTitle}</p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white">Stories That Hit Home</h1>
          <p className="mt-2 text-blue-200/70">See how this message plays out in everyday life.</p>
        </div>

        {/* Tabs */}
        {!isLoading && stories.length > 1 && (
          <div className="px-4 mb-6">
            <div className="flex bg-white/10 rounded-xl p-1">
              {tabLabels.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === i ? "bg-emerald-500 text-white shadow-md" : "text-white/70 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Story Content */}
        <div className="px-4 mb-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <div className="size-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 animate-pulse">
                <span className="material-symbols-outlined text-emerald-400">menu_book</span>
              </div>
              <p className="text-blue-200/70">Crafting stories from the sermon...</p>
            </div>
          ) : activeStory ? (
            <div className="bg-white/5 rounded-2xl overflow-hidden shadow-lg border border-white/10">
              {activeStory.img ? (
                <img alt={activeStory.title} className="w-full aspect-video object-cover" src={activeStory.img} />
              ) : (
                <div className="w-full aspect-video bg-gradient-to-br from-emerald-900/30 to-teal-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-500/50 text-4xl">auto_stories</span>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">auto_stories</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-white">{activeStory.title}</h3>
                </div>
                <div className="prose max-w-none text-blue-100/80 leading-relaxed text-[16px]">
                  <p className="whitespace-pre-wrap">{activeStory.text}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-blue-200/70">No stories available</div>
          )}
        </div>
      </main>
    </div>
  )
}
