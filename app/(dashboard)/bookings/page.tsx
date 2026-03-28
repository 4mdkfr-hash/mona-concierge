"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Users, MapPin, Check, X, Loader2 } from "lucide-react";

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  date: string;
  time: string;
  party_size: number;
  status: "confirmed" | "pending" | "cancelled" | "no_show";
  channel: string;
  notes: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  confirmed: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Confirmed" },
  pending: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Pending" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-400", label: "Cancelled" },
  no_show: { bg: "bg-fog/10", text: "text-fog", label: "No-show" },
};

const DEMO_BOOKINGS: Booking[] = [
  { id: "1", customer_name: "Marie Dupont", customer_phone: "+33 6 12 34 56 78", date: "2026-03-28", time: "20:00", party_size: 4, status: "confirmed", channel: "whatsapp", notes: "Table en terrasse", created_at: "2026-03-27T14:00:00Z" },
  { id: "2", customer_name: "James Wilson", customer_phone: "+44 7911 123456", date: "2026-03-28", time: "19:30", party_size: 2, status: "confirmed", channel: "whatsapp", notes: null, created_at: "2026-03-27T10:30:00Z" },
  { id: "3", customer_name: "Олег Петров", customer_phone: "+7 916 555 1234", date: "2026-03-29", time: "21:00", party_size: 6, status: "pending", channel: "instagram", notes: "Anniversaire", created_at: "2026-03-27T18:00:00Z" },
  { id: "4", customer_name: "Sophie Martin", customer_phone: "+33 6 98 76 54 32", date: "2026-03-29", time: "12:30", party_size: 3, status: "confirmed", channel: "google_bm", notes: null, created_at: "2026-03-26T09:00:00Z" },
  { id: "5", customer_name: "Alessandro Rossi", customer_phone: "+39 333 456 7890", date: "2026-03-30", time: "20:30", party_size: 8, status: "pending", channel: "whatsapp", notes: "Business dinner, private room", created_at: "2026-03-27T16:00:00Z" },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setBookings(Array.isArray(data) && data.length > 0 ? data : DEMO_BOOKINGS);
        setLoading(false);
      })
      .catch(() => {
        setBookings(DEMO_BOOKINGS);
        setLoading(false);
      });
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const filtered = bookings.filter((b) => {
    if (filter === "upcoming") return b.date >= today;
    if (filter === "past") return b.date < today;
    return true;
  });

  const upcoming = bookings.filter((b) => b.date >= today && b.status !== "cancelled").length;
  const pending = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-light text-ivory">Reservations</h1>
          <p className="text-sm text-fog mt-0.5">{upcoming} upcoming &middot; {pending} pending</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-carbon rounded-xl p-1 w-fit">
        {(["upcoming", "all", "past"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? "bg-gold-400/10 text-gold-400"
                : "text-fog hover:text-mist"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={20} className="text-gold-400/50 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-fog/50 text-sm">No reservations found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const status = STATUS_STYLES[b.status] ?? STATUS_STYLES.pending;
            return (
              <div
                key={b.id}
                className="bg-carbon border border-graphite rounded-2xl p-5 hover:border-gold-400/15 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-400/[0.08] border border-gold-400/[0.12] flex items-center justify-center text-gold-400 font-semibold text-sm">
                      {b.customer_name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-ivory">{b.customer_name}</div>
                      {b.customer_phone && (
                        <div className="text-xs text-fog">{b.customer_phone}</div>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-lg font-medium ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center gap-5 text-xs text-mist/70">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-fog" />
                    {new Date(b.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-fog" />
                    {b.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={13} className="text-fog" />
                    {b.party_size} pers.
                  </span>
                  {b.notes && (
                    <span className="flex items-center gap-1.5 text-fog/50 italic">
                      {b.notes}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
