// MON-15: Follow-up conversion analytics
// Full implementation delegated to Engineer (see architecture doc)

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

interface RouteContext {
  params: { id: string };
}

// GET /api/venues/:id/follow-up-stats
// Returns conversion metrics for the follow-up system
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const supabase = createServiceClient();

  const [eventsResult, sentResult, failedResult] = await Promise.all([
    supabase
      .from('follow_up_events')
      .select('event_type, status', { count: 'exact', head: false })
      .eq('venue_id', params.id),
    supabase
      .from('follow_up_events')
      .select('id', { count: 'exact', head: true })
      .eq('venue_id', params.id)
      .eq('status', 'sent'),
    supabase
      .from('follow_up_events')
      .select('id', { count: 'exact', head: true })
      .eq('venue_id', params.id)
      .eq('status', 'failed'),
  ]);

  if (eventsResult.error) {
    return NextResponse.json({ error: eventsResult.error.message }, { status: 500 });
  }

  const byType: Record<string, Record<string, number>> = {};
  for (const row of eventsResult.data ?? []) {
    if (!byType[row.event_type]) byType[row.event_type] = {};
    byType[row.event_type][row.status] = (byType[row.event_type][row.status] ?? 0) + 1;
  }

  return NextResponse.json({
    totalSent: sentResult.count ?? 0,
    totalFailed: failedResult.count ?? 0,
    byType,
  });
}
