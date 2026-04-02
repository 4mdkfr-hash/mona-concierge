"use client";

import { useEffect, useState } from "react";
import { useVenue } from "@/contexts/VenueContext";

interface Message {
  id: string;
  direction: "inbound" | "outbound";
  content: string;
  created_at: string;
  ai_generated: boolean;
}

interface Conversation {
  id: string;
  channel: string;
  customer_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  status: string;
  last_message_at: string;
  ai_enabled: boolean;
  needs_attention: boolean;
  messages: Message[];
}

const CHANNEL_ICONS: Record<string, string> = {
  whatsapp: "💬",
  instagram: "📸",
  google_bm: "🔍",
};

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  google_bm: "Google",
};

const STATUS_COLORS: Record<string, string> = {
  open: "#C4A35A",
  resolved: "#10B981",
  pending: "#F59E0B",
};

export default function InboxPage() {
  const { venueId } = useVenue();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");

  useEffect(() => {
    fetchConversations();
  }, [venueId]);

  async function fetchConversations() {
    setLoading(true);
    const res = await fetch(`/api/conversations?venueId=${venueId}`);
    if (res.ok) {
      const data: Conversation[] = await res.json();
      // Sort: needs_attention first, then by last_message_at
      data.sort((a, b) => {
        if (a.needs_attention && !b.needs_attention) return -1;
        if (!a.needs_attention && b.needs_attention) return 1;
        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
      });
      setConversations(data);
    }
    setLoading(false);
  }

  async function sendReply() {
    if (!selected || !replyText.trim()) return;
    setSending(true);
    const res = await fetch(`/api/conversations/${selected.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: replyText }),
    });
    if (res.ok) {
      setReplyText("");
      await fetchConversations();
      const updated = conversations.find((c) => c.id === selected.id);
      if (updated) setSelected(updated);
    }
    setSending(false);
  }

  async function toggleAI(conversationId: string, currentValue: boolean) {
    const res = await fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ai_enabled: !currentValue }),
    });
    if (res.ok) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, ai_enabled: !currentValue } : c
        )
      );
      if (selected?.id === conversationId) {
        setSelected((prev) => prev ? { ...prev, ai_enabled: !currentValue } : prev);
      }
    }
  }

  async function clearAttention(conversationId: string) {
    const res = await fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ needs_attention: false }),
    });
    if (res.ok) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, needs_attention: false } : c
        )
      );
      if (selected?.id === conversationId) {
        setSelected((prev) => prev ? { ...prev, needs_attention: false } : prev);
      }
    }
  }

  const displayName = (c: Conversation) =>
    c.customer_name ?? c.customer_phone ?? c.customer_id;

  const filtered = conversations.filter((c) =>
    filter === "all" ? true : c.status === filter
  );

  const openCount = conversations.filter((c) => c.status === "open").length;
  const resolvedCount = conversations.filter((c) => c.status === "resolved").length;
  const attentionCount = conversations.filter((c) => c.needs_attention).length;

  return (
    <div style={{ display: "flex", height: "100%", background: "#F0F4F8", color: "#0F2B3C" }}>
      {/* Sidebar */}
      <div style={{ width: "300px", flexShrink: 0, borderRight: "1px solid #DDE4EB", display: "flex", flexDirection: "column", overflow: "hidden", background: "#FFFFFF" }}>
        {/* Header */}
        <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid #DDE4EB" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <h1 style={{ fontSize: "0.95rem", fontWeight: 500, color: "#0F2B3C" }}>Inbox</h1>
            <button
              onClick={fetchConversations}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(15,43,60,0.35)", fontSize: "0.8rem", padding: "0.25rem" }}
              title="Refresh"
            >
              ↻
            </button>
          </div>

          {/* Stats mini */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ flex: 1, textAlign: "center", padding: "0.4rem", background: "rgba(196,163,90,0.07)", borderRadius: "4px", border: "1px solid rgba(196,163,90,0.15)" }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#C4A35A" }}>{openCount}</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(91,143,168,0.6)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Open</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "0.4rem", background: "rgba(16,185,129,0.06)", borderRadius: "4px", border: "1px solid rgba(16,185,129,0.12)" }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#10B981" }}>{resolvedCount}</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(91,143,168,0.6)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Resolved</div>
            </div>
            {attentionCount > 0 && (
              <div style={{ flex: 1, textAlign: "center", padding: "0.4rem", background: "rgba(245,158,11,0.07)", borderRadius: "4px", border: "1px solid rgba(245,158,11,0.2)" }}>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#F59E0B" }}>{attentionCount}</div>
                <div style={{ fontSize: "0.6rem", color: "rgba(91,143,168,0.6)", textTransform: "uppercase", letterSpacing: "0.06em" }}>⚠ Alert</div>
              </div>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #DDE4EB", padding: "0 1rem" }}>
          {(["all", "open", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flex: 1,
                padding: "0.6rem 0",
                background: "transparent",
                border: "none",
                borderBottom: filter === f ? "2px solid #C4A35A" : "2px solid transparent",
                color: filter === f ? "#C4A35A" : "rgba(91,143,168,0.55)",
                fontSize: "0.72rem",
                textTransform: "capitalize",
                cursor: "pointer",
                transition: "color 0.15s",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", background: "#FFFFFF" }}>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "rgba(91,143,168,0.4)", fontSize: "0.8rem" }}>
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "rgba(91,143,168,0.3)", fontSize: "0.8rem" }}>
              No conversations
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "0.85rem 1rem",
                  borderBottom: "1px solid #F0F4F8",
                  background: c.needs_attention
                    ? "rgba(245,158,11,0.04)"
                    : selected?.id === c.id
                    ? "rgba(196,163,90,0.05)"
                    : "transparent",
                  cursor: "pointer",
                  color: "#0F2B3C",
                  border: "none",
                  borderLeft: c.needs_attention
                    ? "2px solid #F59E0B"
                    : selected?.id === c.id
                    ? "2px solid #C4A35A"
                    : "2px solid transparent",
                  display: "block",
                  transition: "background 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.7rem", color: "rgba(91,143,168,0.55)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    {CHANNEL_ICONS[c.channel] ?? "📩"} {CHANNEL_LABELS[c.channel] ?? c.channel}
                    {c.needs_attention && <span style={{ color: "#F59E0B", fontSize: "0.65rem" }}>⚠</span>}
                    {!c.ai_enabled && <span style={{ color: "rgba(91,143,168,0.45)", fontSize: "0.6rem", background: "rgba(91,143,168,0.08)", borderRadius: "3px", padding: "1px 4px" }}>AI off</span>}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{
                      display: "inline-block",
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: STATUS_COLORS[c.status] ?? "rgba(15,43,60,0.2)",
                    }} />
                    <span style={{ fontSize: "0.65rem", color: "rgba(91,143,168,0.4)" }}>
                      {new Date(c.last_message_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
                <div style={{ fontWeight: 500, fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#0F2B3C" }}>
                  {displayName(c)}
                </div>
                {c.messages.length > 0 && (
                  <div style={{ fontSize: "0.72rem", color: "rgba(91,143,168,0.5)", marginTop: "0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.messages[c.messages.length - 1].content}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread view */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#F0F4F8" }}>
        {selected ? (
          <>
            {/* Attention banner */}
            {selected.needs_attention && (
              <div style={{
                padding: "0.6rem 1.25rem",
                background: "rgba(245,158,11,0.08)",
                borderBottom: "1px solid rgba(245,158,11,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <span style={{ fontSize: "0.78rem", color: "#B45309", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  ⚠ AI requires your attention in this conversation
                </span>
                <button
                  onClick={() => clearAttention(selected.id)}
                  style={{ background: "transparent", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "4px", color: "#B45309", fontSize: "0.7rem", padding: "0.2rem 0.6rem", cursor: "pointer" }}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Thread header */}
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #DDE4EB", display: "flex", alignItems: "center", gap: "0.75rem", background: "#FFFFFF" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "50%",
                background: "rgba(196,163,90,0.1)",
                border: "1px solid rgba(196,163,90,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.9rem", color: "#C4A35A", fontWeight: 600,
              }}>
                {displayName(selected).charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: "0.9rem", color: "#0F2B3C" }}>{displayName(selected)}</div>
                <div style={{ fontSize: "0.7rem", color: "rgba(91,143,168,0.6)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {CHANNEL_ICONS[selected.channel]} {CHANNEL_LABELS[selected.channel] ?? selected.channel}
                  <span style={{ color: STATUS_COLORS[selected.status] ?? "rgba(91,143,168,0.4)" }}>
                    · {selected.status}
                  </span>
                </div>
              </div>

              {/* AI toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.7rem", color: "rgba(91,143,168,0.55)" }}>AI</span>
                <button
                  onClick={() => toggleAI(selected.id, selected.ai_enabled)}
                  title={selected.ai_enabled ? "AI auto-reply ON — click to disable" : "AI auto-reply OFF — click to enable"}
                  style={{
                    width: "36px",
                    height: "20px",
                    borderRadius: "10px",
                    background: selected.ai_enabled ? "#C4A35A" : "rgba(91,143,168,0.2)",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: "absolute",
                    top: "3px",
                    left: selected.ai_enabled ? "18px" : "3px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "#FFFFFF",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  }} />
                </button>
              </div>

              <div style={{ fontSize: "0.7rem", color: "rgba(91,143,168,0.45)" }}>
                {selected.messages.length} msgs
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {selected.messages.map((m) => (
                <div
                  key={m.id}
                  style={{ display: "flex", justifyContent: m.direction === "outbound" ? "flex-end" : "flex-start" }}
                >
                  <div style={{
                    maxWidth: "70%",
                    padding: "0.65rem 0.9rem",
                    borderRadius: m.direction === "outbound" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    background: m.direction === "outbound"
                      ? "linear-gradient(135deg, #C4A35A, #D4B870)"
                      : "#FFFFFF",
                    border: m.direction === "inbound" ? "1px solid #DDE4EB" : "none",
                    color: m.direction === "outbound" ? "#FFFFFF" : "#0F2B3C",
                    fontSize: "0.84rem",
                    lineHeight: 1.55,
                  }}>
                    <p style={{ margin: 0 }}>{m.content}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.4rem", marginTop: "0.3rem", opacity: 0.6, fontSize: "0.65rem" }}>
                      <span>{new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                      {m.ai_generated && <span>✦ AI</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply input */}
            <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid #DDE4EB", background: "#FFFFFF" }}>
              {!selected.ai_enabled && (
                <div style={{ marginBottom: "0.5rem", fontSize: "0.72rem", color: "rgba(91,143,168,0.55)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <span style={{ color: "#C4A35A" }}>●</span> AI auto-reply is disabled — your reply will be sent manually
                </div>
              )}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  style={{
                    flex: 1,
                    padding: "0.65rem 0.9rem",
                    background: "#F0F4F8",
                    border: "1px solid #DDE4EB",
                    borderRadius: "6px",
                    color: "#0F2B3C",
                    fontSize: "0.84rem",
                    outline: "none",
                  }}
                  placeholder="Type a reply…"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(196,163,90,0.4)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#DDE4EB"; }}
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !replyText.trim()}
                  style={{
                    padding: "0.65rem 1.1rem",
                    background: sending || !replyText.trim() ? "rgba(196,163,90,0.15)" : "#C4A35A",
                    border: "none",
                    borderRadius: "6px",
                    color: sending || !replyText.trim() ? "rgba(91,143,168,0.5)" : "#FFFFFF",
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    cursor: sending || !replyText.trim() ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {sending ? "…" : "Send"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "rgba(91,143,168,0.35)" }}>
            <div style={{ fontSize: "2.5rem" }}>💬</div>
            <div style={{ fontSize: "0.82rem" }}>Select a conversation</div>
          </div>
        )}
      </div>
    </div>
  );
}
