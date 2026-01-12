"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MessageCircle } from "lucide-react"

// Lifeline topics for sermon context
const LIFELINE_TOPICS = [
  { id: "new-baby", label: "New Baby at Home", icon: "child_care", category: "celebration" },
  { id: "newly-married", label: "Newly Married", icon: "favorite", category: "celebration" },
  { id: "new-job", label: "Starting a New Job", icon: "work", category: "celebration" },
  { id: "retirement", label: "Entering Retirement", icon: "beach_access", category: "celebration" },
  { id: "marriage-struggles", label: "Marriage Struggles", icon: "heart_broken", category: "family" },
  { id: "divorce", label: "Going Through Divorce", icon: "link_off", category: "family" },
  { id: "single-parenting", label: "Single Parenting", icon: "escalator_warning", category: "family" },
  { id: "prodigal-child", label: "Wayward Child", icon: "directions_walk", category: "family" },
  { id: "infertility", label: "Infertility Journey", icon: "nest_cam_wired_stand", category: "family" },
  { id: "aging-parents", label: "Caring for Aging Parents", icon: "elderly", category: "family" },
  { id: "cancer-fighting", label: "Fighting Cancer", icon: "healing", category: "health" },
  { id: "chronic-illness", label: "Chronic Illness", icon: "medical_services", category: "health" },
  { id: "grief", label: "Grieving a Death", icon: "sentiment_very_dissatisfied", category: "health" },
  { id: "depression", label: "Depression", icon: "cloud", category: "mental" },
  { id: "anxiety", label: "Anxiety & Worry", icon: "psychology", category: "mental" },
  { id: "loneliness", label: "Loneliness & Isolation", icon: "person_off", category: "mental" },
  { id: "burnout", label: "Burnout & Exhaustion", icon: "battery_0_bar", category: "mental" },
  { id: "job-loss", label: "Job Loss", icon: "work_off", category: "work" },
  { id: "financial-crisis", label: "Financial Crisis", icon: "money_off", category: "work" },
  { id: "faith-doubt", label: "Doubting My Faith", icon: "help", category: "faith" },
  { id: "feeling-far-from-god", label: "Feeling Far from God", icon: "cloud_off", category: "faith" },
  { id: "purpose", label: "Finding My Purpose", icon: "lightbulb", category: "faith" },
]

interface SermonData {
  title: string
  date: string
  summary: string
  scriptures: string[]
  mainTheme: string
}

export default function LastWeekPage() {
  const router = useRouter()
  const [sermon, setSermon] = useState<SermonData | null>(null)
  const [interpretation, setInterpretation] = useState("")
  const [heroImage, setHeroImage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showLifelinesModal, setShowLifelinesModal] = useState(false)

  useEffect(() => {
    loadSermon()
  }, [])

  const loadSermon = async () => {
    try {
      const sermonRes = await fetch('/api/sermon/last-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchId: 'fielder-church' })
      })

      const sermonData: SermonData = sermonRes.ok ? await sermonRes.json() : {
        title: "Abiding in the Vine",
        date: "January 5, 2026",
        summary: "Jesus calls us to remain connected to Him as branches to a vine. Apart from Him, we can do nothing of eternal significance. But when we abide in His love, we bear fruit that lasts.",
        scriptures: ["John 15:1-11"],
        mainTheme: "Connection and Fruitfulness"
      }
      setSermon(sermonData)

      // Get personalized interpretation
      try {
        const devRes = await fetch('/api/devotional-from-sermon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sermon: sermonData,
            userProfile: { age: 35, gender: 'male', lifeStage: 'general' }
          })
        })
        if (devRes.ok) {
          const devData = await devRes.json()
          setInterpretation(devData.interpretation || "")
          if (devData.heroImage) setHeroImage(devData.heroImage)
        }
      } catch {
        setInterpretation(`This message about "${sermonData.mainTheme}" speaks to where you are right now. What would it look like for you to truly apply this teaching this week?`)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Feature buttons - NO Context, NO Songs for sermon
  const features = [
    {
      label: "Stories",
      sub: "Real-life moments",
      icon: "auto_stories",
      path: "/last-week/stories",
      iconBg: "bg-emerald-500",
      textColor: "text-emerald-600",
    },
    {
      label: "Poetry",
      sub: "Beautiful verses",
      icon: "edit_note",
      path: "/last-week/poetry",
      iconBg: "bg-fuchsia-500",
      textColor: "text-fuchsia-600",
    },
    {
      label: "Imagery",
      sub: "Visual symbols",
      icon: "image",
      path: "/last-week/imagery",
      iconBg: "bg-cyan-500",
      textColor: "text-cyan-600",
    },
    {
      label: "Lifelines",
      sub: "Help for hard times",
      icon: "explore",
      path: "",
      iconBg: "bg-violet-500",
      textColor: "text-violet-600",
      isLifelines: true,
    },
  ]

  const handleLifelinesSelect = (topicId: string) => {
    const topic = LIFELINE_TOPICS.find(t => t.id === topicId)
    if (topic) {
      setShowLifelinesModal(false)
      router.push(`/last-week/lifelines?topic=${encodeURIComponent(topic.label)}`)
    }
  }

  const handleLetsTalk = () => {
    const message = encodeURIComponent(`I'd like to talk about last week's sermon: "${sermon?.title}"`)
    window.open(`sms:?body=${message}`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col max-w-md mx-auto bg-[#0c1929] items-center justify-center">
        <div className="size-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white text-lg">Loading last week's message...</p>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-[#0c1929] shadow-2xl">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <button onClick={() => router.push("/")} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Lifelines Modal */}
      {showLifelinesModal && (
        <div className="fixed inset-0 z-[100] bg-[#0c1929] overflow-hidden">
          <div className="flex flex-col h-full max-w-md mx-auto">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-violet-600 to-purple-600 text-white shrink-0">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">explore</span>
                <div>
                  <h3 className="font-bold">Lifelines</h3>
                  <p className="text-xs text-white/80">Based on the sermon</p>
                </div>
              </div>
              <button 
                onClick={() => setShowLifelinesModal(false)}
                className="size-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-blue-200/70 text-sm mb-6">Select a life situation to see how this sermon speaks to you:</p>
              <div className="space-y-6">
                {["celebration", "family", "health", "mental", "work", "faith"].map(category => (
                  <div key={category}>
                    <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-3 capitalize">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {LIFELINE_TOPICS.filter(t => t.category === category).map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleLifelinesSelect(topic.id)}
                          className="flex items-center gap-2 p-3 rounded-xl border border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all text-left"
                        >
                          <span className="material-symbols-outlined text-violet-400">{topic.icon}</span>
                          <span className="text-sm font-medium text-white">{topic.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center px-6 pt-16 pb-4">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Last Week's Message</span>
          <h1 className="text-2xl font-bold text-white">{sermon?.title}</h1>
          <p className="text-blue-200/60 text-sm mt-1">{sermon?.date}</p>
        </div>

        {/* Hero Image */}
        <div className="px-4 pb-4">
          {heroImage ? (
            <img src={heroImage} alt="Sermon" className="w-full rounded-xl shadow-lg"/>
          ) : (
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-amber-900/40 to-orange-900/40 rounded-xl flex items-center justify-center border border-amber-400/20">
              <div className="text-center p-6">
                <span className="material-symbols-outlined text-5xl text-amber-400/60 mb-2">church</span>
                <p className="text-amber-200/70 font-medium">{sermon?.mainTheme}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sermon Summary */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-amber-400/40"></div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Message</span>
            <div className="h-px w-10 bg-amber-400/40"></div>
          </div>
          <p className="font-serif text-lg leading-relaxed text-white text-center mb-3">
            &ldquo;{sermon?.summary}&rdquo;
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {sermon?.scriptures.map((ref, i) => (
              <span key={i} className="px-3 py-1 bg-amber-400/20 rounded-full text-xs text-amber-300 font-medium">{ref}</span>
            ))}
          </div>
        </div>

        {/* Friendly Breakdown */}
        {interpretation && (
          <div className="px-4 pb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-amber-400/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-lg">auto_awesome</span>
                </div>
                <h2 className="text-base font-bold text-white">Friendly Breakdown</h2>
              </div>
              <p className="text-blue-100/80 text-sm leading-relaxed">{interpretation}</p>
            </div>
          </div>
        )}

        {/* Dive Deeper - White Card */}
        <div className="px-4 pb-4">
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Dive Deeper</h2>
            
            {/* 2x2 Grid - Stories, Poetry, Imagery, Lifelines */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {features.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (item.isLifelines) {
                      setShowLifelinesModal(true)
                    } else {
                      router.push(item.path)
                    }
                  }}
                  className="flex flex-col items-start p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all active:scale-[0.98] hover:shadow-md text-left"
                >
                  <div className={`size-10 rounded-full ${item.iconBg} text-white flex items-center justify-center mb-3`}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.label}</span>
                  <span className={`text-xs ${item.textColor} mt-0.5 font-medium`}>{item.sub}</span>
                </button>
              ))}
            </div>

            {/* Let's Talk - Full Width */}
            <button
              onClick={handleLetsTalk}
              className="w-full flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all active:scale-[0.98] hover:shadow-md"
            >
              <div className="size-10 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-bold text-gray-900 block">Let's Talk</span>
                <span className="text-xs text-indigo-600 font-medium">Discuss this sermon</span>
              </div>
              <span className="material-symbols-outlined text-gray-400">arrow_forward</span>
            </button>
          </div>
        </div>

      </main>
    </div>
  )
}
