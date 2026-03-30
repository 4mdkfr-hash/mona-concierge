const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "MonaConcierge <onboarding@resend.dev>";

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error ${res.status}: ${err}`);
  }
  return res.json();
}

export async function sendNewMessageNotification(params: {
  ownerEmail: string;
  venueName: string;
  customerName: string;
  channel: string;
  messageSummary: string;
}) {
  const { ownerEmail, venueName, customerName, channel, messageSummary } = params;
  await sendEmail(
    ownerEmail,
    `💬 New message at ${venueName}`,
    `<p>A new message arrived via <strong>${channel}</strong>.</p>
     <p><strong>From:</strong> ${customerName}</p>
     <p><strong>Summary:</strong> ${messageSummary}</p>
     <hr/><p style="color:#888;font-size:12px">MonaConcierge — AI Customer Engagement</p>`
  );
}

export async function sendNewBookingNotification(params: {
  ownerEmail: string;
  venueName: string;
  customerName: string;
  customerPhone: string | null;
  service: string;
  dateTime: string;
}) {
  const { ownerEmail, venueName, customerName, customerPhone, service, dateTime } = params;
  await sendEmail(
    ownerEmail,
    `📅 New booking at ${venueName}`,
    `<p>A new booking has been made.</p>
     <p><strong>Client:</strong> ${customerName}${customerPhone ? ` (${customerPhone})` : ""}</p>
     <p><strong>Service:</strong> ${service}</p>
     <p><strong>Date/Time:</strong> ${dateTime}</p>
     <hr/><p style="color:#888;font-size:12px">MonaConcierge — AI Customer Engagement</p>`
  );
}

export async function sendNegativeReviewAlert(params: {
  ownerEmail: string;
  venueName: string;
  authorName: string;
  rating: number;
  reviewText: string;
}) {
  const { ownerEmail, venueName, authorName, rating, reviewText } = params;
  await sendEmail(
    ownerEmail,
    `⚠️ Negative review at ${venueName} (${rating}★)`,
    `<p style="color:#c0392b;font-weight:bold">Urgent: a low-rating review needs your attention.</p>
     <p><strong>Author:</strong> ${authorName}</p>
     <p><strong>Rating:</strong> ${"★".repeat(rating)}${"☆".repeat(5 - rating)} (${rating}/5)</p>
     <p><strong>Review:</strong> ${reviewText}</p>
     <hr/><p style="color:#888;font-size:12px">MonaConcierge — AI Customer Engagement</p>`
  );
}
