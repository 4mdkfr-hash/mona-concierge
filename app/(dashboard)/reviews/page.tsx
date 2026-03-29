"use client";

import { useEffect, useState } from "react";
import { Star, Sparkles, Loader2, ThumbsUp, ThumbsDown, Minus } from "lucide-react";

interface Review {
  id: string;
  venue_id?: string;
  author_name: string;
  rating: number;
  text: string;
  ai_reply: string | null;
  reply_status: "replied" | "pending" | "skipped";
  sentiment: "positive" | "neutral" | "negative";
  created_at: string;
}

const SENTIMENT_ICON: Record<string, typeof ThumbsUp> = {
  positive: ThumbsUp,
  neutral: Minus,
  negative: ThumbsDown,
};

const SENTIMENT_COLOR: Record<string, string> = {
  positive: "text-emerald-400",
  neutral: "text-amber-400",
  negative: "text-red-400",
};

const DEMO_REVIEWS: Review[] = [
  {
    id: "1", author_name: "Claire D.", rating: 5,
    text: "Une expérience absolument inoubliable. La cuisine est raffinée, le service irréprochable et l'ambiance magique. Je recommande vivement !",
    ai_reply: null,
    reply_status: "pending", sentiment: "positive", created_at: "2026-03-28T14:00:00Z",
  },
  {
    id: "2", author_name: "Michael B.", rating: 3,
    text: "Decent place but not worth the price. Food was average, nothing special. Service was okay. Expected more for Monaco.",
    ai_reply: null,
    reply_status: "pending", sentiment: "neutral", created_at: "2026-03-28T10:00:00Z",
  },
  {
    id: "3", author_name: "Анна С.", rating: 1,
    text: "Ужасный опыт. Еда была холодной, официанты грубыми. Ждали заказ больше часа. Никогда не вернёмся!",
    ai_reply: null,
    reply_status: "pending", sentiment: "negative", created_at: "2026-03-27T20:00:00Z",
  },
  {
    id: "4", author_name: "Pierre L.", rating: 5,
    text: "Service exceptionnel, le personnel est aux petits soins. La vue sur le port est magnifique. Je recommande vivement !",
    ai_reply: "Merci beaucoup Pierre pour ces mots chaleureux ! Nous sommes ravis que vous ayez apprécié notre service et la vue. Au plaisir de vous revoir bientôt.",
    reply_status: "replied", sentiment: "positive", created_at: "2026-03-27T14:00:00Z",
  },
  {
    id: "5", author_name: "Sarah K.", rating: 4,
    text: "Very good food and ambiance. The terrace is lovely. Only small issue was the waiting time for the main course.",
    ai_reply: "Thank you Sarah for your kind review! We're glad you enjoyed the food and our terrace. We apologize for the wait — we're working on improving our kitchen flow. Hope to welcome you again soon!",
    reply_status: "replied", sentiment: "positive", created_at: "2026-03-26T18:30:00Z",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={i < count ? "text-gold-400 fill-gold-400" : "text-graphite"}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "replied">("all");
  const [generating, setGenerating] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setReviews(Array.isArray(data) && data.length > 0 ? data : DEMO_REVIEWS);
        setLoading(false);
      })
      .catch(() => {
        setReviews(DEMO_REVIEWS);
        setLoading(false);
      });
  }, []);

  const generateReply = async (reviewId: string) => {
    setGenerating((prev) => new Set(prev).add(reviewId));
    try {
      const res = await fetch(`/api/reviews/${reviewId}/generate-reply`, { method: "POST" });
      if (res.ok) {
        const { replyText, sentiment } = await res.json();
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, ai_reply: replyText, reply_status: "replied", sentiment }
              : r
          )
        );
      }
    } finally {
      setGenerating((prev) => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return r.reply_status === "pending";
    if (filter === "replied") return r.reply_status === "replied";
    return true;
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "—";
  const replyRate = reviews.length > 0
    ? Math.round((reviews.filter((r) => r.reply_status === "replied").length / reviews.length) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-light text-ivory">Google Reviews</h1>
          <p className="text-sm text-fog mt-0.5">
            {avgRating} avg &middot; {replyRate}% replied &middot; {reviews.length} total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-carbon rounded-xl p-1 w-fit">
        {(["all", "pending", "replied"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? "bg-gold-400/10 text-gold-400"
                : "text-fog hover:text-mist"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pending" && (
              <span className="ml-1.5 text-[10px] text-amber-400">
                {reviews.filter((r) => r.reply_status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={20} className="text-gold-400/50 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-fog/50 text-sm">No reviews found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const SentimentIcon = SENTIMENT_ICON[r.sentiment] ?? Minus;
            const isGenerating = generating.has(r.id);
            return (
              <div
                key={r.id}
                className="bg-carbon border border-graphite rounded-2xl p-6 hover:border-gold-400/15 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-400/[0.08] border border-gold-400/[0.12] flex items-center justify-center text-gold-400 font-semibold text-sm">
                      {r.author_name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-ivory">{r.author_name}</div>
                      <div className="text-xs text-fog">
                        {new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <SentimentIcon size={14} className={SENTIMENT_COLOR[r.sentiment]} />
                    <Stars count={r.rating} />
                  </div>
                </div>

                {/* Review text */}
                <p className="text-sm text-mist leading-relaxed">{r.text}</p>

                {/* AI Reply */}
                {r.ai_reply ? (
                  <div className="bg-gold-400/[0.04] border border-gold-400/[0.1] rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-gold-400">
                      <Sparkles size={12} />
                      <span className="font-medium">AI Response</span>
                    </div>
                    <p className="text-sm text-mist/80 leading-relaxed">{r.ai_reply}</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-amber-400/[0.04] border border-amber-400/[0.1] rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-amber-400/70">
                      <Sparkles size={12} />
                      <span>No AI response yet</span>
                    </div>
                    <button
                      onClick={() => generateReply(r.id)}
                      disabled={isGenerating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-400/10 text-gold-400 text-xs font-medium hover:bg-gold-400/20 transition-all disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Sparkles size={11} />
                      )}
                      {isGenerating ? "Generating…" : "Generate AI Reply"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
