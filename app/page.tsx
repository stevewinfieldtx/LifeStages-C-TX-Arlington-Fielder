"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDevotional } from "@/context/devotional-context"
import { useSubscription } from "@/context/subscription-context"
import { useLanguage } from "@/context/language-context"
import { HeaderDropdown } from "@/components/header-dropdown"
import { Facebook, Youtube, Instagram } from "lucide-react"

// ============================================
// FIELDER CHURCH CONFIGURATION
// ============================================
const churchConfig = {
  name: "FIELDER",
  tagline: "Your Church Home",
  socialLinks: {
    facebook: "https://www.facebook.com/fielderchurch",
    youtube: "https://www.youtube.com/fielderchurch",
    twitter: "https://twitter.com/fielderchurch",
    tiktok: "https://www.tiktok.com/@fielderchurch",
    instagram: "https://www.instagram.com/fielderchurch"
  }
}

// TikTok icon (not in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

// Twitter/X icon
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

export default function LandingPage() {
  const router = useRouter()
  const { devotional, isLoading, loadingStates, generateDevotional } = useDevotional()
  const { canAccessPremium } = useSubscription()
  const { t } = useLanguage()
  const [hasGenerated, setHasGenerated] = useState(false)

  useEffect(() => {
    if (!devotional.verse && !isLoading && !hasGenerated) {
      setHasGenerated(true)
      generateDevotional("YouVersion")
    }
  }, [devotional.verse, isLoading, hasGenerated, generateDevotional])

  const hasVerse = !!devotional.verse
  const hasInterpretation = !!devotional.interpretation
  const hasImage = !!devotional.heroImage

  const premiumFeatures = [
    { icon: "auto_stories", label: "Stories", color: "text-emerald-400" },
    { icon: "edit_note", label: "Poetry", color: "text-fuchsia-400" },
    { icon: "image", label: "Imagery", color: "text-cyan-400" },
    { icon: "music_note", label: "Songs", color: "text-rose-400" },
    { icon: "history_edu", label: "Context", color: "text-orange-400" },
    { icon: "explore", label: "Lifelines", color: "text-violet-400" },
  ]

  const iconClass = "w-6 h-6 text-white hover:text-amber-400 transition-colors"

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-[#0c1929] shadow-2xl">
      {/* Three Dots Menu */}
      <div className="absolute top-4 right-4 z-20">
        <HeaderDropdown verseReference={devotional.verse?.reference} />
      </div>

      <main className="flex-1 overflow-y-auto">
        
        {/* ===== FIELDER CHURCH HEADER ===== */}
        <div className="flex flex-col items-center text-center px-6 pt-8 pb-4">
          <div className="mb-2">
            <h1 className="text-4xl font-black tracking-tight text-white">
              <span className="text-amber-400 mr-1">☰☰</span>{churchConfig.name}
            </h1>
          </div>
          <p className="text-lg text-white/90 font-medium mb-4">{churchConfig.tagline}</p>
          
          {/* Social Media Icons */}
          <div className="flex items-center gap-4 mb-4">
            <a href={churchConfig.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
              <Facebook className={iconClass} />
            </a>
            <a href={churchConfig.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
              <Youtube className={iconClass} />
            </a>
            <a href={churchConfig.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
              <XIcon className={iconClass} />
            </a>
            <a href={churchConfig.socialLinks.tiktok} target="_blank" rel="noopener noreferrer">
              <TikTokIcon className={iconClass} />
            </a>
            <a href={churchConfig.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
              <Instagram className={iconClass} />
            </a>
          </div>
        </div>

        {/* ===== LAST WEEK BUTTON ===== */}
        <div className="px-6 pb-4">
          <button
            onClick={() => router.push("/last-week")}
            className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-lg shadow-lg transition-all border border-white/20"
          >
            Last Week
          </button>
        </div>

        {/* ===== HERO IMAGE ===== */}
        <div className="w-full px-4">
          {hasImage ? (
            <img src={devotional.heroImage} alt="Verse illustration" className="w-full h-auto rounded-xl shadow-lg"/>
          ) : hasVerse ? (
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-xl flex items-center justify-center border border-white/10">
              <div className="text-center">
                <div className="size-8 border-3 border-amber-400/50 border-t-amber-400 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-blue-200/50">Creating your image...</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* ===== VERSE OF THE DAY ===== */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-amber-400/40"></div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Verse of the Day</span>
            <div className="h-px w-10 bg-amber-400/40"></div>
          </div>

          {hasVerse ? (
            <div className="text-center">
              <p className="font-serif text-xl leading-relaxed text-white mb-4">
                &ldquo;{devotional.verse!.text}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-6 bg-blue-200/30"></div>
                <p className="text-sm text-blue-200/70 font-medium">{devotional.verse!.reference}</p>
                <div className="h-px w-6 bg-blue-200/30"></div>
              </div>
            </div>
          ) : loadingStates.verse ? (
            <div className="flex flex-col items-center py-6">
              <div className="size-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-blue-200/70 text-sm">Finding today&apos;s verse...</p>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-blue-200/70">Unable to load verse. Please try again.</p>
            </div>
          )}
        </div>

        {/* ===== FRIENDLY BREAKDOWN ===== */}
        <div className="px-6 pb-6">
          {hasInterpretation ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-amber-400/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-lg">auto_awesome</span>
                </div>
                <h2 className="text-base font-bold text-white">Friendly Breakdown</h2>
              </div>
              <p className="text-blue-100/80 text-sm leading-relaxed">{devotional.interpretation}</p>
            </div>
          ) : hasVerse && loadingStates.interpretation ? (
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-9 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="size-5 border-2 border-amber-400/50 border-t-amber-400 rounded-full animate-spin"></div>
                </div>
                <h2 className="text-base font-bold text-white/50">Personalizing for you...</h2>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-white/10 rounded animate-pulse w-4/6"></div>
              </div>
            </div>
          ) : null}
        </div>

        {/* ===== PREMIUM CONTENT ACCESS ===== */}
        {canAccessPremium ? (
          <>
            <div className="px-6 pb-4">
              <p className="text-center text-lg font-semibold text-amber-100">&ldquo;Customized For Your Life...&rdquo;</p>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => router.push("/verse")}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                Make the verse come to life...
              </button>
            </div>
          </>
        ) : (
          <div className="px-4 pb-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-fuchsia-900/80 border border-white/10">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
              <div className="relative p-5">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 mb-3">
                    <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Premium</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Bring Scripture to Life</h3>
                  <p className="text-sm text-blue-200/60 mt-1">Unlock personalized content for your journey</p>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {premiumFeatures.map((feature) => (
                    <div key={feature.label} className="flex flex-col items-center p-2 rounded-xl bg-white/5">
                      <span className={`material-symbols-outlined ${feature.color} text-xl mb-1`}>{feature.icon}</span>
                      <span className="text-xs text-white/80">{feature.label}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => router.push("/subscription")}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-transform"
                >
                  Start Free 7-Day Trial
                </button>
                <p className="text-center text-xs text-blue-200/40 mt-2">Then $5/month · Cancel anytime</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
