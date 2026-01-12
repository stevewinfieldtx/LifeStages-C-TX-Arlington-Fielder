"use client"

import { useRouter } from "next/navigation"
import { useDevotional } from "@/context/devotional-context"
import { useEffect, useRef, useState } from "react"

export default function PoetryPage() {
  const router = useRouter()
  const { devotional } = useDevotional()
  const poems = devotional.poetry || []
  const mainRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<"classic" | "freeverse">("classic")

  useEffect(() => {
    window.scrollTo(0, 0)
    mainRef.current?.scrollTo(0, 0)
  }, [])

  const activePoem = activeTab === "classic" ? poems[0] : poems[1]

  return (
    <div
      ref={mainRef}
      className="relative flex min-h-screen w-full flex-col bg-[#0c1929] max-w-md mx-auto shadow-2xl"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#0c1929]/95 p-4 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-base font-bold text-purple-400">Poetry</h2>
        <button className="flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>

      <main className="flex-1 px-5 pt-6 pb-20">
        {/* Verse Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 mb-4">
            <span className="material-symbols-outlined text-sm">edit_note</span>
            <span className="text-xs font-semibold uppercase tracking-wide">Poetic Reflections</span>
          </div>
          <h1 className="font-serif text-2xl font-light leading-snug md:text-3xl text-white">
            {devotional.verse?.text ? `"${devotional.verse.text.split(" ").slice(0, 8).join(" ")}..."` : "Loading..."}
          </h1>
          <p className="mt-2 text-sm font-semibold tracking-wide text-blue-200/70">
            {devotional.verse?.reference}
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("classic")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === "classic"
                ? "bg-purple-500 text-white shadow-lg"
                : "bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            Classic Verse
          </button>
          <button
            onClick={() => setActiveTab("freeverse")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === "freeverse"
                ? "bg-purple-500 text-white shadow-lg"
                : "bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            Free Verse
          </button>
        </div>

        {/* Single Poem Display */}
        {!activePoem ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="size-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 animate-pulse">
              <span className="material-symbols-outlined text-purple-400">edit_note</span>
            </div>
            <p className="text-blue-200/70">Crafting poetry...</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg">
            <div className="aspect-video w-full bg-gradient-to-br from-purple-900/30 to-pink-900/30">
              {activePoem.img ? (
                <img
                  alt="Poem visual"
                  className="w-full h-full object-cover"
                  src={activePoem.img || "/placeholder.svg"}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-4xl text-purple-500/50">filter_vintage</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <span className="material-symbols-outlined text-lg">edit_note</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{activePoem.title}</h2>
                  <span className="text-xs text-purple-400 font-medium">{activePoem.type}</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-6 mt-4">
                <div className="text-blue-100/80 leading-loose text-center font-serif italic">
                  {activePoem.text.split("\n").map((line, lineIdx) => (
                    <p key={lineIdx} className={line.trim() === "" ? "h-4" : "mb-1"}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
