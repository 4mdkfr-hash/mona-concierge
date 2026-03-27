import { DemoConversation } from "@/lib/demo-data";

interface Props {
  conversations: DemoConversation[];
  activeId: string;
  onSelect: (id: string) => void;
}

const channelBadge: Record<string, string> = {
  whatsapp: "bg-[#25D366]/20 text-[#25D366]",
  instagram: "bg-[#E1306C]/20 text-[#E1306C]",
  google: "bg-[#4285F4]/20 text-[#4285F4]",
};

const channelLabel: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  google: "Google",
};

const langFlag: Record<string, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  ru: "🇷🇺",
};

const statusDot: Record<string, string> = {
  open: "bg-gold-400",
  resolved: "bg-[#25D366]",
  pending: "bg-fog",
};

export default function ConversationList({ conversations, activeId, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {conversations.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`w-full text-left px-3 py-2.5 rounded-[14px] transition-all flex items-start gap-3 ${
            activeId === c.id
              ? "bg-graphite border border-gold-400/30"
              : "hover:bg-graphite/50 border border-transparent"
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-graphite flex items-center justify-center text-xs font-bold text-ivory flex-shrink-0 mt-0.5">
            {c.guestAvatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 justify-between">
              <span className="text-sm font-semibold text-ivory truncate">{c.guestName}</span>
              <div className="flex items-center gap-1">
                {c.unread && <span className="w-2 h-2 rounded-full bg-gold-400" />}
                <span className={`w-2 h-2 rounded-full ${statusDot[c.status]}`} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${channelBadge[c.channel]}`}>
                {channelLabel[c.channel]}
              </span>
              <span className="text-[10px] text-fog">{langFlag[c.language]} {c.language.toUpperCase()}</span>
            </div>
            <p className="text-xs text-fog mt-1 truncate">{c.lastMessage}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
