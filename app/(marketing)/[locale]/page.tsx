"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
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

function AnimatedChat({ messages }: { messages: { from: string; text: string; time: string }[] }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleCount >= messages.length) {
      // Reset after a pause and loop
      const timer = setTimeout(() => setVisibleCount(0), 4000);
      return () => clearTimeout(timer);
    }

    const nextMsg = messages[visibleCount];
    if (nextMsg?.from === "bot") {
      // Show typing indicator before bot messages
      setTyping(true);
      const typingTimer = setTimeout(() => {
        setTyping(false);
        setVisibleCount((c) => c + 1);
      }, 1200);
      return () => clearTimeout(typingTimer);
    }

    // Client messages appear after a short delay
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), 800);
    return () => clearTimeout(timer);
  }, [visibleCount, messages]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
  }, [visibleCount, typing]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#FFFFFF", border: "1px solid #D6DEE5", boxShadow: "0 4px 24px rgba(15,43,60,0.08)" }}
    >
      {/* Chat header — light */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ background: "#F0F4F8", borderBottom: "1px solid #D6DEE5" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{ background: "#C4A35A", color: "#FFFFFF" }}
        >
          ✦
        </div>
        <div>
          <div className="text-xs font-medium" style={{ color: "#0F2B3C" }}>MonaConcierge</div>
          <div className="text-[10px]" style={{ color: "#5B8FA8" }}>en ligne</div>
        </div>
      </div>
      {/* Messages */}
      <div ref={containerRef} className="px-4 py-4 space-y-3 overflow-y-auto" style={{ minHeight: "220px", maxHeight: "320px" }}>
        {messages.slice(0, visibleCount).map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}
            style={{ animation: "chat-pop 0.3s ease-out" }}
          >
            <div
              className="max-w-[78%] px-3 py-2 text-xs leading-relaxed"
              style={{
                color: msg.from === "client" ? "#FFFFFF" : "#0F2B3C",
                background: msg.from === "client" ? "#C4A35A" : "#F0F4F8",
                border: msg.from === "client" ? "none" : "1px solid #D6DEE5",
                borderRadius: msg.from === "client"
                  ? "16px 4px 16px 16px"
                  : "4px 16px 16px 16px",
              }}
            >
              {msg.text}
              <span
                className="ml-2 text-[10px]"
                style={{
                  color: msg.from === "client" ? "rgba(255,255,255,0.6)" : "rgba(91,143,168,0.5)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {msg.time}
                {msg.from === "bot" && " ✓✓"}
              </span>
            </div>
          </div>
        ))}
        {/* Typing indicator */}
        {typing && (
          <div className="flex justify-start">
            <div
              className="px-4 py-2.5 text-xs"
              style={{ background: "#F0F4F8", border: "1px solid #D6DEE5", borderRadius: "4px 16px 16px 16px" }}
            >
              <span className="typing-dots">
                <span style={{ background: "#5B8FA8" }} />
                <span style={{ background: "#5B8FA8" }} />
                <span style={{ background: "#5B8FA8" }} />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
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
      className="min-h-screen antialiased"
      style={{ background: "#FFFFFF", color: "#0F2B3C", fontFamily: "var(--font-body), Inter, system-ui, sans-serif" }}
    >

      {/* ────────── NAVBAR ────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(15,43,60,0.06)" }}
      >
        <Link href={`/${locale}`} className="font-display text-base tracking-widest font-light" style={{ color: "#0F2B3C" }}>
          MONA<span style={{ color: "#C4A35A" }}>·</span>CONCIERGE
        </Link>

        <div className="flex items-center gap-6">
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: "#8AABBC" }}
            >
              <Globe size={13} />
              {LOCALE_LABELS[locale]}
            </button>
            {langOpen && (
              <div
                className="absolute top-full right-0 mt-2 py-1 rounded-xl min-w-[64px]"
                style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(15,43,60,0.1)", backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(15,43,60,0.08)" }}
              >
                {(["fr", "en", "ru"] as const).map((l) => (
                  <Link
                    key={l}
                    href={`/${l}`}
                    onClick={() => setLangOpen(false)}
                    className="block px-4 py-1.5 text-xs transition-colors"
                    style={{ color: locale === l ? "#C4A35A" : "#8AABBC" }}
                  >
                    {LOCALE_LABELS[l]}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={scrollToSignup}
            className="text-xs px-5 py-2 rounded-full transition-all tracking-wider"
            style={{ border: "1px solid rgba(196,163,90,0.6)", color: "#C4A35A", background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(196,163,90,0.06)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            {t("nav.start")}
          </button>
        </div>
      </nav>

      {/* ────────── HERO (100vh) ────────── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 overflow-hidden"
        style={{ minHeight: "100vh", paddingTop: "80px" }}
      >
        {/* Monaco panorama background */}
        <div className="absolute inset-0">
          <Image
            src="/hero-monaco.webp"
            alt="Monaco harbor panorama at dusk"
            fill
            priority
            className="object-cover object-center"
            style={{ filter: "blur(2px)" }}
            sizes="100vw"
          />
          {/* White veil overlay */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(255, 255, 255, 0.85)" }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto space-y-8">
          <h1
            className="font-display font-light leading-[1.15] tracking-tight"
            style={{
              fontSize: "clamp(2.6rem, 6vw, 4.5rem)",
              color: "#0F2B3C",
              letterSpacing: "-0.01em",
              whiteSpace: "pre-line",
            }}
          >
            {t("hero.headline")}
          </h1>

          {/* Thin gold line */}
          <span className="gold-line" />

          <p
            className="font-light tracking-wide"
            style={{ fontSize: "clamp(0.875rem, 1.5vw, 1.0625rem)", fontWeight: 300, color: "#5B8FA8" }}
          >
            {t("hero.subtitle")}
          </p>

          <button
            onClick={scrollToSignup}
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-light tracking-widest rounded-full transition-all uppercase"
            style={{ border: "1px solid rgba(196,163,90,0.6)", color: "#C4A35A", background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(196,163,90,0.06)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            {t("hero.cta")}
          </button>
        </div>
      </section>

      {/* ────────── PROBLEM ────────── */}
      <section
        ref={fade}
        className="fade-section px-6"
        style={{ paddingTop: "120px", paddingBottom: "120px", background: "#F0F4F8" }}
      >
        <div className="max-w-2xl mx-auto space-y-14">
          {problemItems.map((item) => (
            <div key={item.num} className="stagger-child flex items-start gap-8">
              <span
                className="font-display font-light flex-shrink-0 leading-none"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "rgba(196,163,90,0.35)", letterSpacing: "-0.02em" }}
              >
                {item.num}
              </span>
              <p
                className="font-light leading-relaxed"
                style={{ fontSize: "clamp(1rem, 1.8vw, 1.25rem)", color: "#5B8FA8", fontWeight: 300, paddingTop: "0.3em" }}
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
        style={{ paddingTop: "120px", paddingBottom: "120px", background: "#FFFFFF" }}
      >
        <div className="max-w-5xl mx-auto">
          <h2
            className="font-display font-light text-center mb-16 tracking-tight"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#0F2B3C" }}
          >
            {t("solution.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Animated chat demo — light Côte d'Azur palette */}
            <div className="stagger-child order-2 md:order-1">
              <AnimatedChat messages={chatMessages} />
            </div>

            {/* Features list */}
            <div className="stagger-child order-1 md:order-2 space-y-8">
              {solutionFeatures.map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(196,163,90,0.1)", border: "1px solid rgba(196,163,90,0.2)" }}
                  >
                    <span style={{ color: "#C4A35A" }} className="text-sm">✦</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#0F2B3C" }}>{f.title}</div>
                    <div className="text-sm font-light mt-0.5" style={{ color: "#5B8FA8" }}>{f.desc}</div>
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
        style={{ paddingTop: "120px", paddingBottom: "120px", background: "#F0F4F8" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2
            className="font-display font-light text-center mb-16 tracking-tight"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#0F2B3C" }}
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
                    background: "#FFFFFF",
                    border: "1px solid rgba(15,43,60,0.08)",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(196,163,90,0.35)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(196,163,90,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(15,43,60,0.08)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  <Icon size={20} style={{ color: "#C4A35A" }} className="mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="text-sm font-medium mb-1" style={{ color: "#0F2B3C" }}>{f.title}</div>
                  <div className="text-xs font-light leading-relaxed" style={{ color: "#8AABBC" }}>{f.desc}</div>
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
        style={{ paddingTop: "120px", paddingBottom: "120px", background: "#FFFFFF" }}
      >
        <div className="max-w-md mx-auto text-center">
          <h2
            className="font-display font-light mb-12 tracking-tight"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#0F2B3C" }}
          >
            {t("pricing.title")}
          </h2>

          <div
            className="rounded-3xl p-10 relative overflow-hidden"
            style={{ border: "1px solid rgba(196,163,90,0.2)", background: "#FFFFFF", boxShadow: "0 8px 40px rgba(15,43,60,0.06)" }}
          >
            {/* Corner glow */}
            <div
              className="absolute -top-24 -right-24 w-64 h-64 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(196,163,90,0.08) 0%, transparent 70%)" }}
            />

            <div className="relative space-y-8">
              <div
                className="inline-block px-3 py-1 text-[10px] tracking-[0.2em] uppercase"
                style={{ border: "1px solid rgba(196,163,90,0.3)", borderRadius: "6px", color: "#C4A35A" }}
              >
                {t("pricing.tier")}
              </div>

              <div className="flex items-baseline justify-center gap-1">
                <span className="text-xl" style={{ color: "rgba(15,43,60,0.35)" }}>€</span>
                <span
                  className="font-display font-light"
                  style={{ fontSize: "clamp(3rem, 8vw, 4.5rem)", color: "#C4A35A", lineHeight: 1 }}
                >
                  {t("pricing.price")}
                </span>
                <span className="text-sm ml-1" style={{ color: "rgba(91,143,168,0.6)" }}>
                  {t("pricing.period")}
                </span>
              </div>

              <div style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(15,43,60,0.08), transparent)" }} />

              <ul className="space-y-3 text-left">
                {pricingFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-light" style={{ color: "#5B8FA8" }}>
                    <Check size={14} style={{ color: "#C4A35A" }} className="flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* ONLY filled gold CTA button on the page */}
              <button
                onClick={scrollToSignup}
                className="w-full py-4 rounded-2xl font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: "#C4A35A", color: "#FFFFFF" }}
              >
                {t("pricing.cta")}
              </button>

              <p className="text-xs font-light" style={{ color: "rgba(138,171,188,0.8)" }}>
                {t("pricing.guarantee")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── SIGNUP CTA ────────── */}
      <section
        id="signup"
        ref={fade}
        className="fade-section px-6"
        style={{ paddingTop: "120px", paddingBottom: "120px", background: "#FFFFFF" }}
      >
        <div className="max-w-sm mx-auto">
          {sent ? (
            <div
              className="rounded-2xl p-8 text-center space-y-2"
              style={{ background: "#FFFFFF", border: "1px solid rgba(196,163,90,0.25)", boxShadow: "0 4px 20px rgba(15,43,60,0.06)" }}
            >
              <p className="font-semibold" style={{ color: "#C4A35A" }}>{t("signup.sent_title")}</p>
              <p className="text-sm font-light" style={{ color: "rgba(91,143,168,0.8)" }}>
                {t("signup.sent_desc")} <strong style={{ color: "#0F2B3C" }}>{email}</strong>
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Google OAuth — primary button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-sm transition-all shadow-sm"
                style={{ background: "#FFFFFF", color: "#0F2B3C", border: "1px solid rgba(15,43,60,0.12)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F0F4F8"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF"; }}
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
                <div className="flex-1 h-px" style={{ background: "rgba(15,43,60,0.08)" }} />
                <span className="text-xs" style={{ color: "rgba(91,143,168,0.5)" }}>{t("signup.divider")}</span>
                <div className="flex-1 h-px" style={{ background: "rgba(15,43,60,0.08)" }} />
              </div>

              {/* Magic link */}
              <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("signup.placeholder")}
                  className="w-full px-5 py-4 rounded-2xl focus:outline-none transition-all text-sm font-light"
                  style={{
                    background: "#F0F4F8",
                    border: "1px solid rgba(15,43,60,0.1)",
                    color: "#0F2B3C",
                  }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(196,163,90,0.4)"; }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(15,43,60,0.1)"; }}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl text-sm font-light transition-all disabled:opacity-50"
                  style={{
                    border: "1px solid rgba(15,43,60,0.12)",
                    color: "#5B8FA8",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(15,43,60,0.2)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#0F2B3C";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(15,43,60,0.12)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#5B8FA8";
                  }}
                >
                  {loading ? t("signup.sending") : t("signup.button")}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ────────── FOOTER ────────── */}
      <footer
        className="px-8 py-10"
        style={{ borderTop: "1px solid rgba(15,43,60,0.07)", background: "#F0F4F8" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left space-y-1">
            <p className="font-display font-light italic text-xs tracking-wide" style={{ color: "rgba(91,143,168,0.6)" }}>
              {t("footer.tagline")}
            </p>
            <p className="text-[11px]" style={{ color: "rgba(91,143,168,0.4)" }}>
              {t("footer.copy")}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href={`/${locale}/privacy`}
              className="text-xs font-light transition-colors"
              style={{ color: "rgba(91,143,168,0.5)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#5B8FA8"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(91,143,168,0.5)"; }}
            >
              {t("footer.links.privacy")}
            </Link>
            <button
              onClick={scrollToSignup}
              className="text-xs font-light transition-colors"
              style={{ color: "rgba(91,143,168,0.5)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#5B8FA8"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(91,143,168,0.5)"; }}
            >
              {t("footer.links.contact")}
            </button>

            {/* Language links */}
            <div className="flex gap-1">
              {(["fr", "en", "ru"] as const).map((l) => (
                <Link
                  key={l}
                  href={`/${l}`}
                  className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                  style={{ color: locale === l ? "#C4A35A" : "rgba(91,143,168,0.4)" }}
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
