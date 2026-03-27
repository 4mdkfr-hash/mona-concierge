import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { stripe, SUBSCRIPTION_PRICE_ID } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const { venueId } = await req.json();
  if (!venueId) {
    return NextResponse.json({ error: "venueId required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: venue, error } = await supabase
    .from("venues")
    .select("id, name, stripe_customer_id, subscription_status")
    .eq("id", venueId)
    .single();

  if (error || !venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  // Create Stripe customer if not yet linked
  let customerId = venue.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: venue.name,
      metadata: { venueId: venue.id },
    });
    customerId = customer.id;
    await supabase
      .from("venues")
      .update({ stripe_customer_id: customerId })
      .eq("id", venueId);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    currency: "eur",
    line_items: [
      {
        price: SUBSCRIPTION_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/dashboard?billing=success`,
    cancel_url: `${appUrl}/dashboard?billing=cancelled`,
    subscription_data: {
      metadata: { venueId: venue.id },
    },
  });

  return NextResponse.json({ url: session.url });
}
