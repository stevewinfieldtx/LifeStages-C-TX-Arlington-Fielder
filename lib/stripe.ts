// Stripe Configuration
// Simple, direct Stripe integration for web subscriptions

export const STRIPE_PRICES = {
  MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || '',
  YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || '',
} as const;

export const STRIPE_CONFIG = {
  // Your subscription product prices
  prices: {
    monthly: {
      id: STRIPE_PRICES.MONTHLY,
      amount: 500, // $5.00 in cents
      interval: 'month' as const,
      label: '$5/month',
    },
    yearly: {
      id: STRIPE_PRICES.YEARLY,
      amount: 4500, // $45.00 in cents
      interval: 'year' as const,
      label: '$45/year (Save 25%)',
    },
  },
  // Trial period in days (set to 0 to disable)
  trialDays: 7,
} as const;

// Subscription status types
export type SubscriptionStatus = 
  | 'active' 
  | 'trialing' 
  | 'past_due' 
  | 'canceled' 
  | 'unpaid' 
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused';

export interface SubscriptionData {
  id: string;
  status: SubscriptionStatus;
  priceId: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  trialEnd: number | null;
}

// Helper to check if subscription grants premium access
export function hasPremiumAccess(status: SubscriptionStatus | null): boolean {
  if (!status) return false;
  return ['active', 'trialing'].includes(status);
}
