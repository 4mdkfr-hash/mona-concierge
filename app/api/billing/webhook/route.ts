import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

// Untyped client for raw updates in webhook handler
function rawClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = rawClient();

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const sub = event.data.object as { customer: string; status: string; id: string };
    await supabase
      .from("venues")
      .update({ subscription_status: sub.status, stripe_subscription_id: sub.id })
      .eq("stripe_customer_id", sub.customer);
  } else if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as { customer: string };
    await supabase
      .from("venues")
      .update({ subscription_status: "cancelled" })
      .eq("stripe_customer_id", sub.customer);
  }

  return NextResponse.json({ received: true });
}
