# Stripe Live Mode Switch Checklist — MonaConcierge

Use this checklist to switch MonaConcierge from Stripe test mode to live mode.

**Prerequisites:** Stripe business verification must be completed by the Board before proceeding.

---

## Step 1 — Complete Stripe Business Verification (Board)

- [ ] Log in to [dashboard.stripe.com](https://dashboard.stripe.com)
- [ ] Navigate to Settings → Business details
- [ ] Complete all required fields (business type, address, tax ID, bank account)
- [ ] Submit for verification and wait for Stripe approval (typically 1–3 business days)
- [ ] Confirm account is fully activated (no pending verification banners)

---

## Step 2 — Create Live Product and Price

In Stripe Dashboard (live mode):

- [ ] Go to Products → Add product
- [ ] Name: `MonaConcierge Essential`
- [ ] Description: `AI-powered customer engagement platform for restaurants, boutiques, and salons`
- [ ] Pricing: `€200.00 / month` (recurring, EUR)
- [ ] Save product and copy the **Price ID** (format: `price_live_xxxxxxxx`)

---

## Step 3 — Create Live Webhook Endpoint

- [ ] Go to Developers → Webhooks → Add endpoint
- [ ] Endpoint URL: `https://mona-concierge.com/api/webhooks/stripe`
- [ ] Events to listen to:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] Copy the **Webhook Signing Secret** (format: `whsec_xxxxxxxx`)

---

## Step 4 — Get Live API Keys

- [ ] Go to Developers → API keys
- [ ] Copy **Secret key** (starts with `sk_live_`)
- [ ] Copy **Publishable key** (starts with `pk_live_`)

---

## Step 5 — Update Vercel Environment Variables

In [vercel.com](https://vercel.com) → Project `mona-concierge` → Settings → Environment Variables:

| Variable | Old value | New value |
|----------|-----------|-----------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` |
| `STRIPE_PRICE_ID` | test price ID | `price_live_...` |
| `STRIPE_WEBHOOK_SECRET` | test webhook secret | `whsec_...` (live) |

- [ ] All 4 variables updated in Vercel (Production environment)

---

## Step 6 — Redeploy

- [ ] In Vercel, trigger a new deployment (Deployments → Redeploy latest, or push a commit)
- [ ] Wait for deployment to complete (green checkmark)
- [ ] Visit `https://mona-concierge.com` and verify the site loads correctly

---

## Step 7 — Test with Real Payment

- [ ] Log in with a real account at `https://mona-concierge.com`
- [ ] Navigate to billing / subscription page
- [ ] Initiate a Stripe checkout (use a real card, e.g. a €1 test product or the €200 plan)
- [ ] Complete payment successfully
- [ ] Verify in Stripe Dashboard (live mode) → Payments that the charge appears
- [ ] **Refund the payment immediately** via Stripe Dashboard → Payments → Refund

---

## Step 8 — Verify Supabase Subscription Status

- [ ] Open Supabase Dashboard → Table Editor → `venues` (or the relevant table)
- [ ] Find the test venue used in Step 7
- [ ] Confirm `subscription_status = 'active'`
- [ ] Confirm `stripe_customer_id` and `stripe_subscription_id` are populated

---

## Rollback Plan

If issues arise after switching to live mode:

1. Revert Vercel env vars back to test keys
2. Redeploy
3. Investigate issue in test mode before re-attempting live switch

---

*Prepared by: CTO*
*Last updated: 2026-04-03*
