"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  Globe,
  Clock,
  MessageSquare,
  Save,
  Check,
  UtensilsCrossed,
  Plus,
  Trash2,
  Pencil,
  X,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const TONES = [
  { id: "professional", label: "Professional", desc: "Formal and courteous tone" },
  { id: "friendly", label: "Friendly", desc: "Warm and approachable" },
  { id: "luxury", label: "Luxury", desc: "Elegant, refined language" },
];

const LANGUAGES = [
  { id: "fr", label: "Francais", flag: "FR" },
  { id: "en", label: "English", flag: "EN" },
  { id: "ru", label: "Русский", flag: "RU" },
];

const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp Business", connected: true },
  { id: "instagram", label: "Instagram DMs", connected: false },
  { id: "google_bm", label: "Google Business Messages", connected: true },
  { id: "google_reviews", label: "Google Reviews Auto-reply", connected: true },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface VenueService {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration_min: number | null;
  category: string | null;
  active: boolean;
}

interface ServiceForm {
  name: string;
  description: string;
  price: string;
  duration_min: string;
  category: string;
}

const CATEGORIES = ["Face", "Body", "Massage", "Nails", "Hair", "Other"];
const EMPTY_FORM: ServiceForm = { name: "", description: "", price: "", duration_min: "", category: "" };

// For demo, use the first demo venue id from seed data
const DEMO_VENUE_ID = "00000000-0000-0000-0000-000000000001";

export default function SettingsPage() {
  const [venueName, setVenueName] = useState("Le Grill Monaco");
  const [tone, setTone] = useState("luxury");
  const [activeLangs, setActiveLangs] = useState(["fr", "en", "ru"]);
  const [openTime, setOpenTime] = useState("12:00");
  const [closeTime, setCloseTime] = useState("23:00");
  const [openDays, setOpenDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  const [saved, setSaved] = useState(false);

  // Services
  const [services, setServices] = useState<VenueService[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [savingService, setSavingService] = useState(false);

  // AI Preview
  const [aiPreview, setAiPreview] = useState<string | null>(null);
  const [aiPreviewLoading, setAiPreviewLoading] = useState(false);
  const [aiPreviewError, setAiPreviewError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/settings/services?venueId=${DEMO_VENUE_ID}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]));
  }, []);

  const toggleLang = (id: string) => {
    setActiveLangs((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const toggleDay = (d: string) => {
    setOpenDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const startEdit = (s: VenueService) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description ?? "",
      price: s.price != null ? String(s.price) : "",
      duration_min: s.duration_min != null ? String(s.duration_min) : "",
      category: s.category ?? "",
    });
    setShowAddForm(false);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const saveService = async () => {
    if (!form.name.trim()) return;
    setSavingService(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: form.price ? parseFloat(form.price) : null,
        duration_min: form.duration_min ? parseInt(form.duration_min) : null,
        category: form.category.trim() || null,
      };

      if (editingId) {
        const res = await fetch("/api/settings/services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        if (res.ok) {
          const updated = await res.json();
          setServices((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
        }
      } else {
        const res = await fetch("/api/settings/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ venueId: DEMO_VENUE_ID, ...payload }),
        });
        if (res.ok) {
          const created = await res.json();
          setServices((prev) => [...prev, created]);
        }
      }
      cancelForm();
    } finally {
      setSavingService(false);
    }
  };

  const deleteService = async (id: string) => {
    const res = await fetch(`/api/settings/services?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const loadAiPreview = async () => {
    setAiPreviewLoading(true);
    setAiPreviewError(null);
    try {
      const res = await fetch("/api/settings/services/ai-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueId: DEMO_VENUE_ID }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setAiPreview(data.preview);
    } catch (e) {
      setAiPreviewError(e instanceof Error ? e.message : "Error");
    } finally {
      setAiPreviewLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-light text-ivory">Settings</h1>
        <p className="text-sm text-fog mt-0.5">Configure your venue and AI assistant</p>
      </div>

      {/* Venue Name */}
      <section className="bg-carbon border border-graphite rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ivory flex items-center gap-2">
          <Globe size={16} className="text-gold-400" />
          Venue Information
        </h2>
        <div>
          <label className="block text-xs text-fog mb-1.5">Venue name</label>
          <input
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-void border border-graphite text-sm text-ivory focus:border-gold-400/40 focus:outline-none transition-colors"
          />
        </div>
      </section>

      {/* Menu / Services */}
      <section className="bg-carbon border border-graphite rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ivory flex items-center gap-2">
            <UtensilsCrossed size={16} className="text-gold-400" />
            Menu / Services
          </h2>
          {!showAddForm && !editingId && (
            <button
              onClick={() => { setShowAddForm(true); setForm(EMPTY_FORM); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-400/10 text-gold-400 text-xs font-medium hover:bg-gold-400/20 transition-all"
            >
              <Plus size={13} />
              Add service
            </button>
          )}
        </div>

        {/* Add / Edit Form */}
        {(showAddForm || editingId) && (
          <div className="bg-void border border-graphite rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-fog mb-1">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Massage 60 min"
                  className="w-full px-3 py-2 rounded-lg bg-carbon border border-graphite text-sm text-ivory focus:border-gold-400/40 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-fog mb-1">Price (EUR)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="120"
                  className="w-full px-3 py-2 rounded-lg bg-carbon border border-graphite text-sm text-ivory focus:border-gold-400/40 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-fog mb-1">Duration (min)</label>
                <input
                  type="number"
                  value={form.duration_min}
                  onChange={(e) => setForm({ ...form, duration_min: e.target.value })}
                  placeholder="60"
                  className="w-full px-3 py-2 rounded-lg bg-carbon border border-graphite text-sm text-ivory focus:border-gold-400/40 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-fog mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-carbon border border-graphite text-sm text-ivory focus:border-gold-400/40 focus:outline-none transition-colors"
                >
                  <option value="">— Select —</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-fog mb-1">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description"
                  className="w-full px-3 py-2 rounded-lg bg-carbon border border-graphite text-sm text-ivory focus:border-gold-400/40 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={saveService}
                disabled={savingService || !form.name.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold-400 text-void text-xs font-semibold hover:bg-gold-500 transition-all disabled:opacity-50"
              >
                <Check size={13} />
                {editingId ? "Update" : "Add"}
              </button>
              <button
                onClick={cancelForm}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-graphite text-fog text-xs hover:text-mist transition-all"
              >
                <X size={13} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Services list */}
        {services.length === 0 && !showAddForm ? (
          <p className="text-xs text-fog/50 py-2">No services added yet. Add your menu items or services to help AI answer customer questions.</p>
        ) : (
          <div className="space-y-2">
            {services.map((s) => (
              <div
                key={s.id}
                className={`flex items-center justify-between py-3 px-4 rounded-xl border transition-all ${
                  editingId === s.id ? "border-gold-400/30 bg-gold-400/[0.03]" : "border-graphite/50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-ivory font-medium">{s.name}</span>
                    {s.category && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-400/[0.08] text-gold-400/70">
                        {s.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-fog">
                    {s.price != null && <span>{s.price} EUR</span>}
                    {s.duration_min != null && <span>{s.duration_min} min</span>}
                    {s.description && <span className="truncate">{s.description}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => startEdit(s)}
                    className="p-1.5 rounded-lg text-fog hover:text-gold-400 hover:bg-gold-400/[0.06] transition-all"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => deleteService(s.id)}
                    className="p-1.5 rounded-lg text-fog hover:text-red-400 hover:bg-red-400/[0.06] transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* AI Preview */}
        <div className="mt-4 border-t border-graphite/40 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-ivory flex items-center gap-2">
              <Sparkles size={13} className="text-gold-400" />
              AI Preview
            </h3>
            <button
              onClick={loadAiPreview}
              disabled={aiPreviewLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-400/10 text-gold-400 text-xs font-medium hover:bg-gold-400/20 transition-all disabled:opacity-50"
            >
              <RefreshCw size={12} className={aiPreviewLoading ? "animate-spin" : ""} />
              {aiPreviewLoading ? "Generating…" : "Preview"}
            </button>
          </div>

          {aiPreviewError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/20 text-xs text-red-400">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              {aiPreviewError}
            </div>
          )}

          {!aiPreviewError && aiPreview === null && services.length === 0 && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 text-xs text-amber-400/80">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              No services added yet. Add services so AI can answer customer questions about your menu.
            </div>
          )}

          {!aiPreviewError && aiPreview === null && services.length > 0 && (
            <p className="text-xs text-fog/50 italic">
              Click "Preview" to see how AI will describe your services to customers.
            </p>
          )}

          {aiPreview && (
            <div className="p-4 rounded-xl bg-gold-400/[0.04] border border-gold-400/15 text-sm text-mist leading-relaxed">
              {aiPreview}
            </div>
          )}
        </div>
      </section>

      {/* AI Tone */}
      <section className="bg-carbon border border-graphite rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ivory flex items-center gap-2">
          <Bot size={16} className="text-gold-400" />
          AI Tone
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTone(t.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                tone === t.id
                  ? "border-gold-400/30 bg-gold-400/[0.06]"
                  : "border-graphite hover:border-graphite/80"
              }`}
            >
              <div className={`text-sm font-medium ${tone === t.id ? "text-gold-400" : "text-ivory"}`}>
                {t.label}
              </div>
              <div className="text-xs text-fog mt-1">{t.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="bg-carbon border border-graphite rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ivory flex items-center gap-2">
          <MessageSquare size={16} className="text-gold-400" />
          Response Languages
        </h2>
        <div className="flex gap-3">
          {LANGUAGES.map((l) => {
            const active = activeLangs.includes(l.id);
            return (
              <button
                key={l.id}
                onClick={() => toggleLang(l.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                  active
                    ? "border-gold-400/30 bg-gold-400/[0.06] text-gold-400"
                    : "border-graphite text-fog hover:text-mist"
                }`}
              >
                <span className="text-xs font-mono">{l.flag}</span>
                <span className="text-sm">{l.label}</span>
                {active && <Check size={14} />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Channels */}
      <section className="bg-carbon border border-graphite rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ivory flex items-center gap-2">
          <MessageSquare size={16} className="text-gold-400" />
          Connected Channels
        </h2>
        <div className="space-y-2">
          {CHANNELS.map((ch) => (
            <div
              key={ch.id}
              className="flex items-center justify-between py-3 px-4 rounded-xl border border-graphite/50"
            >
              <span className="text-sm text-ivory">{ch.label}</span>
              <span
                className={`text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-lg font-medium ${
                  ch.connected
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-fog/10 text-fog"
                }`}
              >
                {ch.connected ? "Connected" : "Not connected"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Opening Hours */}
      <section className="bg-carbon border border-graphite rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ivory flex items-center gap-2">
          <Clock size={16} className="text-gold-400" />
          Opening Hours
        </h2>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs text-fog mb-1.5">Open</label>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="px-3 py-2 rounded-xl bg-void border border-graphite text-sm text-ivory focus:border-gold-400/40 focus:outline-none transition-colors"
            />
          </div>
          <span className="text-fog mt-5">—</span>
          <div>
            <label className="block text-xs text-fog mb-1.5">Close</label>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="px-3 py-2 rounded-xl bg-void border border-graphite text-sm text-ivory focus:border-gold-400/40 focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => toggleDay(d)}
              className={`w-10 h-10 rounded-xl text-xs font-medium transition-all ${
                openDays.includes(d)
                  ? "bg-gold-400/10 text-gold-400 border border-gold-400/20"
                  : "bg-void text-fog border border-graphite"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all ${
          saved
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-gold-400 text-void hover:bg-gold-500"
        }`}
      >
        {saved ? <Check size={16} /> : <Save size={16} />}
        {saved ? "Saved!" : "Save settings"}
      </button>
    </div>
  );
}
