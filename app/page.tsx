"use client";

import { useState, useEffect, useRef } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type Lang = "fr" | "en" | "ru";

const t: Record<Lang, {
  nav_signin: string;
  hero_tag: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta: string;
  features_title: string;
  features: { title: string; desc: string }[];
  pricing_title: string;
  pricing_tier: string;
  pricing_price: string;
  pricing_period: string;
  pricing_features: string[];
  pricing_cta: string;
  cta_title: string;
  cta_subtitle: string;
  signup_placeholder: string;
  signup_button: string;
  signup_sending: string;
  signup_sent_title: string;
  signup_sent_desc: string;
  footer_tagline: string;
}> = {
  fr: {
    nav_signin: "Connexion",
    hero_tag: "Pour Monaco & Côte d'Azur",
    hero_title: "L'IA au service\nde votre clientèle",
    hero_subtitle: "Automatisez vos réponses WhatsApp, gérez vos réservations et fidélisez vos clients — avec une élégance digne de Monaco.",
    hero_cta: "Commencer gratuitement",
    features_title: "Tout ce dont vous avez besoin",
    features: [
      { title: "Assistant WhatsApp IA", desc: "Répondez automatiquement à vos clients en français, anglais et russe — 24h/24, 7j/7." },
      { title: "Google Reviews", desc: "Des réponses personnalisées à chaque avis, générées par l'IA pour soigner votre image." },
      { title: "Réservations en ligne", desc: "Gérez toutes vos réservations depuis un seul tableau de bord, sans effort." },
      { title: "Relances intelligentes", desc: "Fidélisez vos clients après leur visite avec des messages personnalisés et opportuns." },
    ],
    pricing_title: "Tarifs simples et transparents",
    pricing_tier: "Essential",
    pricing_price: "€200",
    pricing_period: "/ mois",
    pricing_features: [
      "Assistant WhatsApp IA multilingue",
      "Réponses automatiques Google Reviews",
      "Gestion des réservations",
      "Relances post-visite",
      "Support prioritaire",
    ],
    pricing_cta: "Démarrer maintenant",
    cta_title: "Prêt à transformer\nvotre service client ?",
    cta_subtitle: "Rejoignez les établissements d'exception qui font confiance à MonaConcierge.",
    signup_placeholder: "votre@email.com",
    signup_button: "Accès par lien magique",
    signup_sending: "Envoi en cours…",
    signup_sent_title: "Vérifiez votre email",
    signup_sent_desc: "Nous avons envoyé un lien magique à",
    footer_tagline: "L'excellence au service de votre clientèle.",
  },
  en: {
    nav_signin: "Sign In",
    hero_tag: "For Monaco & Côte d'Azur",
    hero_title: "AI-powered\ncustomer engagement",
    hero_subtitle: "Automate WhatsApp replies, manage bookings, and delight your guests — with the elegance Monaco deserves.",
    hero_cta: "Get started for free",
    features_title: "Everything you need",
    features: [
      { title: "WhatsApp AI Assistant", desc: "Reply to every customer automatically in French, English, and Russian — around the clock." },
      { title: "Google Reviews", desc: "Personalised AI-generated responses to every review, protecting and elevating your reputation." },
      { title: "Online Bookings", desc: "Manage all reservations from a single elegant dashboard, effortlessly." },
      { title: "Smart Follow-ups", desc: "Re-engage guests after their visit with timely, personalised messages." },
    ],
    pricing_title: "Simple, transparent pricing",
    pricing_tier: "Essential",
    pricing_price: "€200",
    pricing_period: "/ month",
    pricing_features: [
      "Multilingual WhatsApp AI assistant",
      "Automated Google Review responses",
      "Booking management",
      "Post-visit follow-ups",
      "Priority support",
    ],
    pricing_cta: "Start now",
    cta_title: "Ready to transform\nyour guest experience?",
    cta_subtitle: "Join the finest establishments that trust MonaConcierge.",
    signup_placeholder: "your@email.com",
    signup_button: "Sign in with Magic Link",
    signup_sending: "Sending…",
    signup_sent_title: "Check your email",
    signup_sent_desc: "We sent a magic link to",
    footer_tagline: "Excellence in customer engagement.",
  },
  ru: {
    nav_signin: "Войти",
    hero_tag: "Для Монако и Лазурного берега",
    hero_title: "ИИ для работы\nс вашими гостями",
    hero_subtitle: "Автоматизируйте ответы в WhatsApp, управляйте бронированиями и удерживайте клиентов — с элегантностью, достойной Монако.",
    hero_cta: "Начать бесплатно",
    features_title: "Всё что нужно вашему бизнесу",
    features: [
      { title: "ИИ-ассистент WhatsApp", desc: "Автоматические ответы клиентам на французском, английском и русском — круглосуточно." },
      { title: "Google Отзывы", desc: "Персонализированные ответы на каждый отзыв, сгенерированные ИИ для защиты репутации." },
      { title: "Онлайн-бронирования", desc: "Управляйте всеми резервациями из одного элегантного дашборда без лишних усилий." },
      { title: "Умные напоминания", desc: "Возвращайте гостей после визита с персонализированными и своевременными сообщениями." },
    ],
    pricing_title: "Простые и прозрачные тарифы",
    pricing_tier: "Essential",
    pricing_price: "€200",
    pricing_period: "/ месяц",
    pricing_features: [
      "Многоязычный ИИ-ассистент WhatsApp",
      "Автоматические ответы на Google Reviews",
      "Управление бронированиями",
      "Напоминания после визита",
      "Приоритетная поддержка",
    ],
    pricing_cta: "Начать сейчас",
    cta_title: "Готовы преобразить\nобслуживание гостей?",
    cta_subtitle: "Присоединяйтесь к лучшим заведениям, которые доверяют MonaConcierge.",
    signup_placeholder: "ваш@email.com",
    signup_button: "Войти по magic link",
    signup_sending: "Отправляем…",
    signup_sent_title: "Проверьте почту",
    signup_sent_desc: "Мы отправили magic link на",
    footer_tagline: "Превосходство в работе с клиентами.",
  },
};

const FEATURE_ICONS = ["💬", "⭐", "📅", "✉️"];

export default function HomePage() {
  const router = useRouter();
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const [lang, setLang] = useState<Lang>("fr");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const signupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabaseRef.current = sb;

    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/inbox");
      } else {
        setReady(true);
      }
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseRef.current) return;
    setLoading(true);
    setError("");

    const { error } = await supabaseRef.current.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/inbox`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  const scrollToSignup = () => {
    signupRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!ready) {
    return (
      <main
        className="flex min-h-screen items-center justify-center"
        style={{ background: "#0A0A0F" }}
      >
        <div style={{ color: "#C9A84C", opacity: 0.6, letterSpacing: "0.15em", fontSize: "0.8rem" }}>
          ✦ MonaConcierge
        </div>
      </main>
    );
  }

  const c = t[lang];

  return (
    <div style={{ background: "#0A0A0F", color: "#F5F0E8", fontFamily: "inherit", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(201,168,76,0.12)",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "#C9A84C", fontSize: "1.1rem", letterSpacing: "0.04em", fontWeight: 600 }}>
              MonaConcierge
            </span>
          </div>

          {/* Lang + Sign in */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              {(["fr", "en", "ru"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: "0.25rem 0.55rem",
                    fontSize: "0.7rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    border: lang === l ? "1px solid #C9A84C" : "1px solid rgba(201,168,76,0.25)",
                    borderRadius: "3px",
                    background: lang === l ? "rgba(201,168,76,0.12)" : "transparent",
                    color: lang === l ? "#C9A84C" : "rgba(245,240,232,0.5)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={scrollToSignup}
              style={{
                padding: "0.4rem 1.1rem",
                fontSize: "0.78rem",
                letterSpacing: "0.06em",
                border: "1px solid #C9A84C",
                borderRadius: "3px",
                background: "transparent",
                color: "#C9A84C",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "rgba(201,168,76,0.12)"; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "transparent"; }}
            >
              {c.nav_signin}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "5rem 1.5rem 4rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Radial glow */}
        <div style={{
          position: "absolute", top: "20%", left: "50%",
          transform: "translateX(-50%)",
          width: "700px", height: "500px",
          background: "radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "760px", position: "relative" }}>
          {/* Tag */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.3rem 1rem",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "100px",
            fontSize: "0.72rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#C9A84C",
            marginBottom: "2rem",
          }}>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#C9A84C", display: "inline-block" }} />
            {c.hero_tag}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
            fontWeight: 300,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            marginBottom: "1.5rem",
            whiteSpace: "pre-line",
            color: "#F5F0E8",
          }}>
            {c.hero_title}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
            lineHeight: 1.7,
            color: "rgba(245,240,232,0.6)",
            maxWidth: "580px",
            margin: "0 auto 2.5rem",
          }}>
            {c.hero_subtitle}
          </p>

          {/* CTA */}
          <button
            onClick={scrollToSignup}
            style={{
              padding: "0.85rem 2.5rem",
              fontSize: "0.85rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "linear-gradient(135deg, #C9A84C 0%, #E8CC7A 50%, #C9A84C 100%)",
              backgroundSize: "200% 100%",
              border: "none",
              borderRadius: "3px",
              color: "#0A0A0F",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          >
            {c.hero_cta}
          </button>
        </div>

        {/* Decorative line */}
        <div style={{
          position: "absolute", bottom: "2rem", left: "50%",
          transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
        }}>
          <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, rgba(201,168,76,0.4), transparent)" }} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{
        padding: "6rem 1.5rem",
        background: "linear-gradient(180deg, #0A0A0F 0%, #0F0F1A 100%)",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            fontWeight: 300,
            letterSpacing: "0.02em",
            marginBottom: "4rem",
            color: "#F5F0E8",
          }}>
            {c.features_title}
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
          }}>
            {c.features.map((f, i) => (
              <div key={i} style={{
                padding: "2rem",
                border: "1px solid rgba(201,168,76,0.12)",
                borderRadius: "4px",
                background: "rgba(201,168,76,0.03)",
                transition: "border-color 0.3s, background 0.3s",
              }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "rgba(201,168,76,0.3)";
                  el.style.background = "rgba(201,168,76,0.06)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "rgba(201,168,76,0.12)";
                  el.style.background = "rgba(201,168,76,0.03)";
                }}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>{FEATURE_ICONS[i]}</div>
                <h3 style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  letterSpacing: "0.03em",
                  marginBottom: "0.75rem",
                  color: "#C9A84C",
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontSize: "0.875rem",
                  lineHeight: 1.7,
                  color: "rgba(245,240,232,0.55)",
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{
        padding: "6rem 1.5rem",
        background: "#0A0A0F",
      }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            fontWeight: 300,
            letterSpacing: "0.02em",
            marginBottom: "3rem",
            color: "#F5F0E8",
          }}>
            {c.pricing_title}
          </h2>

          <div style={{
            padding: "2.5rem",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "6px",
            background: "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(10,10,15,0) 100%)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Corner accent */}
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: "100px", height: "100px",
              background: "radial-gradient(circle at top right, rgba(201,168,76,0.15), transparent 70%)",
            }} />

            <div style={{
              display: "inline-block",
              padding: "0.25rem 0.75rem",
              border: "1px solid rgba(201,168,76,0.4)",
              borderRadius: "2px",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#C9A84C",
              marginBottom: "1.5rem",
            }}>
              {c.pricing_tier}
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <span style={{
                fontSize: "3.5rem",
                fontWeight: 200,
                letterSpacing: "-0.03em",
                color: "#F5F0E8",
              }}>
                {c.pricing_price}
              </span>
              <span style={{
                fontSize: "1rem",
                color: "rgba(245,240,232,0.45)",
                marginLeft: "0.25rem",
              }}>
                {c.pricing_period}
              </span>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", textAlign: "left" }}>
              {c.pricing_features.map((f, i) => (
                <li key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.6rem 0",
                  borderBottom: i < c.pricing_features.length - 1 ? "1px solid rgba(201,168,76,0.08)" : "none",
                  fontSize: "0.875rem",
                  color: "rgba(245,240,232,0.7)",
                }}>
                  <span style={{ color: "#C9A84C", flexShrink: 0 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={scrollToSignup}
              style={{
                width: "100%",
                padding: "0.85rem",
                fontSize: "0.82rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background: "linear-gradient(135deg, #C9A84C 0%, #E8CC7A 50%, #C9A84C 100%)",
                border: "none",
                borderRadius: "3px",
                color: "#0A0A0F",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {c.pricing_cta}
            </button>
          </div>
        </div>
      </section>

      {/* ── SIGN UP CTA ── */}
      <section
        ref={signupRef}
        style={{
          padding: "6rem 1.5rem",
          background: "linear-gradient(180deg, #0F0F1A 0%, #0A0A0F 100%)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          {/* Decorative line */}
          <div style={{
            width: "40px", height: "1px",
            background: "linear-gradient(90deg, transparent, #C9A84C, transparent)",
            margin: "0 auto 2rem",
          }} />

          <h2 style={{
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
            fontWeight: 300,
            letterSpacing: "0.01em",
            marginBottom: "1rem",
            color: "#F5F0E8",
            whiteSpace: "pre-line",
          }}>
            {c.cta_title}
          </h2>

          <p style={{
            fontSize: "0.9rem",
            lineHeight: 1.7,
            color: "rgba(245,240,232,0.55)",
            marginBottom: "2.5rem",
          }}>
            {c.cta_subtitle}
          </p>

          {sent ? (
            <div style={{
              padding: "1.5rem",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: "4px",
              background: "rgba(201,168,76,0.06)",
            }}>
              <p style={{ fontWeight: 500, color: "#C9A84C", marginBottom: "0.4rem" }}>
                {c.signup_sent_title}
              </p>
              <p style={{ fontSize: "0.85rem", color: "rgba(245,240,232,0.6)" }}>
                {c.signup_sent_desc} <strong style={{ color: "#F5F0E8" }}>{email}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={c.signup_placeholder}
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  fontSize: "0.9rem",
                  background: "rgba(245,240,232,0.04)",
                  border: "1px solid rgba(201,168,76,0.25)",
                  borderRadius: "3px",
                  color: "#F5F0E8",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(201,168,76,0.6)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(201,168,76,0.25)"; }}
              />

              {error && (
                <p style={{ fontSize: "0.8rem", color: "#e05c5c", textAlign: "left" }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "0.85rem",
                  fontSize: "0.82rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: loading
                    ? "rgba(201,168,76,0.35)"
                    : "linear-gradient(135deg, #C9A84C 0%, #E8CC7A 50%, #C9A84C 100%)",
                  border: "none",
                  borderRadius: "3px",
                  color: "#0A0A0F",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "opacity 0.2s",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? c.signup_sending : c.signup_button}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: "2rem 1.5rem",
        borderTop: "1px solid rgba(201,168,76,0.1)",
        textAlign: "center",
      }}>
        <p style={{ fontSize: "0.78rem", color: "rgba(245,240,232,0.3)", letterSpacing: "0.08em" }}>
          <span style={{ color: "rgba(201,168,76,0.5)" }}>MonaConcierge</span>
          {" · "}
          {c.footer_tagline}
        </p>
      </footer>
    </div>
  );
}
