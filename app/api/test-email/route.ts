import { NextRequest, NextResponse } from "next/server";

// TEMPORARY test endpoint — remove after verifying email works
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-test-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      error: "RESEND_API_KEY not set",
      hint: "Add RESEND_API_KEY to Vercel environment variables",
    }, { status: 500 });
  }

  const { to } = await req.json().catch(() => ({ to: null }));
  if (!to) {
    return NextResponse.json({ error: "Provide { to: 'email@example.com' }" }, { status: 400 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "MonaConcierge <onboarding@resend.dev>",
      to,
      subject: "MonaConcierge — Email Test",
      html: `<h2 style="color:#0F2B3C">Email integration working!</h2>
             <p style="color:#5B8FA8">This confirms Resend email delivery is operational for MonaConcierge.</p>
             <hr/>
             <p style="color:#888;font-size:12px">MonaConcierge — AI Customer Engagement</p>`,
    }),
  });

  const body = await res.json();
  return NextResponse.json({
    resendStatus: res.status,
    resendResponse: body,
    keyPrefix: apiKey.substring(0, 8) + "...",
  });
}
