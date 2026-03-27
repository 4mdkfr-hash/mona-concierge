export default function AiIndicator({ label = "AI" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gold-400">
      ✨ {label}
    </span>
  );
}
