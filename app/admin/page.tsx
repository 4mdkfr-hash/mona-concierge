"use client";

import { useEffect, useState, useRef } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Building2, Zap, DollarSign } from "lucide-react";

interface VenueRow {
  id: string;
  name: string;
  type: string;
  country: string;
  subscription_status: string;
  subscription_plan: string | null;
  onboarding_completed: boolean;
  created_at: string;
  usage: { messages: number; tokens: number; costEur: number };
}

interface AdminStats {
  venues: VenueRow[];
  totalMessages: number;
  totalCost: number;
}

const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

export default function AdminPage() {
  const router = useRouter();
  const sbRef = useRef<SupabaseClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    sbRef.current = sb;

    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/");
        return;
      }

      const email = session.user.email;
      if (SUPER_ADMIN_EMAIL && email !== SUPER_ADMIN_EMAIL) {
        router.replace("/dashboard");
        return;
      }

      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.status === 403) {
        router.replace("/dashboard");
        return;
      }

      if (!res.ok) {
        setError("Failed to load admin stats");
        setLoading(false);
        return;
      }

      setStats(await res.json());
      setLoading(false);
    });
  }, [router]);

  const refresh = async () => {
    const { data: { session } } = await sbRef.current!.auth.getSession();
    if (!session) return;
    setLoading(true);
    const res = await fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) setStats(await res.json());
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <Loader2 size={24} className="text-gold-400/50 animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-red-400 text-sm">
        {error ?? "Unauthorized"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void text-ivory p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-light text-gold-400">Super Admin</h1>
          <p className="text-sm text-fog mt-0.5">MonaConcierge control panel</p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-carbon border border-graphite text-sm text-fog hover:text-ivory transition-all"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-carbon border border-graphite rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs text-fog mb-2">
            <Building2 size={13} />
            Total Venues
          </div>
          <div className="text-3xl font-light text-ivory">{stats.venues.length}</div>
          <div className="text-xs text-fog mt-1">
            {stats.venues.filter((v) => v.onboarding_completed).length} onboarded
          </div>
        </div>
        <div className="bg-carbon border border-graphite rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs text-fog mb-2">
            <Zap size={13} />
            AI Messages (all time)
          </div>
          <div className="text-3xl font-light text-ivory">{stats.totalMessages.toLocaleString()}</div>
        </div>
        <div className="bg-carbon border border-graphite rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs text-fog mb-2">
            <DollarSign size={13} />
            AI Cost (EUR)
          </div>
          <div className="text-3xl font-light text-ivory">€{stats.totalCost.toFixed(4)}</div>
        </div>
      </div>

      {/* Venues table */}
      <div className="bg-carbon border border-graphite rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-graphite">
          <h2 className="text-sm font-semibold text-ivory">Venues</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-graphite/50">
                {["Name", "Type", "Country", "Plan", "Status", "Messages", "Cost (€)", "Onboarded", "Created"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-fog font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.venues.map((v) => (
                <tr key={v.id} className="border-b border-graphite/30 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-ivory font-medium">{v.name}</td>
                  <td className="px-4 py-3 text-fog">{v.type}</td>
                  <td className="px-4 py-3 text-fog">{v.country}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-gold-400/[0.08] text-gold-400/80">
                      {v.subscription_plan ?? "trial"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                      v.subscription_status === "active"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {v.subscription_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-mist">{v.usage.messages}</td>
                  <td className="px-4 py-3 text-mist">{v.usage.costEur.toFixed(4)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${v.onboarding_completed ? "text-emerald-400" : "text-fog"}`}>
                      {v.onboarding_completed ? "✓" : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-fog text-xs">
                    {new Date(v.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.venues.length === 0 && (
            <div className="text-center py-12 text-fog/50 text-sm">No venues found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
