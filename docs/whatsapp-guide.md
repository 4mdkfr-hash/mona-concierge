# WhatsApp Connection Guide — MonaConcierge

Step-by-step guide for connecting a client's WhatsApp number to the MonaConcierge platform via Twilio.

---

## Overview

MonaConcierge uses the **WhatsApp Business API** (via Twilio) to send and receive messages. This requires registering the client's phone number with Twilio and configuring the webhook to route messages to the AI.

**Timeline: 1–3 business days** (depends on Meta/WhatsApp API approval speed).

---

## ⚠️ Important Notice for Clients

> Once your WhatsApp number is connected to the Business API, **the WhatsApp mobile app will no longer work on that number**. All messages — incoming and outgoing — will be routed through the MonaConcierge dashboard.
>
> If you need to keep using WhatsApp personally, use a separate number for MonaConcierge.

---

## Step-by-Step Process

### Step 1 — Client Provides Number

The client provides the phone number they want to use for WhatsApp Business.

- Must be a valid mobile or landline number
- Must be able to receive an SMS or phone call for verification
- Should NOT already be registered on WhatsApp Business API

---

### Step 2 — Register Number in Twilio

1. Log in to the [Twilio Console](https://console.twilio.com)
2. Navigate to: **Messaging → Senders → WhatsApp Senders**
3. Click **Add WhatsApp Sender**
4. Enter the client's phone number (with country code, e.g. `+33612345678`)
5. Select verification method: **SMS** (preferred) or **Voice call**
6. Submit the registration request

---

### Step 3 — SMS Verification

1. Twilio sends a 6-digit verification code to the provided number
2. The client must read out or forward this code immediately (codes expire in ~10 minutes)
3. Enter the code in Twilio to confirm ownership
4. Twilio submits the number to Meta for WhatsApp Business API approval

> **Note:** The client must have the SIM card accessible at the time of setup.

---

### Step 4 — Add to `venue_channels`

Once the number is approved by Meta (usually same day to 3 business days):

1. Open the MonaConcierge admin dashboard
2. Go to the venue's settings → **Channels**
3. Click **Add Channel → WhatsApp**
4. Enter the Twilio-registered number and the Twilio Account SID / Auth Token
5. Save the channel configuration

> Alternatively, insert directly into the `venue_channels` table in Supabase:
> ```sql
> INSERT INTO venue_channels (venue_id, channel_type, channel_id, config)
> VALUES ('<venue_id>', 'whatsapp', '+33612345678', '{"provider": "twilio"}');
> ```

---

### Step 5 — Configure Webhook

1. In Twilio Console → **Messaging → Settings → WhatsApp Sandbox Settings** (or the approved sender)
2. Set the **Webhook URL** to:
   ```
   https://<your-domain>/api/webhook/twilio
   ```
3. HTTP Method: **POST**
4. Save settings

Verify the webhook is live by checking the MonaConcierge health endpoint:
```
GET /api/health
```

---

### Step 6 — Test

Send a test message from any WhatsApp account to the connected number.

Expected flow:
1. Message arrives at Twilio
2. Twilio forwards to webhook
3. MonaConcierge AI processes and responds within 5 seconds
4. Response delivered back via WhatsApp

**Test checklist:**
- [ ] Message received by webhook (check server logs)
- [ ] AI response generated and sent
- [ ] Correct language detected and used
- [ ] Venue-specific information referenced correctly
- [ ] Booking flow triggered (if applicable)

---

### Step 7 — Handoff to Client

Once testing passes:

1. Notify the client that setup is complete
2. Share the dashboard URL and login credentials
3. Explain that the WhatsApp app is now inactive on that number
4. Confirm the AI is live and handling messages

---

## Troubleshooting

| Issue | Likely cause | Resolution |
|-------|-------------|------------|
| Verification SMS not received | Number already on WhatsApp app | Uninstall WhatsApp app first, then retry |
| Meta approval taking >3 days | Number flagged or incomplete business profile | Contact Twilio support with the submission ID |
| Webhook not receiving messages | Wrong URL or Twilio config | Re-verify webhook URL in Twilio console |
| AI not responding | Venue not in `venue_channels` | Check Supabase config |
| Wrong language in response | Language detection misconfigured | Check venue config in dashboard |

---

## Support

For setup issues, contact: **support@monaconcierge.com**
Internal Slack: `#ops-whatsapp-setup`
