"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import {
  MessageSquare,
  Star,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  Play,
  Check,
  Globe,
} from "lucide-react";

const FEATURE_ICONS = [MessageSquare, Star, CalendarCheck, TrendingUp];
const LOCALE_LABELS: Record<string, string> = { fr: "FR", en: "EN", ru: "RU" };
const DEMO_VENUES = [
  "Le Grill",
  "Hotel Hermitage",
  "Maison Blanc",
  "Atelier Lumiere",
  "Cafe Riviera",
  "Buddha-Bar",
];

function useFadeIn() {
  const observe = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(node);
  }, []);
  return observe;
}

export default function LandingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const signupRef = useRef<HTMLDivElement>(null);
  const fade = useFadeIn();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [langOpen, setLangOpen] = useState(false);

  const features = t.raw("features.items") as {
    title: string;
    desc: string;
  }[];
  const steps = t.raw("how.steps") as {
    num: string;
    label: string;
    desc: string;
  }[];
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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-void text-ivory font-body antialiased">
      {/* ────────── NAVBAR ────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="glass rounded-2xl border border-white/[0.06] px-6 py-3 flex items-center justify-between">
            {/* Logo */}
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2.5 group"
            >
              <span className="text-gold-400 text-lg transition-transform group-hover:rotate-45">
                &#10022;
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                MonaConcierge
              </span>
            </Link>

            {/* Right */}
            <div className="flex items-center gap-3">
              {/* Language */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 text-xs text-fog hover:text-mist transition-colors px-2 py-1.5 rounded-lg hover:bg-white/[0.04]"
                >
                  <Globe size={14} />
                  {LOCALE_LABELS[locale]}
                </button>
                {langOpen && (
                  <div className="absolute top-full right-0 mt-2 glass rounded-xl border border-white/[0.08] py-1 min-w-[80px]">
                    {(["fr", "en", "ru"] as const).map((l) => (
                      <Link
                        key={l}
                        href={`/${l}`}
                        onClick={() => setLangOpen(false)}
                        className={`block px-4 py-1.5 text-xs transition-colors ${
                          locale === l
                            ? "text-gold-400 font-medium"
                            : "text-fog hover:text-ivory"
                        }`}
                      >
                        {LOCALE_LABELS[l]}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/demo"
                className="text-sm text-mist hover:text-ivory transition-colors hidden sm:block"
              >
                {t("nav.demo")}
              </Link>

              <button
                onClick={() => scrollTo("signup")}
                className="text-sm text-fog hover:text-ivory transition-colors hidden sm:block"
              >
                {t("nav.signin")}
              </button>

              <button
                onClick={() => scrollTo("signup")}
                className="text-sm px-5 py-2 bg-gold-400 text-void font-semibold rounded-xl hover:bg-gold-500 transition-colors"
              >
                {t("nav.start")}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ────────── HERO ────────── */}
      <section className="relative pt-40 pb-32 px-6 text-center overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,175,55,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle 300px at 30% 20%, rgba(212,175,55,0.04) 0%, transparent 100%)",
          }}
        />

        <div className="relative max-w-4xl mx-auto space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass border border-white/[0.08] rounded-full text-xs text-gold-400 tracking-widest uppercase">
            <span>&#10022;</span>
            <span>{t("hero.tag")}</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light leading-[1.1] tracking-tight text-ivory whitespace-pre-line">
            {t("hero.title")}
          </h1>

          <p className="text-lg md:text-xl text-mist/80 max-w-2xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollTo("signup")}
              className="inline-flex items-center gap-2.5 bg-gold-400 text-void px-8 py-4 rounded-2xl font-semibold text-sm hover:bg-gold-500 transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.2)]"
            >
              {t("hero.cta")}
              <ArrowRight size={16} />
            </button>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm text-mist border border-white/[0.08] hover:border-white/[0.16] hover:text-ivory transition-all"
            >
              <Play size={14} />
              {t("hero.demo")}
            </Link>
          </div>
        </div>
      </section>

      {/* ────────── SOCIAL PROOF ────────── */}
      <section className="py-12 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs text-fog/60 tracking-widest uppercase text-center mb-8">
            {t("social.label")}
          </p>
          <div className="flex items-center justify-center gap-10 flex-wrap">
            {DEMO_VENUES.map((v) => (
              <span
                key={v}
                className="text-sm text-mist/30 font-display italic tracking-wide"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── FEATURES ────────── */}
      <section ref={fade} className="fade-section py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-light text-ivory">
              {t("features.title")}
            </h2>
            <p className="text-mist/60 text-lg max-w-xl mx-auto">
              {t("features.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div
                  key={f.title}
                  className="stagger-child group glass border border-white/[0.06] rounded-3xl p-8 hover:border-gold-400/20 transition-all duration-500"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-gold-400/[0.08] border border-gold-400/[0.12] flex items-center justify-center flex-shrink-0 group-hover:bg-gold-400/[0.14] transition-colors">
                      <Icon size={22} className="text-gold-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-ivory">
                        {f.title}
                      </h3>
                      <p className="text-sm text-fog leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────── HOW IT WORKS ────────── */}
      <section ref={fade} className="fade-section py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-light text-ivory">
              {t("how.title")}
            </h2>
            <p className="text-mist/60 text-lg">{t("how.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="stagger-child space-y-5">
                <span className="font-display text-5xl font-light text-gold-400/20">
                  {s.num}
                </span>
                <h3 className="text-lg font-semibold text-ivory">{s.label}</h3>
                <p className="text-sm text-fog leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── PRICING ────────── */}
      <section ref={fade} className="fade-section py-32 px-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-light text-ivory">
              {t("pricing.title")}
            </h2>
            <p className="text-mist/60">{t("pricing.subtitle")}</p>
          </div>

          <div className="glass border border-gold-400/[0.12] rounded-3xl p-10 relative overflow-hidden">
            {/* Corner glow */}
            <div
              className="absolute -top-20 -right-20 w-60 h-60 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
              }}
            />

            <div className="relative space-y-8">
              <div className="inline-block px-3 py-1.5 border border-gold-400/30 rounded-lg text-[10px] tracking-[0.2em] uppercase text-gold-400">
                {t("pricing.tier")}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-lg text-mist/50">&#8364;</span>
                <span className="text-6xl font-display font-light text-ivory">
                  {t("pricing.price")}
                </span>
                <span className="text-mist/40 text-sm ml-1">
                  {t("pricing.period")}
                </span>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

              <ul className="space-y-4">
                {pricingFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-gold-400" />
                    </div>
                    <span className="text-mist">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => scrollTo("signup")}
                className="w-full py-4 rounded-2xl font-semibold text-sm bg-gold-400 text-void hover:bg-gold-500 transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.15)]"
              >
                {t("pricing.cta")}
              </button>

              <p className="text-xs text-fog/50 text-center">
                {t("pricing.guarantee")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── SIGN UP CTA ────────── */}
      <section
        id="signup"
        ref={signupRef}
        className="py-32 px-6 text-center"
      >
        <div ref={fade} className="fade-section max-w-lg mx-auto space-y-10">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent mx-auto" />

          <h2 className="font-display text-4xl md:text-5xl font-light text-ivory whitespace-pre-line leading-tight">
            {t("cta.title")}
          </h2>
          <p className="text-mist/50 leading-relaxed">{t("cta.subtitle")}</p>

          {sent ? (
            <div className="glass border border-gold-400/20 rounded-2xl p-8 space-y-2">
              <p className="font-semibold text-gold-400">
                {t("signup.sent_title")}
              </p>
              <p className="text-sm text-mist/60">
                {t("signup.sent_desc")}{" "}
                <strong className="text-ivory">{email}</strong>
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleLogin}
              className="flex flex-col gap-3"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("signup.placeholder")}
                className="w-full px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-ivory placeholder:text-fog/50 focus:border-gold-400/40 focus:outline-none transition-all"
              />
              {error && (
                <p className="text-xs text-red-400 text-left">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-semibold text-sm bg-gold-400 text-void hover:bg-gold-500 disabled:opacity-50 transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.15)]"
              >
                {loading ? t("signup.sending") : t("signup.button")}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ────────── FOOTER ────────── */}
      <footer className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="text-gold-400 text-lg">&#10022;</span>
                <span className="font-display text-lg font-semibold">
                  MonaConcierge
                </span>
              </div>
              <p className="text-sm text-fog/60 max-w-xs leading-relaxed">
                {t("footer.tagline")}
              </p>
            </div>

            {/* Product links */}
            <div className="space-y-4">
              <h4 className="text-xs text-fog/40 tracking-widest uppercase">
                {t("footer.product")}
              </h4>
              <div className="space-y-2.5">
                <button
                  onClick={() => scrollTo("features")}
                  className="block text-sm text-fog hover:text-mist transition-colors"
                >
                  {t("footer.links.features")}
                </button>
                <button
                  onClick={() => scrollTo("pricing")}
                  className="block text-sm text-fog hover:text-mist transition-colors"
                >
                  {t("footer.links.pricing")}
                </button>
                <Link
                  href="/demo"
                  className="block text-sm text-fog hover:text-mist transition-colors"
                >
                  {t("footer.links.demo")}
                </Link>
              </div>
            </div>

            {/* Company links */}
            <div className="space-y-4">
              <h4 className="text-xs text-fog/40 tracking-widest uppercase">
                {t("footer.company")}
              </h4>
              <div className="space-y-2.5">
                <Link
                  href="/privacy"
                  className="block text-sm text-fog hover:text-mist transition-colors"
                >
                  {t("footer.links.privacy")}
                </Link>
                <a
                  href="mailto:contact@monaconcierge.com"
                  className="block text-sm text-fog hover:text-mist transition-colors"
                >
                  {t("footer.links.contact")}
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-fog/30">
              &copy; {new Date().getFullYear()} MonaConcierge. {t("footer.copy")}
            </p>
            <div className="flex gap-1">
              {(["fr", "en", "ru"] as const).map((l) => (
                <Link
                  key={l}
                  href={`/${l}`}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                    locale === l
                      ? "text-gold-400 bg-gold-400/[0.08]"
                      : "text-fog/40 hover:text-fog"
                  }`}
                >
                  {LOCALE_LABELS[l]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
