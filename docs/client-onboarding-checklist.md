# Client Digital Onboarding — Step-by-Step Guide

This guide describes how a new venue owner signs up and gets activated on MonaConcierge.

---

## Step 1 — Visit the Landing Page

- Client visits `https://mona-concierge.com`
- Reads about the platform (demo chat, ROI calculator, trust badges)
- Clicks the main CTA button ("Essayer gratuitement" / "Try for free" / "Попробовать бесплатно")

---

## Step 2 — Sign Up

- Client is presented with two options:
  - **Google OAuth** — one-click sign-up with Google account
  - **Magic link** — enter email, receive a login link
- After authentication, client is redirected to `https://mona-concierge.com/dashboard`

---

## Step 3 — Complete Onboarding Form

On first login, the onboarding wizard prompts for:

- [ ] Venue name
- [ ] Venue type (restaurant / spa / salon / boutique / hotel / other)
- [ ] Address (street, city, postal code)
- [ ] Phone number (for contact, not necessarily WhatsApp)
- [ ] Preferred language for AI responses

This creates the venue record in Supabase.

---

## Step 4 — Add Services and Prices

In **Settings → Services**:

- [ ] Click "Add service"
- [ ] Enter service name, duration (minutes), and price (€)
- [ ] Repeat for all offered services
- [ ] Save

The AI concierge uses this list to answer client questions about pricing and availability.

---

## Step 5 — Connect WhatsApp (requires Twilio number)

> ⚠️ This step requires a dedicated phone number via Twilio. The existing mobile WhatsApp app will stop working on that number.

In **Settings → WhatsApp**:

- [ ] Enter the phone number to connect
- [ ] Follow the Twilio sandbox or Business API setup steps
- [ ] Send a test message to verify the connection
- [ ] Confirm messages appear in the MonaConcierge **Inbox**

*If the client does not yet have a Twilio number, skip this step and schedule for later.*

---

## Step 6 — Connect Google Calendar (optional)

In **Settings → Integrations → Google Calendar**:

- [ ] Click "Connect Google Calendar"
- [ ] Authorize calendar access via Google OAuth
- [ ] Select which calendar to use for booking availability
- [ ] Test: create a booking and verify it appears in Google Calendar

---

## Step 7 — Subscribe via Stripe

In **Settings → Billing** (or triggered at end of trial):

- [ ] Click "Subscribe — €200/month"
- [ ] Enter card details in Stripe Checkout
- [ ] Complete payment
- [ ] Verify subscription confirmation email is received
- [ ] Verify `subscription_status = 'active'` in dashboard

After payment, full platform access is activated.

---

## Step 8 — AI Goes Live

- [ ] AI concierge is now active on the connected WhatsApp number
- [ ] Send a test message from a client phone number
- [ ] Confirm AI responds within a few seconds
- [ ] Message appears in **Inbox**
- [ ] Staff can reply manually or toggle AI ON/OFF per conversation

---

## Summary Checklist

| Step | Description | Status |
|------|-------------|--------|
| 1 | Visited landing page | ☐ |
| 2 | Signed up (Google / magic link) | ☐ |
| 3 | Completed onboarding form | ☐ |
| 4 | Added services and prices | ☐ |
| 5 | Connected WhatsApp | ☐ / PENDING |
| 6 | Connected Google Calendar | ☐ / SKIP |
| 7 | Subscribed via Stripe | ☐ |
| 8 | Verified AI is responding | ☐ / PENDING |

---

*See also:*
- [`onboarding-checklist.md`](./onboarding-checklist.md) — offline intake form for collecting client information
- [`whatsapp-guide.md`](./whatsapp-guide.md) — detailed WhatsApp/Twilio setup instructions

*Prepared by: CTO*
*Last updated: 2026-04-03*
