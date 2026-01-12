"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { hasPremiumAccess, type SubscriptionStatus } from "@/lib/stripe"

type SubscriptionTier = "free" | "trial" | "premium"

interface VoiceUsage {
  checkInsUsed: number
  checkInsLimit: number
  lastResetDate: string
}

interface SubscriptionContextType {
  // Subscription state
  tier: SubscriptionTier
  isLoading: boolean
  customerId: string | null
  subscriptionStatus: SubscriptionStatus | null
  
  // Computed properties
  isPremium: boolean
  canAccessPremium: boolean
  canAccessCore: boolean
  canSearchCustomVerse: boolean
  
  // Voice usage
  voiceUsage: VoiceUsage
  canUseVoice: boolean
  useVoiceCheckIn: () => boolean
  
  // Trial state
  isTrialActive: boolean
  daysLeftInTrial: number
  trialEndsAt: number | null
  
  // Actions
  checkout: (priceType: 'monthly' | 'yearly') => Promise<void>
  openPortal: () => Promise<void>
  refreshSubscription: () => void
  
  // Legacy compatibility
  startTrial: () => void
  upgradeToPaid: (plan: "core" | "premium" | "premium-yearly") => void
  
  // For backwards compatibility with old context
  offerings: null
  restore: () => Promise<boolean>
  purchase: (pkg: unknown) => Promise<boolean>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

// Storage keys
const STORAGE_KEYS = {
  SUBSCRIPTION: 'bible_subscription',
  VOICE_USAGE: 'voiceUsage',
  CUSTOMER_ID: 'stripe_customer_id',
}

// Voice check-in limits by tier
const VOICE_LIMITS = {
  free: 1,      // 1 per week
  trial: 999,   // Essentially unlimited during trial
  premium: 999, // Unlimited
}

// Helper function to check if new week
function isNewWeek(lastDate: string, currentDate: string): boolean {
  const last = new Date(lastDate)
  const current = new Date(currentDate)
  
  const lastMonday = new Date(last)
  lastMonday.setDate(last.getDate() - last.getDay() + 1)
  
  const currentMonday = new Date(current)
  currentMonday.setDate(current.getDate() - current.getDay() + 1)
  
  return currentMonday > lastMonday
}

interface StoredSubscription {
  status: SubscriptionStatus
  customerId: string
  currentPeriodEnd: number
  trialEnd: number | null
  updatedAt: number
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<StoredSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [voiceUsage, setVoiceUsage] = useState<VoiceUsage>({
    checkInsUsed: 0,
    checkInsLimit: VOICE_LIMITS.free,
    lastResetDate: new Date().toISOString().split("T")[0],
  })

  // Determine subscription tier
  const tier = useMemo((): SubscriptionTier => {
    if (!subscription) return "free"
    if (subscription.status === "trialing") return "trial"
    if (hasPremiumAccess(subscription.status)) return "premium"
    return "free"
  }, [subscription])

  // Computed properties
  const isPremium = tier === "premium"
  const isTrialActive = tier === "trial"
  const canAccessPremium = isPremium || isTrialActive
  const canAccessCore = canAccessPremium // Core = Premium for now
  const canSearchCustomVerse = canAccessCore
  const customerId = subscription?.customerId || null
  const subscriptionStatus = subscription?.status || null

  // Trial ends at
  const trialEndsAt = useMemo(() => {
    if (!isTrialActive || !subscription?.trialEnd) return null
    return subscription.trialEnd
  }, [isTrialActive, subscription])

  // Calculate days left in trial
  const daysLeftInTrial = useMemo(() => {
    if (!trialEndsAt) return 0
    const msLeft = trialEndsAt - Date.now()
    return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))
  }, [trialEndsAt])

  // Load subscription from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION)
      if (stored) {
        const parsed = JSON.parse(stored) as StoredSubscription
        // Check if subscription is still valid (not expired)
        if (parsed.currentPeriodEnd > Date.now()) {
          setSubscription(parsed)
        } else {
          // Subscription expired, clear it
          localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION)
        }
      }
    } catch {
      // Invalid data, ignore
    }
    setIsLoading(false)
  }, [])

  // Check for subscription success from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('subscription') === 'success') {
      // User just completed checkout - they have premium now
      // In a real app, you'd verify this with your backend
      // For now, we'll set a trial subscription that can be verified later
      const newSubscription: StoredSubscription = {
        status: 'trialing',
        customerId: 'pending', // Will be updated by webhook
        currentPeriodEnd: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
        trialEnd: Date.now() + (7 * 24 * 60 * 60 * 1000),
        updatedAt: Date.now(),
      }
      setSubscription(newSubscription)
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(newSubscription))
      
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Load voice usage from localStorage
  useEffect(() => {
    const savedVoiceUsage = localStorage.getItem(STORAGE_KEYS.VOICE_USAGE)
    if (savedVoiceUsage) {
      try {
        const parsed = JSON.parse(savedVoiceUsage)
        const today = new Date().toISOString().split("T")[0]
        
        if (isNewWeek(parsed.lastResetDate, today)) {
          const newUsage = {
            checkInsUsed: 0,
            checkInsLimit: VOICE_LIMITS.free,
            lastResetDate: today,
          }
          setVoiceUsage(newUsage)
          localStorage.setItem(STORAGE_KEYS.VOICE_USAGE, JSON.stringify(newUsage))
        } else {
          setVoiceUsage(parsed)
        }
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, [])

  // Update voice limits when tier changes
  useEffect(() => {
    const newLimit = VOICE_LIMITS[tier] ?? VOICE_LIMITS.free
    setVoiceUsage(prev => {
      const updated = { ...prev, checkInsLimit: newLimit }
      localStorage.setItem(STORAGE_KEYS.VOICE_USAGE, JSON.stringify(updated))
      return updated
    })
  }, [tier])

  // Voice usage
  const canUseVoice = isPremium || isTrialActive || voiceUsage.checkInsUsed < voiceUsage.checkInsLimit

  const useVoiceCheckIn = useCallback((): boolean => {
    if (isPremium || isTrialActive) return true
    
    if (voiceUsage.checkInsUsed >= voiceUsage.checkInsLimit) {
      return false
    }
    
    const newUsage = {
      ...voiceUsage,
      checkInsUsed: voiceUsage.checkInsUsed + 1,
    }
    setVoiceUsage(newUsage)
    localStorage.setItem(STORAGE_KEYS.VOICE_USAGE, JSON.stringify(newUsage))
    return true
  }, [isPremium, isTrialActive, voiceUsage])

  // Checkout - redirects to Stripe
  const checkout = useCallback(async (priceType: 'monthly' | 'yearly') => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceType }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout failed:', error)
      throw error
    }
  }, [])

  // Open customer portal
  const openPortal = useCallback(async () => {
    if (!customerId || customerId === 'pending') {
      console.warn('No customer ID available')
      return
    }

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Portal failed:', error)
    }
  }, [customerId])

  // Refresh subscription (would typically call your backend)
  const refreshSubscription = useCallback(() => {
    // In a full implementation, this would call your backend
    // to get the latest subscription status from Stripe
    console.log('Refresh subscription - implement backend verification')
  }, [])

  // Legacy functions for backwards compatibility
  const startTrial = useCallback(() => {
    checkout('monthly')
  }, [checkout])

  const upgradeToPaid = useCallback((plan: "core" | "premium" | "premium-yearly") => {
    checkout(plan === 'premium-yearly' ? 'yearly' : 'monthly')
  }, [checkout])

  // Backwards compatibility stubs
  const restore = useCallback(async (): Promise<boolean> => {
    console.log('Restore not needed with Stripe - subscriptions are tied to email')
    return false
  }, [])

  const purchase = useCallback(async (): Promise<boolean> => {
    await checkout('monthly')
    return true
  }, [checkout])

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        isLoading,
        customerId,
        subscriptionStatus,
        isPremium,
        canAccessPremium,
        canAccessCore,
        canSearchCustomVerse,
        voiceUsage,
        canUseVoice,
        useVoiceCheckIn,
        isTrialActive,
        daysLeftInTrial,
        trialEndsAt,
        checkout,
        openPortal,
        refreshSubscription,
        startTrial,
        upgradeToPaid,
        // Backwards compatibility
        offerings: null,
        restore,
        purchase,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}
