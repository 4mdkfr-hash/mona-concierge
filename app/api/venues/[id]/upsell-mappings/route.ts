// MON-15: Upsell Mappings CRUD — owner dashboard routes
// Full implementation delegated to Engineer (see architecture doc)

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

interface RouteContext {
  params: { id: string };
}

// GET /api/venues/:id/upsell-mappings
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('upsell_mappings')
    .select('*')
    .eq('venue_id', params.id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/venues/:id/upsell-mappings
export async function POST(req: NextRequest, { params }: RouteContext) {
  const supabase = createServiceClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from('upsell_mappings')
    .insert({ ...body, venue_id: params.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/venues/:id/upsell-mappings  (bulk update active flag, etc.)
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const supabase = createServiceClient();
  const body = await req.json();
  const { mappingId, ...updates } = body;

  if (!mappingId) return NextResponse.json({ error: 'mappingId required' }, { status: 400 });

  const { data, error } = await supabase
    .from('upsell_mappings')
    .update(updates)
    .eq('id', mappingId)
    .eq('venue_id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/venues/:id/upsell-mappings?mappingId=...
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const supabase = createServiceClient();
  const mappingId = req.nextUrl.searchParams.get('mappingId');

  if (!mappingId) return NextResponse.json({ error: 'mappingId required' }, { status: 400 });

  const { error } = await supabase
    .from('upsell_mappings')
    .delete()
    .eq('id', mappingId)
    .eq('venue_id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
