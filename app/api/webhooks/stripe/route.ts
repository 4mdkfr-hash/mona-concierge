import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

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

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as {
        customer: string;
        subscription: string;
        metadata?: { venueId?: string };
      };
      const venueId = session.metadata?.venueId;
      if (venueId) {
        await supabase
          .from("venues")
          .update({
            subscription_status: "active",
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
          })
          .eq("id", venueId);
      } else {
        await supabase
          .from("venues")
          .update({
            subscription_status: "active",
            stripe_subscription_id: session.subscription,
          })
          .eq("stripe_customer_id", session.customer);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as {
        id: string;
        customer: string;
        status: string;
      };
      await supabase
        .from("venues")
        .update({
          subscription_status: sub.status,
          stripe_subscription_id: sub.id,
        })
        .eq("stripe_customer_id", sub.customer);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as { customer: string };
      await supabase
        .from("venues")
        .update({ subscription_status: "cancelled" })
        .eq("stripe_customer_id", sub.customer);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as { customer: string };
      await supabase
        .from("venues")
        .update({ subscription_status: "past_due" })
        .eq("stripe_customer_id", invoice.customer);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
