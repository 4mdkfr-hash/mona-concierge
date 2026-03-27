"use client";

import { useState } from "react";

// ── FAKE DATA ────────────────────────────────────────────────────────────────

const VENUES = [
  { id: "v1", name: "Le Café de Paris", type: "Restaurant", emoji: "🍽️", city: "Monaco" },
  { id: "v2", name: "Boutique Élite Monaco", type: "Boutique", emoji: "👗", city: "Monaco" },
  { id: "v3", name: "Salon du Palais", type: "Salon", emoji: "💅", city: "Monte-Carlo" },
];

type Channel = "whatsapp" | "instagram" | "google_bm";

interface Message {
  direction: "inbound" | "outbound";
  content: string;
  time: string;
  ai?: boolean;
}

interface Conversation {
  id: string;
  venueId: string;
  channel: Channel;
  name: string;
  lang: string;
  lastMsg: string;
  lastTime: string;
  unread: boolean;
  messages: Message[];
}

const CONVERSATIONS: Conversation[] = [
  {
    id: "c1", venueId: "v1", channel: "whatsapp", name: "Sophie Leblanc", lang: "FR",
    lastMsg: "Parfait, merci beaucoup !", lastTime: "14:32", unread: false,
    messages: [
      { direction: "inbound", content: "Bonjour, est-ce qu'il est possible de réserver une table pour 4 personnes ce soir ?", time: "14:20" },
      { direction: "outbound", content: "Bonjour Sophie ! Bien sûr, nous avons une table disponible à 20h00. Souhaitez-vous confirmer cette réservation ?", time: "14:21", ai: true },
      { direction: "inbound", content: "Oui, 20h00 c'est parfait !", time: "14:31" },
      { direction: "outbound", content: "Votre table pour 4 personnes est confirmée ce soir à 20h00. À tout à l'heure ! 🍽️", time: "14:32", ai: true },
      { direction: "inbound", content: "Parfait, merci beaucoup !", time: "14:32" },
    ],
  },
  {
    id: "c2", venueId: "v1", channel: "whatsapp", name: "Mikhail Petrov", lang: "RU",
    lastMsg: "Отличный сервис, спасибо!", lastTime: "13:15", unread: false,
    messages: [
      { direction: "inbound", content: "Здравствуйте! Есть ли у вас меню на русском языке?", time: "13:00" },
      { direction: "outbound", content: "Здравствуйте, Михаил! Да, наше меню доступно на русском, французском и английском языках. Хотите забронировать столик?", time: "13:02", ai: true },
      { direction: "inbound", content: "Да, на двоих завтра вечером", time: "13:10" },
      { direction: "outbound", content: "Отличный выбор! Столик на двоих завтра — в какое время вам удобно? 19:00, 20:00 или 21:00?", time: "13:11", ai: true },
      { direction: "inbound", content: "Отличный сервис, спасибо!", time: "13:15" },
    ],
  },
  {
    id: "c3", venueId: "v1", channel: "instagram", name: "James Anderson", lang: "EN",
    lastMsg: "See you tonight!", lastTime: "12:05", unread: true,
    messages: [
      { direction: "inbound", content: "Hi! Do you take reservations for the terrace?", time: "11:50" },
      { direction: "outbound", content: "Hello James! Yes, our terrace is available with stunning views of the harbour. Shall I book you a spot?", time: "11:52", ai: true },
      { direction: "inbound", content: "Yes please, 2 people at 7:30pm tonight", time: "12:00" },
      { direction: "outbound", content: "Perfect! Your terrace table for 2 is confirmed at 19:30 tonight. We look forward to welcoming you! 🌊", time: "12:01", ai: true },
      { direction: "inbound", content: "See you tonight!", time: "12:05" },
    ],
  },
  {
    id: "c4", venueId: "v2", channel: "whatsapp", name: "Isabelle Moreau", lang: "FR",
    lastMsg: "Je serai là à 15h.", lastTime: "11:44", unread: true,
    messages: [
      { direction: "inbound", content: "Bonjour, avez-vous la nouvelle collection Printemps en stock ?", time: "11:30" },
      { direction: "outbound", content: "Bonjour Isabelle ! Oui, notre collection Printemps-Été vient d'arriver. Nous avons des pièces exclusives disponibles en boutique. Souhaitez-vous prendre rendez-vous ?", time: "11:32", ai: true },
      { direction: "inbound", content: "Oui, cet après-midi si possible", time: "11:40" },
      { direction: "outbound", content: "Bien sûr ! Notre styliste personnelle est disponible à 15h00 ou 17h00. Quelle heure vous convient ?", time: "11:42", ai: true },
      { direction: "inbound", content: "Je serai là à 15h.", time: "11:44" },
    ],
  },
  {
    id: "c5", venueId: "v2", channel: "whatsapp", name: "Anna Kuznetsova", lang: "RU",
    lastMsg: "Спасибо за информацию!", lastTime: "10:20", unread: false,
    messages: [
      { direction: "inbound", content: "Добрый день! Есть ли у вас сумки Chanel?", time: "10:10" },
      { direction: "outbound", content: "Добрый день, Анна! У нас есть эксклюзивные сумки премиум-класса. Для консультации с нашим стилистом позвоните или запишитесь онлайн.", time: "10:13", ai: true },
      { direction: "inbound", content: "Спасибо за информацию!", time: "10:20" },
    ],
  },
  {
    id: "c6", venueId: "v2", channel: "instagram", name: "Emma Williams", lang: "EN",
    lastMsg: "Amazing pieces, thank you!", lastTime: "09:58", unread: false,
    messages: [
      { direction: "inbound", content: "Do you ship internationally?", time: "09:45" },
      { direction: "outbound", content: "Hello Emma! Yes, we offer worldwide shipping with full insurance and discreet packaging. Which item caught your eye?", time: "09:47", ai: true },
      { direction: "inbound", content: "Amazing pieces, thank you!", time: "09:58" },
    ],
  },
  {
    id: "c7", venueId: "v3", channel: "whatsapp", name: "Chloé Dumont", lang: "FR",
    lastMsg: "À demain alors !", lastTime: "Yesterday", unread: false,
    messages: [
      { direction: "inbound", content: "Bonjour ! Je voudrais prendre un rendez-vous pour une manucure et un soin visage.", time: "16:00" },
      { direction: "outbound", content: "Bonjour Chloé ! Nous avons des créneaux disponibles demain : 10h00, 14h00 ou 16h30. Quelle durée souhaitez-vous ? (manucure + soin = environ 2h)", time: "16:02", ai: true },
      { direction: "inbound", content: "14h00 c'est bien pour moi", time: "16:10" },
      { direction: "outbound", content: "Parfait ! Rendez-vous confirmé demain à 14h00 pour manucure + soin visage. Nous vous attendons ! 💅", time: "16:11", ai: true },
      { direction: "inbound", content: "À demain alors !", time: "16:15" },
    ],
  },
  {
    id: "c8", venueId: "v3", channel: "whatsapp", name: "Natasha Ivanova", lang: "RU",
    lastMsg: "Записалась, жду встречи!", lastTime: "Yesterday", unread: false,
    messages: [
      { direction: "inbound", content: "Здравствуйте! Делаете ли вы кератиновое выпрямление?", time: "11:05" },
      { direction: "outbound", content: "Здравствуйте, Наташа! Да, мы предлагаем профессиональное кератиновое выпрямление с использованием лучших бразильских средств. Хотите записаться?", time: "11:07", ai: true },
      { direction: "inbound", content: "Записалась, жду встречи!", time: "11:20" },
    ],
  },
  {
    id: "c9", venueId: "v1", channel: "google_bm", name: "Pierre Fontaine", lang: "FR",
    lastMsg: "Merci pour votre réponse !", lastTime: "2 days ago", unread: false,
    messages: [
      { direction: "inbound", content: "Bonsoir, y a-t-il un dress code pour le dîner ?", time: "19:30" },
      { direction: "outbound", content: "Bonsoir Pierre ! Nous recommandons une tenue élégante décontractée pour le dîner. Pas de short ni de tongs, mais pas besoin de smoking. À bientôt !", time: "19:32", ai: true },
      { direction: "inbound", content: "Merci pour votre réponse !", time: "19:35" },
    ],
  },
  {
    id: "c10", venueId: "v3", channel: "instagram", name: "Laura Martinez", lang: "EN",
    lastMsg: "Perfect, booked!", lastTime: "2 days ago", unread: false,
    messages: [
      { direction: "inbound", content: "Hi, what are your opening hours?", time: "10:00" },
      { direction: "outbound", content: "Hello Laura! We're open Monday to Saturday 9:00–19:00, and Sunday 10:00–17:00. Would you like to book an appointment?", time: "10:02", ai: true },
      { direction: "inbound", content: "Perfect, booked!", time: "10:10" },
    ],
  },
];

interface Booking {
  id: string;
  venueId: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  status: "confirmed" | "pending" | "completed";
  notes: string;
}

const BOOKINGS: Booking[] = [
  { id: "b1", venueId: "v1", name: "Sophie Leblanc", date: "27 Mar", time: "20:00", guests: 4, status: "confirmed", notes: "Terrace preference" },
  { id: "b2", venueId: "v1", name: "James Anderson", date: "27 Mar", time: "19:30", guests: 2, status: "confirmed", notes: "Anniversary dinner" },
  { id: "b3", venueId: "v3", name: "Chloé Dumont", date: "28 Mar", time: "14:00", guests: 1, status: "confirmed", notes: "Manicure + facial" },
  { id: "b4", venueId: "v2", name: "Isabelle Moreau", date: "27 Mar", time: "15:00", guests: 1, status: "confirmed", notes: "Spring collection styling" },
  { id: "b5", venueId: "v1", name: "Mikhail Petrov", date: "28 Mar", time: "20:00", guests: 2, status: "pending", notes: "Awaiting confirmation" },
];

interface Review {
  id: string;
  venueId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  reply?: string;
  aiReply?: boolean;
}

const REVIEWS: Review[] = [
  {
    id: "r1", venueId: "v1", author: "Sophie M.", rating: 5,
    text: "Une expérience culinaire exceptionnelle ! Le service était impeccable et les plats absolument délicieux. Le cadre avec vue sur le port de Monaco est magnifique.",
    date: "24 Mar",
    reply: "Chère Sophie, merci infiniment pour ce magnifique retour. Toute l'équipe est ravie de vous avoir offert une telle expérience. Nous espérons vous revoir très prochainement ! 🍽️",
    aiReply: true,
  },
  {
    id: "r2", venueId: "v1", author: "James A.", rating: 5,
    text: "Absolutely outstanding dinner. The tuna tartare was the best I've ever had, and the sommelier's wine pairing was impeccable. Highly recommend.",
    date: "22 Mar",
    reply: "Dear James, thank you so much for your wonderful words! Our team is delighted to have exceeded your expectations. We look forward to welcoming you again soon! 🌟",
    aiReply: true,
  },
  {
    id: "r3", venueId: "v1", author: "Mikhail P.", rating: 4,
    text: "Отличный ресторан с прекрасной атмосферой. Обслуживание на высоте, хотя ждали стол немного дольше обычного. В целом очень рекомендую.",
    date: "20 Mar",
    reply: "Михаил, благодарим вас за отзыв! Нам очень приятно, что вам понравилась атмосфера и сервис. Приносим извинения за небольшое ожидание — мы работаем над улучшением. Ждём вас снова! 🥂",
    aiReply: true,
  },
  {
    id: "r4", venueId: "v2", author: "Emma W.", rating: 5,
    text: "The boutique is stunning — beautiful curated selection and incredibly attentive staff. Found the perfect dress for the Gala. Will definitely be back.",
    date: "25 Mar",
    reply: "Dear Emma, thank you for your lovely review! It was a pleasure assisting you in finding the perfect piece for your Gala. We look forward to your next visit! ✨",
    aiReply: true,
  },
  {
    id: "r5", venueId: "v2", author: "Anna K.", rating: 5,
    text: "Превосходный бутик! Персонал очень внимательный и профессиональный. Огромный выбор эксклюзивных вещей. Обязательно вернусь!",
    date: "23 Mar",
    reply: "Дорогая Анна, большое спасибо за ваш отзыв! Нам очень приятно, что ваш визит оставил такие положительные впечатления. Ждём вас снова! 💎",
    aiReply: true,
  },
  {
    id: "r6", venueId: "v2", author: "Isabelle M.", rating: 4,
    text: "Belle sélection de pièces uniques. Le service personnalisé avec la styliste était un vrai plus. Quelques prix un peu élevés mais la qualité est au rendez-vous.",
    date: "21 Mar",
    reply: "Chère Isabelle, merci pour votre retour ! Nous sommes ravis que l'expérience avec notre styliste vous ait plu. Votre fidélité est très précieuse pour nous. À très bientôt ! 🌸",
    aiReply: true,
  },
  {
    id: "r7", venueId: "v3", author: "Chloé D.", rating: 5,
    text: "Le meilleur salon de beauté de Monaco ! L'équipe est talentueuse et l'ambiance est relaxante. Mon soin visage était absolument parfait. Je recommande sans hésitation.",
    date: "26 Mar",
    reply: "Chère Chloé, merci mille fois pour ce retour magnifique ! Toute l'équipe est touchée par vos mots. Votre satisfaction est notre plus grande récompense. À très vite ! 💅",
    aiReply: true,
  },
  {
    id: "r8", venueId: "v3", author: "Natasha I.", rating: 5,
    text: "Кератиновое выпрямление — просто чудо! Волосы стали шелковистыми и блестящими. Мастера настоящие профессионалы. Очень рекомендую всем!",
    date: "24 Mar",
    reply: "Дорогая Наташа, спасибо за такой тёплый отзыв! Мы рады, что результат превзошёл ваши ожидания. Будем рады видеть вас снова! ✨",
    aiReply: true,
  },
  {
    id: "r9", venueId: "v3", author: "Laura M.", rating: 4,
    text: "Great salon with skilled staff. The manicure was flawless and the atmosphere is very relaxing. Slightly difficult to find parking nearby but worth the effort.",
    date: "22 Mar",
    reply: "Dear Laura, thank you for your kind review! We're delighted you enjoyed your experience with us. Apologies for the parking inconvenience — we hope to see you again soon! 🌺",
    aiReply: true,
  },
  {
    id: "r10", venueId: "v1", author: "Pierre F.", rating: 5,
    text: "Dîner mémorable dans un cadre exceptionnel. La vue sur le port, la qualité de la cuisine et l'attention portée aux détails font de cet établissement une adresse incontournable à Monaco.",
    date: "19 Mar",
    reply: "Cher Pierre, merci infiniment pour ces mots touchants ! Nous mettons tout notre cœur à offrir une expérience inoubliable. C'est un honneur de vous compter parmi nos habitués. À bientôt ! 🥂",
    aiReply: true,
  },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────

const CHANNEL_ICONS: Record<Channel, string> = {
  whatsapp: "💬",
  instagram: "📸",
  google_bm: "🔍",
};

const CHANNEL_LABELS: Record<Channel, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  google_bm: "Google",
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  confirmed: { bg: "rgba(201,168,76,0.12)", color: "#C9A84C", label: "Confirmed" },
  pending: { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", label: "Pending" },
  completed: { bg: "rgba(16,185,129,0.12)", color: "#10B981", label: "Completed" },
};

function Stars({ n }: { n: number }) {
  return (
    <span style={{ color: "#C9A84C", fontSize: "0.8rem" }}>
      {"★".repeat(n)}{"☆".repeat(5 - n)}
    </span>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────

type Tab = "inbox" | "bookings" | "reviews";

export default function DemoPage() {
  const [venueId, setVenueId] = useState("v1");
  const [tab, setTab] = useState<Tab>("inbox");
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  const venue = VENUES.find((v) => v.id === venueId)!;
  const conversations = CONVERSATIONS.filter((c) => c.venueId === venueId);
  const bookings = BOOKINGS.filter((b) => b.venueId === venueId);
  const reviews = REVIEWS.filter((r) => r.venueId === venueId);

  // stats
  const unreadCount = conversations.filter((c) => c.unread).length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  const NAV_TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "inbox", label: "Inbox", icon: "💬" },
    { key: "bookings", label: "Bookings", icon: "📅" },
    { key: "reviews", label: "Reviews", icon: "⭐" },
  ];

  const S = {
    page: { display: "flex", height: "100vh", background: "#0A0A0F", color: "#F5F0E8", fontFamily: "inherit", overflow: "hidden" } as React.CSSProperties,
    sidebar: { width: "220px", flexShrink: 0, background: "#0D0D17", borderRight: "1px solid rgba(201,168,76,0.1)", display: "flex", flexDirection: "column" as const, overflow: "hidden" },
    main: { flex: 1, display: "flex", flexDirection: "column" as const, overflow: "hidden" },
    topbar: { padding: "0 1.5rem", height: "60px", borderBottom: "1px solid rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  };

  return (
    <div style={S.page}>
      {/* ── SIDEBAR ── */}
      <aside style={S.sidebar}>
        {/* Logo */}
        <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
          <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#C9A84C", letterSpacing: "0.04em" }}>
            MonaConcierge
          </div>
          <div style={{ fontSize: "0.65rem", color: "rgba(245,240,232,0.35)", marginTop: "2px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            DEMO
          </div>
        </div>

        {/* Venue picker */}
        <div style={{ padding: "1rem", borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
          <div style={{ fontSize: "0.65rem", color: "rgba(245,240,232,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Venue
          </div>
          {VENUES.map((v) => (
            <button
              key={v.id}
              onClick={() => { setVenueId(v.id); setSelectedConv(null); }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "0.5rem 0.6rem",
                marginBottom: "2px",
                borderRadius: "4px",
                border: "none",
                background: venueId === v.id ? "rgba(201,168,76,0.1)" : "transparent",
                color: venueId === v.id ? "#C9A84C" : "rgba(245,240,232,0.6)",
                cursor: "pointer",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>{v.emoji}</span>
              <div>
                <div style={{ fontWeight: venueId === v.id ? 500 : 400 }}>{v.name}</div>
                <div style={{ fontSize: "0.65rem", opacity: 0.6 }}>{v.type} · {v.city}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Nav */}
        <nav style={{ padding: "0.75rem 0.75rem", flex: 1 }}>
          {NAV_TABS.map((t) => {
            const badge = t.key === "inbox" ? unreadCount
              : t.key === "bookings" ? confirmedBookings
              : 0;
            return (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setSelectedConv(null); }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "0.6rem 0.75rem",
                  marginBottom: "2px",
                  borderRadius: "4px",
                  border: "none",
                  background: tab === t.key ? "rgba(201,168,76,0.1)" : "transparent",
                  color: tab === t.key ? "#C9A84C" : "rgba(245,240,232,0.55)",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {t.icon} {t.label}
                </span>
                {badge > 0 && (
                  <span style={{ background: "#C9A84C", color: "#0A0A0F", borderRadius: "100px", fontSize: "0.6rem", fontWeight: 700, padding: "1px 6px" }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Demo badge */}
        <div style={{ padding: "1rem", borderTop: "1px solid rgba(201,168,76,0.08)" }}>
          <div style={{ padding: "0.5rem 0.75rem", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "4px", fontSize: "0.68rem", color: "rgba(201,168,76,0.7)", textAlign: "center" }}>
            ✦ Live Demo — Fake Data
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={S.main}>
        {/* Topbar */}
        <div style={S.topbar}>
          <div>
            <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{venue.emoji} {venue.name}</div>
            <div style={{ fontSize: "0.7rem", color: "rgba(245,240,232,0.4)" }}>{venue.type} · {venue.city}</div>
          </div>
          {/* Stats pills */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {[
              { label: "Conversations", val: conversations.length, icon: "💬" },
              { label: "Bookings", val: confirmedBookings, icon: "📅" },
              { label: "Avg Rating", val: avgRating + " ★", icon: "⭐" },
            ].map((s) => (
              <div key={s.label} style={{ padding: "0.3rem 0.75rem", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "4px", fontSize: "0.72rem", textAlign: "center" }}>
                <div style={{ color: "#C9A84C", fontWeight: 600 }}>{s.icon} {s.val}</div>
                <div style={{ color: "rgba(245,240,232,0.4)", fontSize: "0.62rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        {tab === "inbox" && (
          <InboxPanel
            conversations={conversations}
            selected={selectedConv}
            onSelect={setSelectedConv}
          />
        )}
        {tab === "bookings" && <BookingsPanel bookings={bookings} />}
        {tab === "reviews" && <ReviewsPanel reviews={reviews} />}
      </div>
    </div>
  );
}

// ── INBOX PANEL ──────────────────────────────────────────────────────────────

function InboxPanel({
  conversations,
  selected,
  onSelect,
}: {
  conversations: Conversation[];
  selected: Conversation | null;
  onSelect: (c: Conversation) => void;
}) {
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* List */}
      <div style={{ width: "280px", flexShrink: 0, borderRight: "1px solid rgba(201,168,76,0.08)", overflowY: "auto" }}>
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "0.85rem 1rem",
              borderBottom: "1px solid rgba(201,168,76,0.06)",
              background: selected?.id === c.id ? "rgba(201,168,76,0.05)" : "transparent",
              cursor: "pointer",
              color: "#F5F0E8",
              border: "none",
              borderLeft: selected?.id === c.id ? "2px solid #C9A84C" : "2px solid transparent",
              display: "block",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "0.72rem", color: "rgba(245,240,232,0.45)" }}>
                {CHANNEL_ICONS[c.channel]} {CHANNEL_LABELS[c.channel]}
              </span>
              <span style={{ fontSize: "0.68rem", color: "rgba(245,240,232,0.3)" }}>{c.lastTime}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {c.unread && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C9A84C", flexShrink: 0 }} />}
              <span style={{ fontWeight: c.unread ? 600 : 400, fontSize: "0.82rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
              <span style={{ fontSize: "0.62rem", padding: "1px 5px", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "2px", color: "rgba(201,168,76,0.6)", flexShrink: 0 }}>{c.lang}</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(245,240,232,0.4)", marginTop: "0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.lastMsg}</div>
          </button>
        ))}
      </div>

      {/* Thread */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selected ? (
          <>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(201,168,76,0.08)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", color: "#C9A84C", fontWeight: 600 }}>
                {selected.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: "0.88rem" }}>{selected.name}</div>
                <div style={{ fontSize: "0.7rem", color: "rgba(245,240,232,0.4)" }}>
                  {CHANNEL_ICONS[selected.channel]} {CHANNEL_LABELS[selected.channel]} · {selected.lang}
                </div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {selected.messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.direction === "outbound" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "72%",
                    padding: "0.6rem 0.9rem",
                    borderRadius: m.direction === "outbound" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    background: m.direction === "outbound"
                      ? "linear-gradient(135deg, #C9A84C, #E8CC7A)"
                      : "rgba(245,240,232,0.06)",
                    border: m.direction === "inbound" ? "1px solid rgba(201,168,76,0.12)" : "none",
                    color: m.direction === "outbound" ? "#0A0A0F" : "#F5F0E8",
                    fontSize: "0.83rem",
                    lineHeight: 1.55,
                  }}>
                    <p style={{ margin: 0 }}>{m.content}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem", opacity: 0.6, fontSize: "0.65rem" }}>
                      <span>{m.time}</span>
                      {m.ai && <span>✦ AI</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid rgba(201,168,76,0.08)" }}>
              <div style={{ display: "flex", gap: "0.5rem", padding: "0.6rem 0.9rem", background: "rgba(245,240,232,0.03)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: "6px" }}>
                <input
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#F5F0E8", fontSize: "0.82rem" }}
                  placeholder="Type a reply… (demo mode)"
                  readOnly
                />
                <button style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "4px", color: "#C9A84C", cursor: "pointer", padding: "0.25rem 0.7rem", fontSize: "0.75rem" }}>
                  Send
                </button>
              </div>
              <div style={{ marginTop: "0.4rem", fontSize: "0.65rem", color: "rgba(245,240,232,0.3)", textAlign: "center" }}>
                ✦ AI auto-replies are enabled
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "rgba(245,240,232,0.25)" }}>
            <div style={{ fontSize: "2rem" }}>💬</div>
            <div style={{ fontSize: "0.82rem" }}>Select a conversation</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── BOOKINGS PANEL ───────────────────────────────────────────────────────────

function BookingsPanel({ bookings }: { bookings: Booking[] }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
      <div style={{ maxWidth: "700px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 400, marginBottom: "1.25rem", color: "rgba(245,240,232,0.7)", letterSpacing: "0.03em" }}>
          Upcoming Bookings
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {bookings.length === 0 ? (
            <div style={{ fontSize: "0.82rem", color: "rgba(245,240,232,0.3)", padding: "2rem", textAlign: "center", border: "1px dashed rgba(201,168,76,0.15)", borderRadius: "6px" }}>
              No bookings yet
            </div>
          ) : bookings.map((b) => {
            const s = STATUS_STYLE[b.status];
            return (
              <div key={b.id} style={{ padding: "1rem 1.25rem", border: "1px solid rgba(201,168,76,0.12)", borderRadius: "6px", background: "rgba(201,168,76,0.02)", display: "flex", alignItems: "center", gap: "1rem", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "6px", background: "rgba(201,168,76,0.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "#C9A84C", lineHeight: 1.2 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{b.date.split(" ")[0]}</div>
                    <div>{b.date.split(" ")[1]}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: "0.88rem" }}>{b.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "rgba(245,240,232,0.45)", marginTop: "2px" }}>
                      {b.time} · {b.guests} {b.guests === 1 ? "guest" : "guests"}
                      {b.notes && <span style={{ marginLeft: "0.5rem", opacity: 0.7 }}>— {b.notes}</span>}
                    </div>
                  </div>
                </div>
                <span style={{ padding: "0.25rem 0.7rem", borderRadius: "3px", background: s.bg, color: s.color, fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── REVIEWS PANEL ────────────────────────────────────────────────────────────

function ReviewsPanel({ reviews }: { reviews: Review[] }) {
  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
      <div style={{ maxWidth: "700px" }}>
        {avg && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem 1.25rem", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "6px", background: "rgba(201,168,76,0.04)", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 200, color: "#C9A84C", lineHeight: 1 }}>{avg}</div>
            <div>
              <Stars n={Math.round(parseFloat(avg))} />
              <div style={{ fontSize: "0.72rem", color: "rgba(245,240,232,0.45)", marginTop: "2px" }}>Based on {reviews.length} Google reviews</div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ padding: "1rem 1.25rem", border: "1px solid rgba(201,168,76,0.1)", borderRadius: "6px", background: "rgba(201,168,76,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "#C9A84C", fontWeight: 600 }}>
                    {r.author.charAt(0)}
                  </div>
                  <span style={{ fontWeight: 500, fontSize: "0.84rem" }}>{r.author}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <Stars n={r.rating} />
                  <span style={{ fontSize: "0.68rem", color: "rgba(245,240,232,0.35)" }}>{r.date}</span>
                </div>
              </div>
              <p style={{ fontSize: "0.8rem", lineHeight: 1.6, color: "rgba(245,240,232,0.65)", margin: "0 0 0.75rem" }}>
                {r.text}
              </p>
              {r.reply && (
                <div style={{ padding: "0.75rem", background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.1)", borderLeft: "2px solid rgba(201,168,76,0.4)", borderRadius: "0 4px 4px 0" }}>
                  <div style={{ fontSize: "0.65rem", color: "#C9A84C", marginBottom: "0.35rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {r.aiReply ? "✦ AI Response" : "Response"}
                  </div>
                  <p style={{ fontSize: "0.78rem", lineHeight: 1.6, color: "rgba(245,240,232,0.55)", margin: 0 }}>
                    {r.reply}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
