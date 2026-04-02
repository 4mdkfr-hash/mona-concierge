import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { authenticateRequest, authorizeVenue } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user } = await authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversationId = params.id;
  const body = await req.json();

  const supabase = createServiceClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, venue_id")
    .eq("id", conversationId)
    .single();

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { authorized } = await authorizeVenue(user.id, conversation.venue_id as string);
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updateFields: Record<string, unknown> = {};

  if (typeof body.ai_enabled === "boolean") {
    updateFields.ai_enabled = body.ai_enabled;
  }
  if (typeof body.needs_attention === "boolean") {
    updateFields.needs_attention = body.needs_attention;
  }
  if (typeof body.status === "string") {
    updateFields.status = body.status;
  }

  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("conversations")
    .update(updateFields)
    .eq("id", conversationId)
    .select("id, ai_enabled, needs_attention, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
