"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import {
  MessageSquare,
  Globe,
  CalendarCheck,
  Brain,
  Star,
  LayoutDashboard,
  Check,
} from "lucide-react";

const LOCALE_LABELS: Record<string, string> = { fr: "FR", en: "EN", ru: "RU" };
const FEATURE_ICONS = [MessageSquare, Globe, CalendarCheck, Brain, Star, LayoutDashboard];

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
  const fade = useFadeIn();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [langOpen, setLangOpen] = useState(false);

  const problemItems = t.raw("problem.items") as { num: string; text: string }[];
  const solutionFeatures = t.raw("solution.features") as { title: string; desc: string }[];
  const chatMessages = t.raw("solution.chat.messages") as { from: string; text: string; time: string }[];
  const featureItems = t.raw("features.items") as { title: string; desc: string }[];
  const pricingFeatures = t.raw("pricing.features") as string[];

  const handleGoogleLogin = async () => {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

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
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  const scrollToSignup = () => {
    document.getElementById("signup")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen text-ivory antialiased"
      style={{ background: "#080B12", fontFamily: "var(--font-body), Inter, system-ui, sans-serif" }}
    >

      {/* ────────── NAVBAR ────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ background: "rgba(8,11,18,0.85)", backdropFilter: "blur(16px)" }}
      >
        <Link href={`/${locale}`} className="font-display text-base tracking-widest text-ivory/90 font-light">
          MONA<span className="text-gold-400">·</span>CONCIERGE
        </Link>

        <div className="flex items-center gap-6">
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-xs text-fog hover:text-mist transition-colors"
            >
              <Globe size={13} />
              {LOCALE_LABELS[locale]}
            </button>
            {langOpen && (
              <div
                className="absolute top-full right-0 mt-2 py-1 rounded-xl border border-white/[0.08] min-w-[64px]"
                style={{ background: "rgba(20,24,32,0.95)", backdropFilter: "blur(12px)" }}
              >
                {(["fr", "en", "ru"] as const).map((l) => (
                  <Link
                    key={l}
                    href={`/${l}`}
                    onClick={() => setLangOpen(false)}
                    className={`block px-4 py-1.5 text-xs transition-colors ${
                      locale === l ? "text-gold-400" : "text-fog hover:text-ivory"
                    }`}
                  >
                    {LOCALE_LABELS[l]}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={scrollToSignup}
            className="text-xs px-5 py-2 border border-gold-400/60 text-gold-400 rounded-full hover:bg-gold-400/[0.08] transition-all tracking-wider"
          >
            {t("nav.start")}
          </button>
        </div>
      </nav>

      {/* ────────── HERO (100vh) ────────── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: "100vh", paddingTop: "80px" }}
      >
        {/* Subtle gold radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 50% 35% at 50% 30%, rgba(212,175,55,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-3xl mx-auto space-y-8">
          <h1
            className="font-display font-light leading-[1.15] tracking-tight"
            style={{
              fontSize: "clamp(2.6rem, 6vw, 4.5rem)",
              color: "#F5F0E8",
              letterSpacing: "-0.01em",
              whiteSpace: "pre-line",
            }}
          >
            {t("hero.headline")}
          </h1>

          {/* Thin gold line */}
          <span className="gold-line" />

          <p
            className="text-mist/60 font-light tracking-wide"
            style={{ fontSize: "clamp(0.875rem, 1.5vw, 1.0625rem)", fontWeight: 300 }}
          >
            {t("hero.subtitle")}
          </p>

          <button
            onClick={scrollToSignup}
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-gold-400/60 text-gold-400 text-sm font-light tracking-widest rounded-full hover:bg-gold-400/[0.06] transition-all uppercase"
          >
            {t("hero.cta")}
          </button>
        </div>
      </section>

      {/* ────────── PROBLEM ────────── */}
      <section
        ref={fade}
        className="fade-section px-6"
        style={{ paddingTop: "120px", paddingBottom: "120px" }}
      >
        <div className="max-w-2xl mx-auto space-y-14">
          {problemItems.map((item) => (
            <div key={item.num} className="stagger-child flex items-start gap-8">
              <span
                className="font-display font-light flex-shrink-0 leading-none"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "rgba(212,175,55,0.25)", letterSpacing: "-0.02em" }}
              >
                {item.num}
              </span>
              <p
                className="font-light leading-relaxed"
                style={{ fontSize: "clamp(1rem, 1.8vw, 1.25rem)", color: "#A8A8B3", fontWeight: 300, paddingTop: "0.3em" }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ────────── SOLUTION ────────── */}
      <section
        ref={fade}
        className="fade-section px-6"
        style={{ paddingTop: "120px", paddingBottom: "120px" }}
      >
        <div className="max-w-5xl mx-auto">
          <h2
            className="font-display font-light text-center mb-16 tracking-tight"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#F5F0E8" }}
          >
            {t("solution.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* WhatsApp chat mockup — custom CSS, no screenshot */}
            <div className="stagger-child order-2 md:order-1">
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {/* Chat header */}
                <div
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ background: "#111b21", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-void"
                    style={{ background: "#D4AF37" }}
                  >
                    ✦
                  </div>
                  <div>
                    <div className="text-xs text-ivory font-medium">MonaConcierge</div>
                    <div className="text-[10px]" style={{ color: "#25D366" }}>en ligne</div>
                  </div>
                </div>
                {/* Messages */}
                <div className="px-4 py-4 space-y-3" style={{ minHeight: "220px" }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}>
                      <div
                        className="max-w-[78%] px-3 py-2 text-xs text-ivory leading-relaxed"
                        style={{
                          background: msg.from === "client" ? "#005c4b" : "#1e2d31",
                          borderRadius: msg.from === "client"
                            ? "16px 4px 16px 16px"
                            : "4px 16px 16px 16px",
                        }}
                      >
                        {msg.text}
                        <span
                          className="ml-2 text-[10px]"
                          style={{ color: "rgba(255,255,255,0.35)", fontVariantNumeric: "tabular-nums" }}
                        >
                          {msg.time}
                          {msg.from === "bot" && " ✓✓"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Features list */}
            <div className="stagger-child order-1 md:order-2 space-y-8">
              {solutionFeatures.map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)" }}
                  >
                    <span className="text-gold-400 text-sm">✦</span>
                  </div>
                  <div>
                    <div className="text-ivory text-sm font-medium">{f.title}</div>
                    <div className="text-fog text-sm font-light mt-0.5">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────── FEATURES (6 cards, 2×3) ────────── */}
      <section
        ref={fade}
        className="fade-section px-6"
        style={{ paddingTop: "120px", paddingBottom: "120px" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2
            className="font-display font-light text-center mb-16 tracking-tight"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#F5F0E8" }}
          >
            {t("features.title")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {featureItems.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div
                  key={f.title}
                  className="stagger-child group p-6 rounded-2xl transition-all duration-500"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.05)",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(212,175,55,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)";
                  }}
                >
                  <Icon size={20} className="text-gold-400 mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="text-ivory text-sm font-medium mb-1">{f.title}</div>
                  <div className="text-fog text-xs font-light leading-relaxed">{f.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────── PRICING ────────── */}
      <section
        ref={fade}
        className="fade-section px-6"
        style={{ paddingTop: "120px", paddingBottom: "120px" }}
      >
        <div className="max-w-md mx-auto text-center">
          <h2
            className="font-display font-light mb-12 tracking-tight"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#F5F0E8" }}
          >
            {t("pricing.title")}
          </h2>

          <div
            className="rounded-3xl p-10 relative overflow-hidden"
            style={{ border: "1px solid rgba(212,175,55,0.15)", background: "rgba(20,24,32,0.6)" }}
          >
            {/* Corner glow */}
            <div
              className="absolute -top-24 -right-24 w-64 h-64 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)" }}
            />

            <div className="relative space-y-8">
              <div
                className="inline-block px-3 py-1 text-[10px] tracking-[0.2em] uppercase"
                style={{ border: "1px solid rgba(212,175,55,0.3)", borderRadius: "6px", color: "#D4AF37" }}
              >
                {t("pricing.tier")}
              </div>

              <div className="flex items-baseline justify-center gap-1">
                <span className="text-xl" style={{ color: "rgba(245,240,232,0.4)" }}>€</span>
                <span
                  className="font-display font-light"
                  style={{ fontSize: "clamp(3rem, 8vw, 4.5rem)", color: "#D4AF37", lineHeight: 1 }}
                >
                  {t("pricing.price")}
                </span>
                <span className="text-sm ml-1" style={{ color: "rgba(168,168,179,0.5)" }}>
                  {t("pricing.period")}
                </span>
              </div>

              <div style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)" }} />

              <ul className="space-y-3 text-left">
                {pricingFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-light" style={{ color: "#A8A8B3" }}>
                    <Check size={14} className="text-gold-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* ONLY filled gold CTA button on the page */}
              <button
                onClick={scrollToSignup}
                className="w-full py-4 rounded-2xl font-semibold text-sm text-void transition-all hover:opacity-90"
                style={{ background: "#D4AF37" }}
              >
                {t("pricing.cta")}
              </button>

              <p className="text-xs font-light" style={{ color: "rgba(107,107,122,0.7)" }}>
                {t("pricing.guarantee")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── TRUST ────────── */}
      <section
        className="px-6 py-16 text-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <p className="text-xs tracking-widest uppercase" style={{ color: "rgba(107,107,122,0.5)" }}>
          {t("trust.label")}
        </p>
        {/* Channel logos — muted placeholders */}
        <div className="flex items-center justify-center gap-10 mt-6 flex-wrap">
          {["WhatsApp", "Google", "Instagram"].map((ch) => (
            <span key={ch} className="text-sm font-light" style={{ color: "rgba(107,107,122,0.25)", letterSpacing: "0.05em" }}>
              {ch}
            </span>
          ))}
        </div>
      </section>

      {/* ────────── SIGNUP CTA ────────── */}
      <section
        id="signup"
        ref={fade}
        className="fade-section px-6"
        style={{ paddingTop: "120px", paddingBottom: "120px" }}
      >
        <div className="max-w-sm mx-auto">
          {sent ? (
            <div
              className="rounded-2xl p-8 text-center space-y-2"
              style={{ background: "rgba(20,24,32,0.6)", border: "1px solid rgba(212,175,55,0.2)" }}
            >
              <p className="font-semibold text-gold-400">{t("signup.sent_title")}</p>
              <p className="text-sm font-light" style={{ color: "rgba(168,168,179,0.7)" }}>
                {t("signup.sent_desc")} <strong className="text-ivory">{email}</strong>
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Google OAuth — primary button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-[#1a1a1a] font-semibold text-sm hover:bg-gray-50 transition-all shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t("signup.google")}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                <span className="text-xs" style={{ color: "rgba(107,107,122,0.5)" }}>{t("signup.divider")}</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>

              {/* Magic link */}
              <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("signup.placeholder")}
                  className="w-full px-5 py-4 rounded-2xl text-ivory placeholder:text-fog/40 focus:outline-none transition-all text-sm font-light"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(212,175,55,0.35)"; }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl text-sm font-light transition-all disabled:opacity-50"
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(168,168,179,0.8)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.18)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#F5F0E8";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(168,168,179,0.8)";
                  }}
                >
                  {loading ? t("signup.sending") : t("signup.button")}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* WhatsApp floating button */}
      <a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-transform hover:scale-110"
        style={{ background: "#25D366" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* ────────── FOOTER ────────── */}
      <footer
        className="px-8 py-10"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left space-y-1">
            <p className="font-display font-light italic text-xs text-fog/50 tracking-wide">
              {t("footer.tagline")}
            </p>
            <p className="text-[11px]" style={{ color: "rgba(107,107,122,0.35)" }}>
              {t("footer.copy")}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href={`/${locale}/privacy`}
              className="text-xs font-light transition-colors"
              style={{ color: "rgba(107,107,122,0.5)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#A8A8B3"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(107,107,122,0.5)"; }}
            >
              {t("footer.links.privacy")}
            </Link>
            <button
              onClick={scrollToSignup}
              className="text-xs font-light transition-colors"
              style={{ color: "rgba(107,107,122,0.5)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#A8A8B3"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(107,107,122,0.5)"; }}
            >
              {t("footer.links.contact")}
            </button>

            {/* Language links */}
            <div className="flex gap-1">
              {(["fr", "en", "ru"] as const).map((l) => (
                <Link
                  key={l}
                  href={`/${l}`}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                    locale === l
                      ? "text-gold-400"
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
