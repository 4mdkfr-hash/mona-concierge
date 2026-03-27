"use client";

import { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import {
  MessageSquare,
  Star,
  Calendar,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const FEATURE_ICONS = [MessageSquare, Star, Calendar, Sparkles];

const LOCALE_LABELS: Record<string, string> = { fr: "FR", en: "EN", ru: "RU" };

const DEMO_VENUES = [
  "Le Jardin Monégasque",
  "Maison Blanc",
  "Atelier Lumière",
  "Café Riviera",
];

export default function LandingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const signupRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const features = t.raw("features.items") as { title: string; desc: string }[];
  const steps = t.raw("how.steps") as { label: string; desc: string }[];
  const pricingFeatures = t.raw("pricing.features") as string[];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/inbox` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  const scrollToSignup = () => {
    signupRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-void text-ivory font-body">
      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 border-b border-graphite bg-void/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gold-400 text-xl">✦</span>
            <span className="font-display text-xl font-semibold">MonaConcierge</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Lang switcher */}
            <div className="flex gap-1">
              {(["fr", "en", "ru"] as const).map((l) => (
                <Link
                  key={l}
                  href={`/${l}`}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    locale === l
                      ? "text-gold-400 font-semibold"
                      : "text-fog hover:text-mist"
                  }`}
                >
                  {LOCALE_LABELS[l]}
                </Link>
              ))}
            </div>

            <Link
              href="/demo"
              className="text-sm text-mist hover:text-ivory transition-colors"
            >
              {t("nav.demo")}
            </Link>

            <button
              onClick={scrollToSignup}
              className="text-sm px-4 py-1.5 border border-gold-400/40 text-gold-400 rounded-full hover:bg-gold-400/10 transition-colors"
            >
              {t("nav.signin")}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative py-32 px-6 text-center overflow-hidden">
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-gold-400/30 rounded-full text-xs text-gold-400 tracking-widest uppercase">
            <span>✦</span>
            <span>{t("hero.tag")}</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-light leading-tight tracking-tight text-ivory whitespace-pre-line">
            {t("hero.title")}
          </h1>

          <p className="text-lg text-mist max-w-xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <button
            onClick={scrollToSignup}
            className="inline-flex items-center gap-2 bg-gold-400 text-void px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-gold-500 transition-colors"
          >
            {t("hero.cta")}
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* ── LOGOS BAR ── */}
      <section className="py-8 border-y border-graphite">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-8 overflow-x-auto">
          <span className="text-xs text-fog tracking-widest uppercase whitespace-nowrap">
            {t("logos.label")}
          </span>
          {DEMO_VENUES.map((v) => (
            <span key={v} className="text-sm text-mist/60 whitespace-nowrap font-display italic">
              {v}
            </span>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-light text-center text-ivory mb-12">
            {t("features.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div
                  key={f.title}
                  className="bg-carbon border border-graphite rounded-card p-6 space-y-3 hover:border-gold-400/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center">
                    <Icon size={20} className="text-gold-400" />
                  </div>
                  <h3 className="font-semibold text-ivory">{f.title}</h3>
                  <p className="text-sm text-fog leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 bg-carbon/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-light text-center text-ivory mb-16">
            {t("how.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.label} className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full border border-gold-400/40 flex items-center justify-center mx-auto font-display text-xl text-gold-400">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-ivory">{s.label}</h3>
                <p className="text-sm text-fog leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 px-6">
        <div className="max-w-md mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-light text-center text-ivory mb-12">
            {t("pricing.title")}
          </h2>
          <div className="bg-carbon border border-gold-400/20 rounded-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold-400/10 to-transparent rounded-bl-full" />

            <div className="inline-block px-3 py-1 border border-gold-400/40 rounded text-[10px] tracking-widest uppercase text-gold-400 mb-6">
              {t("pricing.tier")}
            </div>

            <div className="mb-8">
              <span className="text-5xl font-display font-light text-ivory">
                {t("pricing.price")}
              </span>
              <span className="text-mist/50 ml-1 text-sm">{t("pricing.period")}</span>
            </div>

            <ul className="space-y-3 mb-8">
              {pricingFeatures.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-mist border-b border-graphite/50 pb-3 last:border-0"
                >
                  <span className="text-gold-400 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={scrollToSignup}
              className="w-full bg-gradient-to-r from-gold-400 via-[#E8CC7A] to-gold-400 text-void py-3 rounded font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity"
            >
              {t("pricing.cta")}
            </button>
          </div>
        </div>
      </section>

      {/* ── SIGN UP CTA ── */}
      <section
        ref={signupRef}
        className="py-24 px-6 bg-gradient-to-b from-obsidian to-void text-center"
      >
        <div className="max-w-lg mx-auto space-y-8">
          <div className="w-10 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto" />

          <h2 className="font-display text-3xl md:text-4xl font-light text-ivory whitespace-pre-line">
            {t("cta.title")}
          </h2>
          <p className="text-mist/60 text-sm leading-relaxed">{t("cta.subtitle")}</p>

          {sent ? (
            <div className="p-6 border border-gold-400/30 rounded-card bg-gold-400/5 space-y-1">
              <p className="font-semibold text-gold-400">{t("signup.sent_title")}</p>
              <p className="text-sm text-mist/70">
                {t("signup.sent_desc")} <strong className="text-ivory">{email}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("signup.placeholder")}
                className="w-full px-4 py-3 rounded bg-ivory/5 border border-gold-400/25 text-ivory placeholder:text-fog focus:border-gold-400/60 focus:outline-none transition-colors"
              />
              {error && <p className="text-xs text-red-400 text-left">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded font-semibold text-sm tracking-wide bg-gradient-to-r from-gold-400 via-[#E8CC7A] to-gold-400 text-void hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? t("signup.sending") : t("signup.button")}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-gold-400/10 text-center">
        <p className="text-xs text-ivory/30 tracking-wide">
          <span className="text-gold-400/50">MonaConcierge</span>
          {" · "}
          {t("footer.tagline")}
        </p>
      </footer>
    </div>
  );
}
