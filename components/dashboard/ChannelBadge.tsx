const STYLES: Record<string, string> = {
  whatsapp: "bg-[#25D366]/15 text-[#25D366]",
  instagram: "bg-[#E1306C]/15 text-[#E1306C]",
  google_bm: "bg-[#4285F4]/15 text-[#4285F4]",
  google: "bg-[#4285F4]/15 text-[#4285F4]",
};

const LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  google_bm: "Google",
  google: "Google",
};

interface Props {
  channel: string;
  size?: "sm" | "md";
}

export default function ChannelBadge({ channel, size = "sm" }: Props) {
  const style = STYLES[channel] ?? "bg-graphite text-mist";
  const label = LABELS[channel] ?? channel;
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${style} ${size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"}`}>
      {label}
    </span>
  );
}
