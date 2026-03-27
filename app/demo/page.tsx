"use client";

import { useState } from "react";
import {
  DEMO_VENUES,
  DEMO_CONVERSATIONS,
  DEMO_REVIEWS,
  DEMO_BOOKINGS,
  DEMO_WEEKLY_STATS,
  DEMO_CHANNEL_STATS,
  DemoConversation,
} from "@/lib/demo-data";
import VenueTabs from "@/components/demo/VenueTabs";
import StatsRow from "@/components/demo/StatsRow";
import ConversationList from "@/components/demo/ConversationList";
import ConversationThread from "@/components/demo/ConversationThread";
import ReviewsTable from "@/components/demo/ReviewsTable";
import BookingsTable from "@/components/demo/BookingsTable";
import StickyBanner from "@/components/demo/StickyBanner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Tab = "inbox" | "bookings" | "reviews" | "stats";

export default function DemoPage() {
  const [venueId, setVenueId] = useState(DEMO_VENUES[0].id);
  const [tab, setTab] = useState<Tab>("inbox");
  const [convId, setConvId] = useState<string>(DEMO_CONVERSATIONS[0].id);

  const venue = DEMO_VENUES.find((v) => v.id === venueId)!;
  const conversations = DEMO_CONVERSATIONS.filter((c) => c.venueId === venueId);
  const reviews = DEMO_REVIEWS.filter((r) => r.venueId === venueId);
  const bookings = DEMO_BOOKINGS.filter((b) => b.venueId === venueId);
  const activeConv: DemoConversation | null =
    conversations.find((c) => c.id === convId) ?? conversations[0] ?? null;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "inbox", label: "Inbox", count: conversations.filter((c) => c.unread).length || undefined },
    { id: "bookings", label: "Réservations", count: bookings.length },
    { id: "reviews", label: "Avis", count: reviews.length },
    { id: "stats", label: "Statistiques" },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-6 pb-24 space-y-6">
      {/* Venue selector */}
      <VenueTabs venues={DEMO_VENUES} activeId={venueId} onSelect={setVenueId} />

      {/* KPI row */}
      <StatsRow venue={venue} />

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-graphite">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-all relative flex items-center gap-1.5 ${
              tab === t.id
                ? "text-ivory border-b-2 border-gold-400"
                : "text-fog hover:text-mist"
            }`}
          >
            {t.label}
            {t.count != null && t.count > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gold-400/20 text-gold-400">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "inbox" && (
        <div className="grid grid-cols-[280px_1fr] gap-4 h-[500px]">
          <div className="bg-carbon border border-graphite rounded-card overflow-y-auto p-2">
            <ConversationList
              conversations={conversations}
              activeId={activeConv?.id ?? ""}
              onSelect={setConvId}
            />
          </div>
          <div className="bg-carbon border border-graphite rounded-card overflow-hidden flex flex-col">
            <ConversationThread conversation={activeConv} />
          </div>
        </div>
      )}

      {tab === "bookings" && (
        <div>
          <h2 className="text-lg font-display font-semibold text-ivory mb-4">
            Réservations — {venue.name}
          </h2>
          {bookings.length > 0 ? (
            <BookingsTable bookings={bookings} />
          ) : (
            <p className="text-fog text-sm">Aucune réservation pour cet établissement.</p>
          )}
        </div>
      )}

      {tab === "reviews" && (
        <div>
          <h2 className="text-lg font-display font-semibold text-ivory mb-4">
            Avis Google — {venue.name}
          </h2>
          {reviews.length > 0 ? (
            <ReviewsTable reviews={reviews} />
          ) : (
            <p className="text-fog text-sm">Aucun avis pour cet établissement.</p>
          )}
        </div>
      )}

      {tab === "stats" && (
        <div className="space-y-6">
          <h2 className="text-lg font-display font-semibold text-ivory">
            Statistiques de la semaine
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {/* Weekly bar chart */}
            <div className="bg-carbon border border-graphite rounded-card p-5">
              <h3 className="text-sm font-semibold text-mist mb-4">Activité quotidienne</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={DEMO_WEEKLY_STATS} barSize={18}>
                  <XAxis dataKey="day" tick={{ fill: "#6B6B7A", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6B6B7A", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#1E2330", border: "1px solid #1E2330", borderRadius: 8, fontSize: 12 }}
                    cursor={{ fill: "rgba(212,175,55,0.05)" }}
                  />
                  <Bar dataKey="conversations" name="Conversations" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bookings" name="Réservations" fill="#25D366" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Channel pie chart */}
            <div className="bg-carbon border border-graphite rounded-card p-5">
              <h3 className="text-sm font-semibold text-mist mb-4">Canaux de messagerie</h3>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={DEMO_CHANNEL_STATS}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {DEMO_CHANNEL_STATS.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#1E2330", border: "1px solid #1E2330", borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {DEMO_CHANNEL_STATS.map((ch) => (
                    <div key={ch.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: ch.color }} />
                      <span className="text-sm text-mist">{ch.name}</span>
                      <span className="text-sm font-bold text-ivory ml-auto">{ch.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <StickyBanner />
    </main>
  );
}
