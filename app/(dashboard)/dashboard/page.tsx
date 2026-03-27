"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Star, Calendar, Euro } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import ChannelPieChart from "@/components/charts/ChannelPieChart";
import ActivityBarChart from "@/components/charts/ActivityBarChart";
import ChannelBadge from "@/components/dashboard/ChannelBadge";

interface Stats {
  conversations: { open: number; resolved: number };
  messages: { today: number; thisWeek: number; thisMonth: number };
  channels: Record<string, number>;
  languages: Record<string, number>;
  reviews: { total: number; avgRating: number | null; unreplied: number; replyRate: number };
  bookings: { upcoming: number };
}

interface Activity {
  id: string;
  type: string;
  description: string;
  channel?: string;
  createdAt: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.ok ? r.json() : null),
      fetch("/api/dashboard/activity").then((r) => r.ok ? r.json() : []),
    ]).then(([s, a]) => {
      setStats(s);
      setActivity(Array.isArray(a) ? a.slice(0, 10) : []);
      setLoading(false);
    });
  }, []);

  // Build weekly bar chart data from activity
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 3),
      count: 0,
    };
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-gold-400/50 text-sm tracking-widest">✦</span>
      </div>
    );
  }

  const kpi = [
    {
      label: "Messages aujourd'hui",
      value: stats?.messages.today ?? 0,
      icon: MessageSquare,
      sub: `${stats?.messages.thisMonth ?? 0} ce mois`,
    },
    {
      label: "Avis auto-répondus",
      value: `${stats?.reviews.replyRate ?? 0}%`,
      icon: Star,
      sub: `${stats?.reviews.unreplied ?? 0} en attente`,
    },
    {
      label: "Réservations confirmées",
      value: stats?.bookings.upcoming ?? 0,
      icon: Calendar,
      sub: "à venir",
    },
    {
      label: "Économies estimées",
      value: `€${((stats?.messages.thisMonth ?? 0) * 2).toFixed(0)}`,
      icon: Euro,
      sub: "vs. secrétaire temps plein",
      trendValue: "↑",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-light text-ivory">Dashboard</h1>
        <p className="text-sm text-fog mt-0.5">Vue d'ensemble de votre activité</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpi.map((k) => (
          <StatsCard key={k.label} {...k} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-carbon border border-graphite rounded-card p-5">
          <h3 className="text-sm font-semibold text-mist mb-4">Canaux de messagerie</h3>
          <ChannelPieChart data={stats?.channels ?? {}} />
        </div>

        <div className="bg-carbon border border-graphite rounded-card p-5">
          <h3 className="text-sm font-semibold text-mist mb-4">Activité — 7 derniers jours</h3>
          <ActivityBarChart data={weekData} />
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-carbon border border-graphite rounded-card p-5">
        <h3 className="text-sm font-semibold text-mist mb-4">Activité récente</h3>
        {activity.length === 0 ? (
          <p className="text-fog text-sm">Aucune activité récente.</p>
        ) : (
          <div className="space-y-2">
            {activity.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 py-2 border-b border-graphite/50 last:border-0"
              >
                <div className="text-xs text-fog w-12 flex-shrink-0">{formatTime(a.createdAt)}</div>
                <div className="flex-1 text-sm text-ivory truncate">{a.description}</div>
                {a.channel && <ChannelBadge channel={a.channel} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
