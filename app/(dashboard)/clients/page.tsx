"use client";

import { useEffect, useState } from "react";
import { Users, Star, Phone, Clock, Pencil, Check, X, Loader2, Crown } from "lucide-react";

interface ClientProfile {
  id: string;
  phone: string | null;
  full_name: string | null;
  preferred_name: string | null;
  language: string;
  favourite_services: string[];
  disliked_services: string[];
  allergies: string[];
  notes: string | null;
  visit_count: number;
  last_visit_at: string | null;
  last_service: string | null;
  vip_tier: "standard" | "regular" | "vip";
  created_at: string;
}

const DEMO_CLIENTS: ClientProfile[] = [
  { id: "1", phone: "+33 6 12 34 56 78", full_name: "Marie Dupont", preferred_name: "Marie", language: "fr", favourite_services: ["Massage 60 min", "Facial"], disliked_services: [], allergies: ["latex"], notes: "Prefers quiet room, arrives early", visit_count: 12, last_visit_at: "2026-03-27T14:00:00Z", last_service: "Massage 60 min", vip_tier: "vip", created_at: "2025-10-01T00:00:00Z" },
  { id: "2", phone: "+7 916 555 1234", full_name: "Анна Соколова", preferred_name: null, language: "ru", favourite_services: ["Manicure"], disliked_services: ["acrylic"], allergies: [], notes: null, visit_count: 5, last_visit_at: "2026-03-25T10:00:00Z", last_service: "Manicure", vip_tier: "regular", created_at: "2025-12-01T00:00:00Z" },
  { id: "3", phone: "+44 7911 123456", full_name: "James Wilson", preferred_name: "James", language: "en", favourite_services: ["Deep tissue massage"], disliked_services: [], allergies: [], notes: null, visit_count: 2, last_visit_at: "2026-03-20T16:00:00Z", last_service: "Deep tissue massage", vip_tier: "standard", created_at: "2026-02-01T00:00:00Z" },
];

const VIP_STYLES: Record<string, { bg: string; text: string; icon?: boolean }> = {
  vip: { bg: "bg-gold-400/10", text: "text-gold-400", icon: true },
  regular: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  standard: { bg: "bg-fog/10", text: "text-fog" },
};

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setClients(Array.isArray(data) && data.length > 0 ? data : DEMO_CLIENTS);
        setLoading(false);
      })
      .catch(() => {
        setClients(DEMO_CLIENTS);
        setLoading(false);
      });
  }, []);

  const selected = clients.find((c) => c.id === selectedId) ?? null;

  const startEditNotes = (c: ClientProfile) => {
    setEditingNotes(c.id);
    setNotesValue(c.notes ?? "");
  };

  const saveNotes = async (id: string) => {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesValue.trim() || null }),
      });
      if (res.ok) {
        const updated = await res.json();
        setClients((prev) => prev.map((c) => (c.id === id ? { ...c, notes: updated.notes } : c)));
      }
    } finally {
      setSavingNotes(false);
      setEditingNotes(null);
    }
  };

  const vipCount = clients.filter((c) => c.vip_tier === "vip").length;
  const regularCount = clients.filter((c) => c.vip_tier === "regular").length;

  return (
    <div className="p-6 flex gap-6 h-full">
      {/* Left — client list */}
      <div className="w-80 shrink-0 space-y-4">
        <div>
          <h1 className="font-display text-2xl font-light text-ivory flex items-center gap-2">
            <Users size={20} className="text-gold-400" />
            Clients
          </h1>
          <p className="text-sm text-fog mt-0.5">
            {clients.length} total &middot; {vipCount} VIP &middot; {regularCount} regular
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="text-gold-400/50 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {clients.map((c) => {
              const tier = VIP_STYLES[c.vip_tier] ?? VIP_STYLES.standard;
              const name = c.preferred_name ?? c.full_name ?? c.phone ?? "Unknown";
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedId === c.id
                      ? "border-gold-400/30 bg-gold-400/[0.04]"
                      : "border-graphite bg-carbon hover:border-gold-400/15"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ivory">{name}</span>
                      {c.vip_tier === "vip" && <Crown size={12} className="text-gold-400" />}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${tier.bg} ${tier.text}`}>
                      {c.vip_tier.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-fog">
                    <span className="flex items-center gap-1">
                      <Star size={10} />
                      {c.visit_count} visits
                    </span>
                    {c.last_visit_at && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(c.last_visit_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right — client detail */}
      {selected ? (
        <div className="flex-1 space-y-4">
          <div className="bg-carbon border border-graphite rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-medium text-ivory">
                  {selected.preferred_name ?? selected.full_name ?? "Unknown"}
                </h2>
                {selected.full_name && selected.preferred_name && (
                  <p className="text-xs text-fog mt-0.5">{selected.full_name}</p>
                )}
              </div>
              <span className={`text-xs px-3 py-1 rounded-lg font-medium ${VIP_STYLES[selected.vip_tier]?.bg} ${VIP_STYLES[selected.vip_tier]?.text}`}>
                {selected.vip_tier.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {selected.phone && (
                <div className="flex items-center gap-2 text-mist">
                  <Phone size={13} className="text-fog" />
                  {selected.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-mist">
                <Star size={13} className="text-fog" />
                {selected.visit_count} visits
              </div>
              {selected.last_visit_at && (
                <div className="flex items-center gap-2 text-mist">
                  <Clock size={13} className="text-fog" />
                  Last: {new Date(selected.last_visit_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              )}
              {selected.last_service && (
                <div className="text-mist">
                  <span className="text-fog mr-1">Last service:</span>
                  {selected.last_service}
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-carbon border border-graphite rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-ivory">Preferences & Alerts</h3>
            {selected.favourite_services.length > 0 && (
              <div>
                <p className="text-xs text-fog mb-1.5">Favourite services</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.favourite_services.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg text-xs bg-gold-400/[0.08] text-gold-400/80">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {selected.allergies.length > 0 && (
              <div>
                <p className="text-xs text-fog mb-1.5">⚠️ Allergies / contraindications</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.allergies.map((a) => (
                    <span key={a} className="px-2.5 py-1 rounded-lg text-xs bg-red-500/[0.08] text-red-400/80">{a}</span>
                  ))}
                </div>
              </div>
            )}
            {selected.favourite_services.length === 0 && selected.allergies.length === 0 && (
              <p className="text-xs text-fog/50">No preferences recorded yet.</p>
            )}
          </div>

          {/* Notes */}
          <div className="bg-carbon border border-graphite rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-ivory">Staff Notes</h3>
              {editingNotes !== selected.id && (
                <button
                  onClick={() => startEditNotes(selected)}
                  className="flex items-center gap-1 text-xs text-fog hover:text-gold-400 transition-colors"
                >
                  <Pencil size={12} />
                  Edit
                </button>
              )}
            </div>

            {editingNotes === selected.id ? (
              <div className="space-y-2">
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 rounded-xl bg-void border border-graphite text-sm text-ivory focus:border-gold-400/40 focus:outline-none resize-none transition-colors"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => saveNotes(selected.id)}
                    disabled={savingNotes}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-400 text-void text-xs font-semibold disabled:opacity-50"
                  >
                    {savingNotes ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                    Save
                  </button>
                  <button
                    onClick={() => setEditingNotes(null)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-graphite text-fog text-xs"
                  >
                    <X size={11} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-mist/70 leading-relaxed">
                {selected.notes ?? <span className="text-fog/40 italic">No notes yet.</span>}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-fog/40 text-sm">
          Select a client to view their profile
        </div>
      )}
    </div>
  );
}
