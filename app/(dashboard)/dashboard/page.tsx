"use client";

import { useEffect, useState } from "react";

interface Stats {
  conversations: { open: number; resolved: number };
  messages: { today: number; thisWeek: number; thisMonth: number };
  channels: Record<string, number>;
  languages: Record<string, number>;
  reviews: { total: number; avgRating: number | null; unreplied: number; replyRate: number };
  bookings: { upcoming: number };
}

// Simple SVG bar chart
function BarChart({ data, label }: { data: { name: string; value: number; color?: string }[]; label: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const H = 60;
  const barW = 24;
  const gap = 8;
  const totalW = data.length * (barW + gap) - gap;

  return (
    <div>
      <div style={{ fontSize: "0.65rem", color: "rgba(245,240,232,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>{label}</div>
      <svg width={totalW} height={H + 24} style={{ overflow: "visible" }}>
        {data.map((d, i) => {
          const barH = max > 0 ? Math.max((d.value / max) * H, 2) : 2;
          const x = i * (barW + gap);
          const y = H - barH;
          return (
            <g key={d.name}>
              <rect
                x={x} y={y} width={barW} height={barH}
                fill={d.color ?? "#C9A84C"}
                opacity={0.7}
                rx={2}
              />
              <text
                x={x + barW / 2} y={H + 14}
                textAnchor="middle"
                style={{ fontSize: "0.6rem", fill: "rgba(245,240,232,0.4)" }}
              >
                {d.name}
              </text>
              <text
                x={x + barW / 2} y={y - 4}
                textAnchor="middle"
                style={{ fontSize: "0.65rem", fill: "#C9A84C" }}
              >
                {d.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Donut / ring chart for breakdowns
function RingChart({ segments, size = 80 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return null;

  const cx = size / 2, cy = size / 2, r = size / 2 - 8;
  let angle = -Math.PI / 2;
  const paths: { d: string; color: string }[] = [];

  for (const seg of segments) {
    const portion = seg.value / total;
    const startAngle = angle;
    const endAngle = angle + portion * 2 * Math.PI;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = portion > 0.5 ? 1 : 0;

    const innerR = r * 0.55;
    const xi1 = cx + innerR * Math.cos(endAngle);
    const yi1 = cy + innerR * Math.sin(endAngle);
    const xi2 = cx + innerR * Math.cos(startAngle);
    const yi2 = cy + innerR * Math.sin(startAngle);

    paths.push({
      color: seg.color,
      d: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${xi2} ${yi2} Z`,
    });

    angle = endAngle;
  }

  return (
    <svg width={size} height={size}>
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.color} opacity={0.8} />
      ))}
    </svg>
  );
}

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: "#25D366",
  instagram: "#E1306C",
  google_bm: "#4285F4",
};

const LANG_COLORS: Record<string, string> = {
  fr: "#C9A84C",
  en: "#7C9BD4",
  ru: "#D47C7C",
  unknown: "rgba(245,240,232,0.2)",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Get venue from API
  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((convs) => {
        if (Array.isArray(convs) && convs.length > 0) {
          setVenueId(convs[0].venue_id);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!venueId) return;
    fetch(`/api/dashboard/stats?venueId=${venueId}`)
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [venueId]);

  const STAT_CARDS = stats
    ? [
        { icon: "💬", label: "Open Conversations", value: stats.conversations.open, sub: `${stats.conversations.resolved} resolved` },
        { icon: "📨", label: "Messages Today", value: stats.messages.today, sub: `${stats.messages.thisWeek} this week` },
        { icon: "📅", label: "Upcoming Bookings", value: stats.bookings.upcoming, sub: "confirmed" },
        { icon: "⭐", label: "Avg Review Rating", value: stats.reviews.avgRating ?? "—", sub: `${stats.reviews.replyRate}% reply rate` },
      ]
    : [];

  return (
    <div style={{ padding: "2rem", maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.1rem", fontWeight: 400, color: "#F5F0E8", letterSpacing: "0.02em" }}>
          Overview
        </h1>
        <p style={{ fontSize: "0.75rem", color: "rgba(245,240,232,0.35)", marginTop: "4px" }}>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ flex: 1, height: "90px", borderRadius: "6px", background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.08)", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {STAT_CARDS.map((card) => (
              <div
                key={card.label}
                style={{ padding: "1.25rem", border: "1px solid rgba(201,168,76,0.12)", borderRadius: "6px", background: "rgba(201,168,76,0.03)" }}
              >
                <div style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>{card.icon}</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 200, color: "#C9A84C", lineHeight: 1 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: "0.72rem", color: "rgba(245,240,232,0.6)", marginTop: "0.3rem" }}>{card.label}</div>
                <div style={{ fontSize: "0.65rem", color: "rgba(245,240,232,0.3)", marginTop: "2px" }}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
            {/* Message volume */}
            <div style={{ padding: "1.5rem", border: "1px solid rgba(201,168,76,0.1)", borderRadius: "6px", background: "rgba(201,168,76,0.02)" }}>
              <BarChart
                label="Message Volume"
                data={[
                  { name: "Today", value: stats.messages.today },
                  { name: "Week", value: stats.messages.thisWeek },
                  { name: "Month", value: stats.messages.thisMonth },
                ]}
              />
            </div>

            {/* Review rating distribution (5-star bars) */}
            <div style={{ padding: "1.5rem", border: "1px solid rgba(201,168,76,0.1)", borderRadius: "6px", background: "rgba(201,168,76,0.02)" }}>
              <div style={{ fontSize: "0.65rem", color: "rgba(245,240,232,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Reviews Summary
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <span style={{ fontSize: "2rem", fontWeight: 200, color: "#C9A84C" }}>{stats.reviews.avgRating ?? "—"}</span>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#C9A84C" }}>
                      {"★".repeat(Math.round(stats.reviews.avgRating ?? 0))}{"☆".repeat(5 - Math.round(stats.reviews.avgRating ?? 0))}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "rgba(245,240,232,0.35)", marginTop: "2px" }}>
                      {stats.reviews.total} reviews · {stats.reviews.replyRate}% replied
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "rgba(245,240,232,0.35)" }}>
                      {stats.reviews.unreplied} awaiting reply
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* Channel breakdown */}
            {Object.keys(stats.channels).length > 0 && (
              <div style={{ padding: "1.5rem", border: "1px solid rgba(201,168,76,0.1)", borderRadius: "6px", background: "rgba(201,168,76,0.02)" }}>
                <div style={{ fontSize: "0.65rem", color: "rgba(245,240,232,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
                  Channels
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <RingChart
                    segments={Object.entries(stats.channels).map(([k, v]) => ({
                      label: k, value: v, color: CHANNEL_COLORS[k] ?? "#C9A84C",
                    }))}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {Object.entries(stats.channels).map(([k, v]) => (
                      <div key={k} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: CHANNEL_COLORS[k] ?? "#C9A84C", display: "inline-block" }} />
                        <span style={{ color: "rgba(245,240,232,0.6)", textTransform: "capitalize" }}>{k}</span>
                        <span style={{ color: "#C9A84C", fontWeight: 600, marginLeft: "auto" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Language breakdown */}
            {Object.keys(stats.languages).length > 0 && (
              <div style={{ padding: "1.5rem", border: "1px solid rgba(201,168,76,0.1)", borderRadius: "6px", background: "rgba(201,168,76,0.02)" }}>
                <div style={{ fontSize: "0.65rem", color: "rgba(245,240,232,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
                  Languages
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <RingChart
                    segments={Object.entries(stats.languages).map(([k, v]) => ({
                      label: k, value: v, color: LANG_COLORS[k] ?? "#C9A84C",
                    }))}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {Object.entries(stats.languages).map(([k, v]) => (
                      <div key={k} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: LANG_COLORS[k] ?? "#C9A84C", display: "inline-block" }} />
                        <span style={{ color: "rgba(245,240,232,0.6)", textTransform: "uppercase" }}>{k}</span>
                        <span style={{ color: "#C9A84C", fontWeight: 600, marginLeft: "auto" }}>{v}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed rgba(201,168,76,0.15)", borderRadius: "6px", color: "rgba(245,240,232,0.3)", fontSize: "0.85rem" }}>
          No data yet — connect a venue to see your stats
        </div>
      )}
    </div>
  );
}
