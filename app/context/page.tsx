"use client"

import { useRouter } from "next/navigation"
import { useDevotional } from "@/context/devotional-context"
import { useEffect, useRef, useState } from "react"

export default function ContextPage() {
  const router = useRouter()
  const { devotional } = useDevotional()
  const context = devotional.context || {}
  const mainRef = useRef<HTMLDivElement>(null)
  const [openSection, setOpenSection] = useState<number | null>(0) // First section open by default

  useEffect(() => {
    window.scrollTo(0, 0)
    mainRef.current?.scrollTo(0, 0)
  }, [])

  const handleSectionClick = (index: number) => {
    // If clicking the open section, close it; otherwise open the clicked one
    setOpenSection(openSection === index ? null : index)
  }

  const contextItems = [
    {
      title: "Who's Talking?",
      content: context.whoIsSpeaking,
      icon: "record_voice_over",
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "Who Heard This First?",
      content: context.originalListeners,
      icon: "groups",
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "What Sparked This?",
      content: context.whyTheConversation,
      icon: "help_outline",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Picture the Scene",
      content: context.setting,
      icon: "calendar_month",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "What Was Going On?",
      content: context.historicalBackdrop,
      icon: "public",
      color: "from-rose-500 to-red-500",
    },
    {
      title: "Immediate Reactions",
      content: context.immediateImpact,
      icon: "fast_forward",
      color: "from-indigo-500 to-violet-500",
    },
    {
      title: "The Lasting Impact",
      content: context.longTermImpact,
      icon: "hourglass_bottom",
      color: "from-teal-500 to-green-500",
    },
  ]

  return (
    <div
      ref={mainRef}
      className="relative flex min-h-screen w-full flex-col bg-[#0c1929] max-w-md mx-auto shadow-2xl"
    >
      {/* Header with Hero */}
      <header className="absolute top-0 z-50 flex h-16 w-full items-center justify-between p-4">
        <button
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <button className="flex size-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      <main className="flex-1 pb-10">
        {/* Hero Image */}
        <div className="relative w-full aspect-square bg-[#0c1929]">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: `url('${devotional.contextHeroImage || "/ancient-jerusalem-historical-scene.jpg"}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1929] via-[#0c1929]/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-5 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500 text-white mb-3">
              <span className="material-symbols-outlined text-sm">history_edu</span>
              <span className="text-xs font-semibold uppercase tracking-wide">The Backstory</span>
            </div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-white">{devotional.verse?.reference}</h1>
          </div>
        </div>

        {/* Context Items - Accordion Style */}
        <div className="px-5 py-6 space-y-3">
          {contextItems.map(
            (item, i) =>
              item.content && (
                <div key={i} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden transition-all duration-300">
                  {/* Accordion Header - Always Visible */}
                  <button
                    onClick={() => handleSectionClick(i)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white`}
                      >
                        <span className="material-symbols-outlined">{item.icon}</span>
                      </div>
                      <h2 className="text-base font-bold text-white">{item.title}</h2>
                    </div>
                    <span 
                      className={`material-symbols-outlined text-white/50 transition-transform duration-300 ${
                        openSection === i ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  
                  {/* Accordion Content - Expandable */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openSection === i ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-4 pb-5 pt-0">
                      <p className="text-blue-100/80 text-[15px] leading-relaxed">{item.content}</p>
                    </div>
                  </div>
                </div>
              ),
          )}

          {/* Loading state */}
          {!context.whoIsSpeaking && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="size-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-4 animate-pulse">
                <span className="material-symbols-outlined text-amber-400">history_edu</span>
              </div>
              <p className="text-blue-200/70">Digging into the backstory...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
