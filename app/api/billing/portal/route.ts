import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

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
    .select("id, stripe_customer_id")
    .eq("id", venueId)
    .single();

  if (error || !venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  if (!venue.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe customer linked to this venue" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: venue.stripe_customer_id,
    return_url: `${appUrl}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
