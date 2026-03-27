// MON-15: Follow-up cron trigger — internal route
// Called every 15 min by Vercel Cron or an external scheduler.
// Scans follow_up_events WHERE fire_at <= now() AND status = 'pending'
// Dispatches messages via existing channel handlers.
//
// Full implementation delegated to Engineer (see architecture doc).
// This stub is intentionally minimal — wire the actual dispatch logic here.

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { FOLLOW_UP_PROMPT_TEMPLATES, EventType } from '@/lib/followup-prompts';
import { generateReply } from '@/lib/claude';
import { sendTextMessage } from '@/lib/whatsapp';
import { sendDM } from '@/lib/instagram';
import { sendGbmMessage } from '@/lib/google-bm';

// Protect this route — only allow cron secret or service key
const CRON_SECRET = process.env.CRON_SECRET ?? '';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // 1. Fetch pending events due now (batch max 50 to avoid timeout)
  const { data: events, error } = await supabase
    .from('follow_up_events')
    .select(`
      *,
      upsell_mappings (recommended_product, template_key),
      venues (name, type, tone_brief)
    `)
    .eq('status', 'pending')
    .lte('fire_at', now)
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!events?.length) return NextResponse.json({ processed: 0 });

  let processed = 0;
  let failed = 0;

  for (const event of events) {
    // Mark as processing to prevent double-dispatch
    await supabase
      .from('follow_up_events')
      .update({ status: 'processing' })
      .eq('id', event.id);

    try {
      // 2. Generate message via Claude
      const templates = FOLLOW_UP_PROMPT_TEMPLATES[event.event_type as EventType];
      const systemPrompt = templates[event.language as 'fr' | 'en' | 'ru'] ?? templates.fr;

      const userContext = [
        `Venue: ${event.venues?.name} (${event.venues?.type})`,
        `Customer: ${event.customer_name ?? 'valued customer'}`,
        event.upsell_mappings?.recommended_product
          ? `Recommended: ${event.upsell_mappings.recommended_product}`
          : '',
        event.venues?.tone_brief ? `Tone: ${event.venues.tone_brief}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const { text: message } = await generateReply({
        systemPrompt,
        messages: [{ role: 'user', content: userContext }],
        maxTokens: 200,
      });

      // 3. Insert into message_schedule
      const { data: scheduled } = await supabase
        .from('message_schedule')
        .insert({
          venue_id: event.venue_id,
          follow_up_event_id: event.id,
          channel: event.customer_channel,
          recipient_id: event.customer_channel_id,
          message_content: message,
          status: 'queued',
        })
        .select()
        .single();

      // 4. Dispatch via channel
      let externalId: string | null = null;

      if (event.customer_channel === 'whatsapp' && event.customer_phone) {
        externalId = await sendTextMessage(event.customer_phone, message) || null;
      } else if (event.customer_channel === 'instagram') {
        // Instagram access token lookup via venue_channels
        const { data: channel } = await supabase
          .from('venue_channels')
          .select('access_token')
          .eq('venue_id', event.venue_id)
          .eq('channel', 'instagram')
          .single();
        if (channel?.access_token) {
          await sendDM(event.customer_channel_id, message, channel.access_token);
        }
      } else if (event.customer_channel === 'google_bm') {
        const { data: channel } = await supabase
          .from('venue_channels')
          .select('access_token')
          .eq('venue_id', event.venue_id)
          .eq('channel', 'google_bm')
          .single();
        if (channel?.access_token) {
          await sendGbmMessage(event.customer_channel_id, message, channel.access_token);
        }
      }

      // 5. Mark sent
      if (scheduled?.id) {
        await supabase
          .from('message_schedule')
          .update({ status: 'sent', sent_at: new Date().toISOString(), external_message_id: externalId })
          .eq('id', scheduled.id);
      }

      await supabase
        .from('follow_up_events')
        .update({ status: 'sent', processed_at: new Date().toISOString() })
        .eq('id', event.id);

      processed++;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const newRetryCount = (event.retry_count ?? 0) + 1;
      const backoffMin = Math.min(2 ** newRetryCount * 15, 360); // 15m, 30m, 60m… max 6h

      await supabase
        .from('follow_up_events')
        .update({
          status: newRetryCount >= 3 ? 'failed' : 'pending',
          retry_count: newRetryCount,
          last_error: errMsg,
          // Push fire_at forward for backoff
          fire_at: new Date(Date.now() + backoffMin * 60 * 1000).toISOString(),
        })
        .eq('id', event.id);

      failed++;
    }
  }

  return NextResponse.json({ processed, failed });
}
