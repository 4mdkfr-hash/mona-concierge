import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { stripe, SUBSCRIPTION_PRICE_ID } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    if (!SUBSCRIPTION_PRICE_ID) {
      return NextResponse.json({ error: "STRIPE_PRICE_ID not set" }, { status: 503 });
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mona-concierge.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: SUBSCRIPTION_PRICE_ID, quantity: 1 }],
      success_url: `${appUrl}/dashboard?billing=success`,
      cancel_url: `${appUrl}/dashboard?billing=cancelled`,
      subscription_data: { metadata: { venueId: venue.id } },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Checkout error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
