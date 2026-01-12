import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

function getStripeClient() {
  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY")
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: "2025-02-24.acacia",
  })
}

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Missing checkout session ID." }, { status: 400 })
    }

    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    })

    const subscription = typeof session.subscription === "string"
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found for session." }, { status: 404 })
    }

    return NextResponse.json({
      customerId: session.customer,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end * 1000,
      trialEnd: subscription.trial_end ? subscription.trial_end * 1000 : null,
    })
  } catch (error) {
    console.error("Stripe session error:", error)
    const message = error instanceof Error ? error.message : "Unable to verify checkout session."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
