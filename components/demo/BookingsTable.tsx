import { DemoBooking } from "@/lib/demo-data";

interface Props {
  bookings: DemoBooking[];
}

const statusStyle: Record<string, string> = {
  confirmed: "bg-[#25D366]/15 text-[#25D366]",
  pending: "bg-gold-400/15 text-gold-400",
  cancelled: "bg-fog/15 text-fog",
};

const statusLabel: Record<string, string> = {
  confirmed: "Confirmé",
  pending: "En attente",
  cancelled: "Annulé",
};

export default function BookingsTable({ bookings }: Props) {
  return (
    <div className="overflow-hidden rounded-card border border-graphite">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-carbon border-b border-graphite">
            <th className="text-left px-4 py-3 text-xs font-semibold text-fog uppercase tracking-wider">Client</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-fog uppercase tracking-wider">Date & Heure</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-fog uppercase tracking-wider">Couverts</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-fog uppercase tracking-wider">Notes</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-fog uppercase tracking-wider">Statut</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, i) => (
            <tr
              key={b.id}
              className={`border-b border-graphite/50 ${i % 2 === 0 ? "bg-obsidian" : "bg-carbon/30"}`}
            >
              <td className="px-4 py-3">
                <div className="font-medium text-ivory">{b.guestName}</div>
                <div className="text-xs text-fog">{b.guestPhone}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-ivory">
                  {new Date(b.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                </div>
                <div className="text-xs text-gold-400 font-medium">{b.time}</div>
              </td>
              <td className="px-4 py-3 text-center text-ivory font-semibold">{b.guests}</td>
              <td className="px-4 py-3 text-xs text-fog max-w-[160px] truncate">{b.notes || "—"}</td>
              <td className="px-4 py-3 text-right">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[b.status]}`}>
                  {statusLabel[b.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
