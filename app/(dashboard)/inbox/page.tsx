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

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "💬 WhatsApp",
  instagram: "📸 Instagram",
  google_bm: "🔍 Google",
};

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

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
      // Refresh selected conversation
      const updated = conversations.find((c) => c.id === selected.id);
      if (updated) setSelected(updated);
    }
    setSending(false);
  }

  const displayName = (c: Conversation) =>
    c.customer_name ?? c.customer_phone ?? c.customer_id;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold text-gray-900">Inbox</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-gray-500">Loading…</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No conversations yet.</div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition-colors ${
                  selected?.id === c.id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">
                    {CHANNEL_LABELS[c.channel] ?? c.channel}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.last_message_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="font-medium text-sm text-gray-900 truncate">
                  {displayName(c)}
                </div>
                {c.messages.length > 0 && (
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {c.messages[c.messages.length - 1].content}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread view */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="p-4 border-b bg-white">
              <div className="font-medium text-gray-900">{displayName(selected)}</div>
              <div className="text-xs text-gray-500">
                {CHANNEL_LABELS[selected.channel] ?? selected.channel}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selected.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                      m.direction === "outbound"
                        ? "bg-blue-600 text-white"
                        : "bg-white border text-gray-900"
                    }`}
                  >
                    <p>{m.content}</p>
                    {m.ai_generated && (
                      <p className="text-xs opacity-60 mt-1">AI</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a reply…"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !replyText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
                >
                  {sending ? "…" : "Send"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
