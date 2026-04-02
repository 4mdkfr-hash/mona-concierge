import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { authenticateRequest, authorizeVenue } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { user } = await authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get("venueId");

  if (!venueId) {
    return NextResponse.json({ error: "venueId required" }, { status: 400 });
  }

  const { authorized } = await authorizeVenue(user.id, venueId);
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("venue_services")
    .select("*")
    .eq("venue_id", venueId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const { user } = await authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { venueId, name, description, price, duration_min, category } = body;

  if (!venueId || !name) {
    return NextResponse.json({ error: "venueId and name are required" }, { status: 400 });
  }

  const { authorized } = await authorizeVenue(user.id, venueId);
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("venue_services")
    .insert({
      venue_id: venueId,
      name,
      description: description ?? null,
      price: price ?? null,
      duration_min: duration_min ?? null,
      category: category ?? null,
      active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { user } = await authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, name, description, price, duration_min, category, active, upsell_service_id } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Look up the service to get venue_id for authorization
  const { data: service } = await supabase
    .from("venue_services")
    .select("venue_id")
    .eq("id", id)
    .single();

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const { authorized } = await authorizeVenue(user.id, service.venue_id as string);
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Build update payload with only defined fields
  const updatePayload: Record<string, unknown> = {};
  if (name !== undefined) updatePayload.name = name;
  if (description !== undefined) updatePayload.description = description;
  if (price !== undefined) updatePayload.price = price;
  if (duration_min !== undefined) updatePayload.duration_min = duration_min;
  if (category !== undefined) updatePayload.category = category;
  if (active !== undefined) updatePayload.active = active;
  if ("upsell_service_id" in body) updatePayload.upsell_service_id = upsell_service_id ?? null;

  const { data, error } = await supabase
    .from("venue_services")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { user } = await authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Look up the service to get venue_id for authorization
  const { data: service } = await supabase
    .from("venue_services")
    .select("venue_id")
    .eq("id", id)
    .single();

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const { authorized } = await authorizeVenue(user.id, service.venue_id as string);
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("venue_services").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
