import { DemoConversation } from "@/lib/demo-data";

interface Props {
  conversation: DemoConversation | null;
}

const channelBadge: Record<string, { label: string; color: string }> = {
  whatsapp: { label: "WhatsApp", color: "text-[#25D366]" },
  instagram: { label: "Instagram", color: "text-[#E1306C]" },
  google: { label: "Google", color: "text-[#4285F4]" },
};

const langFlag: Record<string, string> = { fr: "🇫🇷", en: "🇬🇧", ru: "🇷🇺" };

export default function ConversationThread({ conversation }: Props) {
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-fog text-sm">
        Sélectionnez une conversation
      </div>
    );
  }

  const ch = channelBadge[conversation.channel];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-graphite bg-carbon/50">
        <div className="w-9 h-9 rounded-full bg-graphite flex items-center justify-center text-xs font-bold text-ivory">
          {conversation.guestAvatar}
        </div>
        <div>
          <div className="font-semibold text-ivory text-sm">{conversation.guestName}</div>
          <div className="flex items-center gap-2 text-xs">
            <span className={ch.color}>{ch.label}</span>
            <span className="text-fog">{langFlag[conversation.language]} {conversation.language.toUpperCase()}</span>
          </div>
        </div>
        <div className="ml-auto">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            conversation.status === "resolved"
              ? "bg-[#25D366]/20 text-[#25D366]"
              : conversation.status === "open"
              ? "bg-gold-400/20 text-gold-400"
              : "bg-fog/20 text-fog"
          }`}>
            {conversation.status}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {conversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "assistant" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-[16px] px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "bg-gold-400/15 text-ivory border border-gold-400/20"
                  : "bg-graphite text-ivory"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="text-[10px] text-gold-400 font-medium mb-1">✨ MonaConcierge AI</div>
              )}
              {msg.content}
              <div className="text-[10px] text-fog mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
