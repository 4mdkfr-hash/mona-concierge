import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      // @ts-expect-error — Stripe SDK requires apiVersion but we use latest
      apiVersion: "2024-12-18.acacia",
    })
  : null;

export const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_PRICE_ID ?? "";
export const MONTHLY_PRICE_EUR = 200;
