import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY ?? "";
const PRICE_ID = process.env.STRIPE_PRICE_ID ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mona-concierge.com";

async function stripePost(endpoint: string, params: Record<string, string>) {
  const res = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(STRIPE_SECRET + ":").toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Stripe ${res.status}: ${err}`);
  }
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    if (!STRIPE_SECRET || !PRICE_ID) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const { venueId } = await req.json();
    if (!venueId) {
      return NextResponse.json({ error: "venueId required" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: venue, error } = await supabase
      .from("venues")
      .select("id, name, stripe_customer_id")
      .eq("id", venueId)
      .single();

    if (error || !venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    let customerId = venue.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripePost("customers", {
        name: venue.name,
        "metadata[venueId]": venue.id,
      });
      customerId = customer.id;
      await supabase
        .from("venues")
        .update({ stripe_customer_id: customerId })
        .eq("id", venueId);
    }

    const session = await stripePost("checkout/sessions", {
      customer: customerId!,
      mode: "subscription",
      "line_items[0][price]": PRICE_ID,
      "line_items[0][quantity]": "1",
      success_url: `${APP_URL}/dashboard?billing=success`,
      cancel_url: `${APP_URL}/dashboard?billing=cancelled`,
      "subscription_data[metadata][venueId]": venue.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Checkout error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
