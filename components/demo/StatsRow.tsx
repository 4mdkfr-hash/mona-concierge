import { DemoVenue } from "@/lib/demo-data";

interface Props {
  venue: DemoVenue;
}

export default function StatsRow({ venue }: Props) {
  const stats = [
    { label: "Conversations", value: venue.stats.totalConversations.toString(), sub: "ce mois" },
    { label: "Temps de réponse", value: venue.stats.avgResponseTime, sub: "en moyenne" },
    { label: "Satisfaction", value: `${venue.stats.satisfactionScore}/5`, sub: "⭐⭐⭐⭐⭐" },
    { label: "Réservations", value: venue.stats.bookingsThisMonth.toString(), sub: "ce mois" },
    { label: "Avis répondus", value: venue.stats.reviewsReplied.toString(), sub: "par IA" },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-carbon border border-graphite rounded-card px-4 py-3 text-center"
        >
          <div className="text-2xl font-display font-semibold text-ivory">{s.value}</div>
          <div className="text-xs font-semibold text-gold-400 mt-0.5">{s.label}</div>
          <div className="text-[11px] text-fog mt-0.5">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}
