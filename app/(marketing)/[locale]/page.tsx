"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import {
  MessageSquare,
  Star,
  CalendarCheck,
  ArrowRight,
  Play,
  Check,
  Globe,
  BellOff,
  Languages,
  Clock,
  Brain,
  LayoutDashboard,
} from "lucide-react";

const FEATURE_ICONS = [MessageSquare, Globe, CalendarCheck, Brain, Star, LayoutDashboard];
const PROBLEM_ICONS = [BellOff, Languages, Clock];
const LOCALE_LABELS: Record<string, string> = { fr: "FR", en: "EN", ru: "RU" };
const DEMO_VENUES = [
  "Le Jardin Monégasque",
  "Maison Blanc",
  "Atelier Lumière",
  "Café Riviera",
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
      { threshold: 0.12 }
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

  const features = t.raw("features.items") as { title: string; desc: string }[];
  const problemItems = t.raw("problem.items") as { title: string; desc: string }[];
  const solutionItems = t.raw("solution.items") as { title: string; desc: string }[];
  const trustStats = t.raw("trust.stats") as { value: string; label: string }[];
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
            <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
              <span className="text-gold-400 text-lg transition-transform group-hover:rotate-45">
                &#10022;
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                MonaConcierge
              </span>
            </Link>

            <div className="flex items-center gap-3">
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

          {/* Gold accent rule */}
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent mx-auto" />

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light leading-[1.08] tracking-tight text-ivory whitespace-pre-line">
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

          <p className="text-xs text-fog/40 tracking-wide">{t("hero.proof")}</p>
        </div>
      </section>

      {/* ────────── SOCIAL PROOF STRIP ────────── */}
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

      {/* ────────── PROBLEM ────────── */}
      <section ref={fade} className="fade-section py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-light text-ivory">
              {t("problem.title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {problemItems.map((item, i) => {
              const Icon = PROBLEM_ICONS[i];
              return (
                <div key={i} className="stagger-child text-center space-y-5 p-8">
                  <div className="w-14 h-14 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center mx-auto">
                    <Icon size={24} className="text-mist/50" />
                  </div>
                  <h3 className="text-base font-semibold text-ivory leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-fog leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────── SOLUTION ────────── */}
      <section ref={fade} className="fade-section py-32 px-6" style={{ background: "rgba(30,35,48,0.3)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-5">
            <h2 className="font-display text-4xl md:text-5xl font-light text-ivory">
              {t("solution.title")}
            </h2>
            <p className="font-display text-xl text-gold-400 font-light italic">
              {t("solution.tagline")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {solutionItems.map((item, i) => (
              <div
                key={i}
                className="stagger-child glass border border-white/[0.06] rounded-3xl p-7 hover:border-gold-400/20 transition-all duration-500"
              >
                <span className="font-display text-5xl font-light text-gold-400/20 block mb-4">
                  0{i + 1}
                </span>
                <h3 className="text-base font-semibold text-ivory mb-3">{item.title}</h3>
                <p className="text-sm text-fog leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Channel logos */}
          <div className="text-center space-y-6">
            <p className="text-xs text-fog/40 tracking-widest uppercase">
              {t("solution.channels_label")}
            </p>
            <div className="flex items-center justify-center gap-5 flex-wrap">
              {/* WhatsApp */}
              <div className="flex items-center gap-2.5 px-5 py-2.5 glass border border-white/[0.06] rounded-xl">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="text-sm text-mist">WhatsApp</span>
              </div>
              {/* Instagram */}
              <div className="flex items-center gap-2.5 px-5 py-2.5 glass border border-white/[0.06] rounded-xl">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433" />
                      <stop offset="50%" stopColor="#dc2743" />
                      <stop offset="100%" stopColor="#bc1888" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#ig)"
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  />
                </svg>
                <span className="text-sm text-mist">Instagram</span>
              </div>
              {/* Google */}
              <div className="flex items-center gap-2.5 px-5 py-2.5 glass border border-white/[0.06] rounded-xl">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-sm text-mist">Google</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── FEATURES ────────── */}
      <section id="features" ref={fade} className="fade-section py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-light text-ivory">
              {t("features.title")}
            </h2>
            <p className="text-mist/60 text-lg max-w-xl mx-auto">
              {t("features.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                      <h3 className="text-base font-semibold text-ivory">{f.title}</h3>
                      <p className="text-sm text-fog leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────── PRICING ────────── */}
      <section id="pricing" ref={fade} className="fade-section py-32 px-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-light text-ivory">
              {t("pricing.title")}
            </h2>
            <p className="text-mist/60">{t("pricing.subtitle")}</p>
          </div>

          <div className="glass border border-gold-400/[0.12] rounded-3xl p-10 relative overflow-hidden">
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

      {/* ────────── TRUST ────────── */}
      <section ref={fade} className="fade-section py-24 px-6 border-y border-white/[0.04]">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <p className="text-sm text-mist/50 tracking-wide">{t("trust.label")}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8">
            {trustStats.map((stat, i) => (
              <div key={i} className="stagger-child space-y-2">
                <p className="font-display text-4xl md:text-5xl font-light text-gold-400">
                  {stat.value}
                </p>
                <p className="text-xs text-fog/60 tracking-widest uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Testimonial placeholder */}
          <div className="glass border border-white/[0.06] rounded-3xl p-8 max-w-lg mx-auto">
            <p className="font-display text-lg font-light text-mist/70 italic leading-relaxed">
              &ldquo;{t("trust.quote")}&rdquo;
            </p>
            <p className="text-xs text-fog/40 mt-4 tracking-wide">{t("trust.quote_author")}</p>
          </div>
        </div>
      </section>

      {/* ────────── SIGN UP CTA ────────── */}
      <section id="signup" ref={signupRef} className="py-32 px-6 text-center">
        <div ref={fade} className="fade-section max-w-lg mx-auto space-y-10">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent mx-auto" />

          <h2 className="font-display text-4xl md:text-5xl font-light text-ivory whitespace-pre-line leading-tight">
            {t("cta.title")}
          </h2>
          <p className="text-mist/50 leading-relaxed">{t("cta.subtitle")}</p>

          {sent ? (
            <div className="glass border border-gold-400/20 rounded-2xl p-8 space-y-2">
              <p className="font-semibold text-gold-400">{t("signup.sent_title")}</p>
              <p className="text-sm text-mist/60">
                {t("signup.sent_desc")}{" "}
                <strong className="text-ivory">{email}</strong>
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

      {/* WhatsApp floating button */}
      <a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-110"
        style={{ background: "#25D366" }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {/* ────────── FOOTER ────────── */}
      <footer className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
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
              <p className="text-xs text-fog/30 italic">{t("footer.made_in")}</p>
            </div>

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
                <button
                  onClick={() => scrollTo("signup")}
                  className="block text-sm text-fog hover:text-mist transition-colors"
                >
                  {t("footer.links.contact")}
                </button>
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
