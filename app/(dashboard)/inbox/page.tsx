"use client";

import { useEffect, useState } from "react";

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
  open: "#C9A84C",
  resolved: "#10B981",
  pending: "#F59E0B",
};

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    setLoading(true);
    const res = await fetch("/api/conversations");
    if (res.ok) {
      const data = await res.json();
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

  const displayName = (c: Conversation) =>
    c.customer_name ?? c.customer_phone ?? c.customer_id;

  const filtered = conversations.filter((c) =>
    filter === "all" ? true : c.status === filter
  );

  const openCount = conversations.filter((c) => c.status === "open").length;
  const resolvedCount = conversations.filter((c) => c.status === "resolved").length;

  return (
    <div style={{ display: "flex", height: "100%", background: "#0A0A0F", color: "#F5F0E8" }}>
      {/* Sidebar */}
      <div style={{ width: "300px", flexShrink: 0, borderRight: "1px solid rgba(201,168,76,0.1)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <h1 style={{ fontSize: "0.95rem", fontWeight: 500, color: "#F5F0E8" }}>Inbox</h1>
            <button
              onClick={fetchConversations}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.4)", fontSize: "0.8rem", padding: "0.25rem" }}
              title="Refresh"
            >
              ↻
            </button>
          </div>

          {/* Stats mini */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ flex: 1, textAlign: "center", padding: "0.4rem", background: "rgba(201,168,76,0.06)", borderRadius: "4px", border: "1px solid rgba(201,168,76,0.1)" }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#C9A84C" }}>{openCount}</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(245,240,232,0.35)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Open</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "0.4rem", background: "rgba(16,185,129,0.05)", borderRadius: "4px", border: "1px solid rgba(16,185,129,0.1)" }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#10B981" }}>{resolvedCount}</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(245,240,232,0.35)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Resolved</div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(201,168,76,0.08)", padding: "0 1rem" }}>
          {(["all", "open", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flex: 1,
                padding: "0.6rem 0",
                background: "transparent",
                border: "none",
                borderBottom: filter === f ? "2px solid #C9A84C" : "2px solid transparent",
                color: filter === f ? "#C9A84C" : "rgba(245,240,232,0.4)",
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
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "rgba(245,240,232,0.3)", fontSize: "0.8rem" }}>
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "rgba(245,240,232,0.25)", fontSize: "0.8rem" }}>
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
                  borderBottom: "1px solid rgba(201,168,76,0.06)",
                  background: selected?.id === c.id ? "rgba(201,168,76,0.05)" : "transparent",
                  cursor: "pointer",
                  color: "#F5F0E8",
                  border: "none",
                  borderLeft: selected?.id === c.id ? "2px solid #C9A84C" : "2px solid transparent",
                  display: "block",
                  transition: "background 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.7rem", color: "rgba(245,240,232,0.4)" }}>
                    {CHANNEL_ICONS[c.channel] ?? "📩"} {CHANNEL_LABELS[c.channel] ?? c.channel}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{
                      display: "inline-block",
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: STATUS_COLORS[c.status] ?? "rgba(245,240,232,0.2)",
                    }} />
                    <span style={{ fontSize: "0.65rem", color: "rgba(245,240,232,0.3)" }}>
                      {new Date(c.last_message_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
                <div style={{ fontWeight: 500, fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayName(c)}
                </div>
                {c.messages.length > 0 && (
                  <div style={{ fontSize: "0.72rem", color: "rgba(245,240,232,0.35)", marginTop: "0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.messages[c.messages.length - 1].content}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread view */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selected ? (
          <>
            {/* Thread header */}
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(201,168,76,0.08)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "50%",
                background: "rgba(201,168,76,0.1)",
                border: "1px solid rgba(201,168,76,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.9rem", color: "#C9A84C", fontWeight: 600,
              }}>
                {displayName(selected).charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{displayName(selected)}</div>
                <div style={{ fontSize: "0.7rem", color: "rgba(245,240,232,0.4)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {CHANNEL_ICONS[selected.channel]} {CHANNEL_LABELS[selected.channel] ?? selected.channel}
                  <span style={{ color: STATUS_COLORS[selected.status] ?? "rgba(245,240,232,0.3)" }}>
                    · {selected.status}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: "0.7rem", color: "rgba(245,240,232,0.3)" }}>
                {selected.messages.length} messages
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
                      ? "linear-gradient(135deg, #C9A84C, #E8CC7A)"
                      : "rgba(245,240,232,0.06)",
                    border: m.direction === "inbound" ? "1px solid rgba(201,168,76,0.1)" : "none",
                    color: m.direction === "outbound" ? "#0A0A0F" : "#F5F0E8",
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
            <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(201,168,76,0.08)" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  style={{
                    flex: 1,
                    padding: "0.65rem 0.9rem",
                    background: "rgba(245,240,232,0.04)",
                    border: "1px solid rgba(201,168,76,0.15)",
                    borderRadius: "6px",
                    color: "#F5F0E8",
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
                  onFocus={(e) => { e.target.style.borderColor = "rgba(201,168,76,0.4)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(201,168,76,0.15)"; }}
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !replyText.trim()}
                  style={{
                    padding: "0.65rem 1.1rem",
                    background: sending || !replyText.trim() ? "rgba(201,168,76,0.15)" : "linear-gradient(135deg, #C9A84C, #E8CC7A)",
                    border: "none",
                    borderRadius: "6px",
                    color: sending || !replyText.trim() ? "rgba(245,240,232,0.3)" : "#0A0A0F",
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
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "rgba(245,240,232,0.2)" }}>
            <div style={{ fontSize: "2.5rem" }}>💬</div>
            <div style={{ fontSize: "0.82rem" }}>Select a conversation</div>
          </div>
        )}
      </div>
    </div>
  );
}
