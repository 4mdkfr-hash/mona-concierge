import { DemoReview } from "@/lib/demo-data";

interface Props {
  reviews: DemoReview[];
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? "text-gold-400" : "text-graphite"}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsTable({ reviews }: Props) {
  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="bg-carbon border border-graphite rounded-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-ivory text-sm">{r.guestName}</span>
                <Stars rating={r.rating} />
                <span className="text-xs text-fog">
                  {new Date(r.timestamp).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <p className="text-sm text-mist leading-relaxed">{r.text}</p>
              {r.replied && r.replyText && (
                <div className="mt-3 pl-3 border-l-2 border-gold-400/40">
                  <div className="text-[10px] text-gold-400 font-medium mb-1">✨ Réponse IA</div>
                  <p className="text-xs text-fog leading-relaxed">{r.replyText}</p>
                </div>
              )}
            </div>
            <div>
              {r.replied ? (
                <span className="text-xs px-2 py-1 rounded-full bg-[#25D366]/15 text-[#25D366] font-medium whitespace-nowrap">
                  ✓ Répondu
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-gold-400/15 text-gold-400 font-medium whitespace-nowrap">
                  En attente
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
