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

function getBaseUrl(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto")
  const proto = forwardedProto?.split(",")[0] || "http"
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host")
  return `${proto}://${host}`
}

export async function POST(request: Request) {
  try {
    const { customerId } = await request.json()

    if (!customerId || typeof customerId !== "string") {
      return NextResponse.json({ error: "Missing Stripe customer ID." }, { status: 400 })
    }

    const stripe = getStripeClient()
    const baseUrl = getBaseUrl(request)

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/subscription`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe portal error:", error)
    const message = error instanceof Error ? error.message : "Unable to open billing portal."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
