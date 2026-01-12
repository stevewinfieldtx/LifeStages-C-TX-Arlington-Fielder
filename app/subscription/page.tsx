"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useSubscription } from "@/context/subscription-context"
import { Card } from "@/components/ui/card"
import { useState, useEffect, Suspense } from "react"

function SubscriptionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { 
    tier, 
    isTrialActive, 
    daysLeftInTrial, 
    voiceUsage,
    isLoading,
    isPremium,
    checkout,
    openPortal,
    customerId,
  } = useSubscription()
  
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Check for success or canceled state from URL
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      const newSubscription = {
        status: 'trialing',
        customerId: 'pending',
        currentPeriodEnd: Date.now() + (7 * 24 * 60 * 60 * 1000),
        trialEnd: Date.now() + (7 * 24 * 60 * 60 * 1000),
        updatedAt: Date.now(),
      }
      localStorage.setItem('bible_subscription', JSON.stringify(newSubscription))
      setShowSuccess(true)
      window.history.replaceState({}, '', '/subscription')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
    
    if (searchParams.get('canceled') === 'true') {
      setError('Purchase was canceled. Feel free to try again when ready.')
    }
  }, [searchParams, router])

  const freeFeatures = [
    "Daily verse with friendly description",
  ]

  const premiumFeatures = [
    "All free features",
    "7-day free trial",
    "Personalized Stories",
    "Inspiring Poetry & Hymns",
    "Visual Imagery & Symbols",
    "Worship Songs & Music",
    "Biblical Context & Backstory",
    "Life Situations",
    "Lifelines",
    "Unlimited text chat",
    "Thoughtful Customization",
    "AI that truly knows you",
  ]

  const handlePurchase = async (priceType: 'monthly' | 'yearly') => {
    console.log('handlePurchase called with:', priceType)
    setIsPurchasing(true)
    setError(null)

    try {
      console.log('Calling checkout...')
      await checkout(priceType)
      console.log('Checkout completed (should have redirected)')
    } catch (err) {
      console.error('Purchase error:', err)
      setError(err instanceof Error ? err.message : "Failed to start checkout. Please try again.")
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      await openPortal()
    } catch (err) {
      setError("Failed to open subscription management. Please try again.")
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-[#0c1929] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-[#0c1929] shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-[#0c1929]/95 backdrop-blur-md p-4 justify-between border-b border-white/10">
        <button
          onClick={() => router.push("/")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-base font-bold text-white">Choose Your Plan</h2>
        <div className="w-10"></div>
      </div>

      <main className="flex-1 px-4 py-6 overflow-y-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm">
            🎉 Welcome to Premium! Your subscription is now active.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="space-y-4">
          {/* Free Tier */}
          <Card className={`p-5 bg-[#0f2137] border-white/10 ${tier === "free" ? "border-white/30" : "opacity-60"}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Free</h3>
                <p className="text-2xl font-bold text-gray-400">$0</p>
              </div>
              {tier === "free" && (
                <span className="px-2 py-1 bg-white/10 rounded text-xs font-semibold text-white/70">Current</span>
              )}
            </div>
            <ul className="space-y-2">
              {freeFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="material-symbols-outlined text-gray-500 text-base mt-0.5">check</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Premium Tier */}
          <Card className={`p-5 border-2 ${tier === "premium" || tier === "trial" ? "border-green-500" : "border-primary"} bg-gradient-to-br from-amber-50 to-orange-50`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-primary">Premium</h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-primary">
                    $5<span className="text-sm font-normal text-gray-500">/month</span>
                  </p>
                </div>
              </div>
              {(tier === "premium" || tier === "trial") && (
                <span className="px-2 py-1 bg-green-200 rounded text-xs font-semibold text-green-800">
                  {tier === "trial" ? "Trial" : "Current"}
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {premiumFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="material-symbols-outlined text-primary text-base mt-0.5">check</span>
                  <span className="font-medium text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* CTA Buttons - Outside cards, at bottom */}
        {tier === "free" && (
          <div className="mt-6 space-y-3">
            <button
              onClick={() => handlePurchase('monthly')}
              disabled={isPurchasing}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-base shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {isPurchasing ? "Opening checkout..." : "Free Trial — then $5/mo"}
            </button>
            
            <button
              onClick={() => handlePurchase('yearly')}
              disabled={isPurchasing}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-base shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>Free Trial — then $45/yr</span>
              <span className="text-xs bg-green-400 text-green-900 px-2 py-0.5 rounded-full font-bold">Save 25%</span>
            </button>
            
            <p className="text-xs text-center text-blue-200/50 mt-2">
              Cancel anytime during trial. Secure payment via Stripe.
            </p>
          </div>
        )}

        {/* Already Premium - Manage Subscription */}
        {(tier === "premium" || tier === "trial") && (
          <div className="text-center py-8 space-y-4">
            <p className="text-blue-200/70">Thank you for supporting Bible for Life Stages!</p>
            {customerId && customerId !== 'pending' && (
              <button 
                onClick={handleManageSubscription} 
                className="px-6 py-3 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                Manage Subscription
              </button>
            )}
            <button 
              onClick={() => router.push("/")} 
              className="block mx-auto text-blue-200/50 hover:text-white transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Trial Banner */}
        {isTrialActive && (
          <div className="mt-6 p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-200 text-center">
              <strong>Trial ends in {daysLeftInTrial} days.</strong> Your subscription will start automatically unless you cancel.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-[#0c1929] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  )
}
