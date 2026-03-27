import { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export default function StatsCard({ label, value, sub, icon: Icon, trendValue }: Props) {
  return (
    <div className="bg-carbon border border-graphite rounded-card p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-gold-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-fog font-medium uppercase tracking-wider">{label}</div>
        <div className="text-2xl font-display font-semibold text-ivory mt-1">{value}</div>
        {(sub || trendValue) && (
          <div className="text-xs text-fog mt-1">
            {trendValue && <span className="text-[#25D366] mr-1">{trendValue}</span>}
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
