import { NextResponse } from "next/server"
import Stripe from "stripe"
import { STRIPE_CONFIG } from "@/lib/stripe"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

function getStripeClient() {
  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY")
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: "2025-02-24.acacia",
  })
}

function getBaseUrl(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto")
  const proto = forwardedProto?.split(",")[0] || "http"
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host")
  return `${proto}://${host}`
}

export async function POST(request: Request) {
  try {
    const { priceType } = await request.json()

    if (priceType !== "monthly" && priceType !== "yearly") {
      return NextResponse.json({ error: "Invalid price type." }, { status: 400 })
    }

    const priceId = STRIPE_CONFIG.prices[priceType].id

    if (!priceId) {
      return NextResponse.json({ error: "Stripe price ID is not configured." }, { status: 500 })
    }

    const stripe = getStripeClient()
    const baseUrl = getBaseUrl(request)

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: STRIPE_CONFIG.trialDays
        ? { trial_period_days: STRIPE_CONFIG.trialDays }
        : undefined,
      success_url: `${baseUrl}/subscription?success=true`,
      cancel_url: `${baseUrl}/subscription?canceled=true`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    const message = error instanceof Error ? error.message : "Unable to start checkout."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
