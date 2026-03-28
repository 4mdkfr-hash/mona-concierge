"use client";

import { useState } from "react";
import {
  Bot,
  Globe,
  Clock,
  MessageSquare,
  Save,
  Check,
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

export default function SettingsPage() {
  const [venueName, setVenueName] = useState("Le Grill Monaco");
  const [tone, setTone] = useState("luxury");
  const [activeLangs, setActiveLangs] = useState(["fr", "en", "ru"]);
  const [openTime, setOpenTime] = useState("12:00");
  const [closeTime, setCloseTime] = useState("23:00");
  const [openDays, setOpenDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  const [saved, setSaved] = useState(false);

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
