"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState, Suspense } from "react"

function LifelinesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topic = searchParams.get('topic') || 'General'
  const mainRef = useRef<HTMLDivElement>(null)
  const [lifeline, setLifeline] = useState<{ title: string; content: string; application: string[] } | null>(null)
  const [sermonTitle, setSermonTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    mainRef.current?.scrollTo(0, 0)
    loadLifeline()
  }, [topic])

  const loadLifeline = async () => {
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

      // Generate lifeline content based on topic and sermon
      // In production, this would call an API
      const lifelineContent = generateLifelineContent(topic, sermonData)
      setLifeline(lifelineContent)

    } catch (error) {
      console.error('Error:', error)
      setLifeline({
        title: topic,
        content: "This sermon speaks to your situation in powerful ways.",
        application: ["Reflect on how this message applies to you."]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateLifelineContent = (topic: string, sermon: any) => {
    // Topic-specific content connecting sermon to life situation
    const topicContent: { [key: string]: { content: string; application: string[] } } = {
      "Burnout & Exhaustion": {
        content: `When you're running on empty, this message about "${sermon.mainTheme}" hits different. You've been trying to produce—at work, at home, in your faith—through sheer willpower. But Jesus says something radical: fruitfulness isn't about trying harder. It's about staying connected.\n\nThe branch doesn't strain to produce grapes. It simply stays attached to the vine, and fruit happens naturally. Your exhaustion might be a sign that you've been trying to manufacture what only comes through abiding.`,
        application: [
          "This week, identify one area where you're striving instead of abiding. What would it look like to 'stay attached' instead of 'try harder'?",
          "Schedule 10 minutes of silence each morning—not to pray a list, but just to be present with God.",
          "Ask yourself: Am I tired because of good work, or because I'm working disconnected from my Source?"
        ]
      },
      "Anxiety & Worry": {
        content: `Anxiety often comes from trying to control outcomes that aren't ours to control. This sermon about ${sermon.mainTheme} reminds us of a freeing truth: we're not the vine. We're branches.\n\nBranches don't worry about producing fruit. They don't stress about the weather or the soil. Their only job is to stay connected. The Gardener handles the rest. Your anxiety might be rooted in taking on responsibilities that belong to the Vine, not the branch.`,
        application: [
          "Write down your top 3 worries. For each one, ask: 'Is this a branch responsibility or a Vine responsibility?'",
          "When anxiety rises, practice this breath prayer: Inhale - 'I am the branch.' Exhale - 'You are the Vine.'",
          "Identify one 'fruit' you've been trying to force. Release it to the Gardener this week."
        ]
      },
      "Marriage Struggles": {
        content: `When marriage is hard, we often focus on what our spouse isn't giving us. But this sermon about ${sermon.mainTheme} reframes everything. You can't pour out what hasn't been poured in.\n\nMaybe the disconnect in your marriage reflects a deeper disconnect from the Source. When we try to get from our spouse what only Christ can give—complete acceptance, unconditional love, perfect understanding—we set them up to fail.`,
        application: [
          "Before addressing issues with your spouse this week, spend time 'abiding' first. Come to conversations filled, not empty.",
          "Ask yourself: What am I demanding from my spouse that I should be receiving from Christ?",
          "Practice one act of 'fruit-bearing' love toward your spouse each day—not to get something back, but because you're connected to the Vine."
        ]
      },
      "Job Loss": {
        content: `Losing your job can feel like being cut off—from purpose, identity, provision. This sermon about ${sermon.mainTheme} speaks directly to that fear. But here's the truth: your job was never your vine.\n\nYou haven't been cut off from your true Source. This season of pruning, as painful as it is, might be the Gardener preparing you for greater fruitfulness. The branch that gets pruned is the one the Gardener believes in.`,
        application: [
          "Each morning, before job searching, spend 15 minutes reminding yourself who you are apart from work—a branch connected to the Vine.",
          "Make a list of 'fruit' you've produced in past roles. Remember: that fruit came from connection, not just competence.",
          "Ask God to show you how this pruning might be purposeful, not punitive."
        ]
      },
      "Grief": {
        content: `Grief can make us feel severed—from joy, from hope, from the person we lost. This sermon about ${sermon.mainTheme} doesn't minimize your pain, but it offers a lifeline: even in grief, you're still connected.\n\nThe branch doesn't feel the sap flowing sometimes. Winter comes and everything looks dead. But the connection is still there, beneath the surface, waiting for spring. Your grief is not evidence of disconnection from God—it's evidence of deep love, which is itself fruit of the Vine.`,
        application: [
          "Give yourself permission to not 'produce' right now. Even dormant branches are still connected.",
          "Find one small way to 'abide' each day—a verse, a song, a moment of honesty with God about how you feel.",
          "Remember: Jesus wept. Grief and connection to the Vine can coexist."
        ]
      },
      "Depression": {
        content: `Depression lies. It tells you you're disconnected, worthless, cut off. This sermon about ${sermon.mainTheme} tells you the truth: the Gardener doesn't abandon struggling branches.\n\nSometimes abiding looks like barely holding on. Sometimes fruit looks like getting out of bed. The vine doesn't reject the branch having a hard season—it keeps sending life, even when the branch can't feel it.`,
        application: [
          "Today's only goal: Stay connected. That might mean a single verse, a worship song in the background, or simply saying 'I'm still here, God.'",
          "Don't measure fruitfulness by productivity. Endurance is fruit. Survival is fruit.",
          "If professional help is needed, remember: seeking a counselor is like a branch accepting the Gardener's care, not evidence of weak faith."
        ]
      },
      "Feeling Far from God": {
        content: `You've drifted and you know it. This sermon about ${sermon.mainTheme} might feel like conviction, but it's actually invitation. The Vine hasn't moved. The connection is still possible.\n\nHere's the good news: reconnecting doesn't require a lengthy process. The branch doesn't have to earn its way back to the vine. It just has to turn back and receive what's been there all along.`,
        application: [
          "Stop trying to 'feel' your way back. Abiding isn't a feeling—it's a position. Position yourself in God's presence, even if you feel nothing.",
          "Confess the drift without wallowing in it. Then receive grace immediately—don't add a waiting period God never required.",
          "Start small: one verse, one honest prayer, one worship song. The sap will start flowing again."
        ]
      }
    }

    const defaultContent = {
      content: `This sermon about "${sermon.mainTheme}" speaks to wherever you are right now. The invitation to abide isn't just for easy seasons—it's especially for hard ones.\n\nWhatever you're facing, remember: branches don't produce fruit through effort. They produce fruit through connection. Your situation doesn't disqualify you from fruitfulness—it's actually an invitation to deeper abiding.`,
      application: [
        "Identify one way you've been 'striving' instead of 'abiding' in this season.",
        "What does staying connected to Jesus look like practically this week, given what you're facing?",
        "Who in your life models 'abiding' well? Consider reaching out to them."
      ]
    }

    const content = topicContent[topic] || defaultContent

    return {
      title: topic,
      ...content
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
        <h2 className="text-base font-bold text-violet-400">Lifelines</h2>
        <div className="size-10"></div>
      </div>

      <main className="flex-1 pb-10">
        {/* Title Section */}
        <div className="px-6 py-6 mb-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 text-violet-400 mb-4">
            <span className="material-symbols-outlined text-sm">explore</span>
            <span className="text-xs font-semibold uppercase tracking-wide">From the Sermon</span>
          </div>
          <p className="text-violet-400 font-bold text-sm tracking-widest uppercase mb-2">{sermonTitle}</p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white">{topic}</h1>
          <p className="mt-2 text-blue-200/70">How this message speaks to your situation.</p>
        </div>

        {/* Lifeline Content */}
        <div className="px-4 mb-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <div className="size-12 rounded-full bg-violet-500/20 flex items-center justify-center mb-4 animate-pulse">
                <span className="material-symbols-outlined text-violet-400">explore</span>
              </div>
              <p className="text-blue-200/70">Finding your lifeline...</p>
            </div>
          ) : lifeline ? (
            <div className="space-y-6">
              {/* Main Content */}
              <div className="bg-white/5 rounded-2xl overflow-hidden shadow-lg border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">explore</span>
                  </div>
                  <h3 className="font-bold text-lg text-white">For You</h3>
                </div>
                <p className="text-blue-100/80 leading-relaxed whitespace-pre-wrap">{lifeline.content}</p>
              </div>

              {/* Application Steps */}
              <div className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 rounded-2xl p-6 border border-violet-400/20">
                <h4 className="font-bold text-violet-300 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">checklist</span>
                  This Week
                </h4>
                <div className="space-y-4">
                  {lifeline.application.map((step, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="size-6 rounded-full bg-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs text-violet-300 font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-blue-100/80 text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-blue-200/70">No content available</div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function SermonLifelinesPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full flex-col max-w-md mx-auto bg-[#0c1929] items-center justify-center">
        <div className="size-16 border-4 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LifelinesContent />
    </Suspense>
  )
}
