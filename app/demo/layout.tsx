import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Démo — MonaConcierge",
  description: "Découvrez MonaConcierge en action — IA pour restaurants, boutiques et salons",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-obsidian text-ivory">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-graphite bg-obsidian/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-gold-400 text-xl">&#10022;</span>
              <span className="font-display text-xl font-semibold text-ivory">MonaConcierge</span>
            </Link>
            <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded bg-gold-400/20 text-gold-400 uppercase border border-gold-400/30">
              Démo
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {(["fr", "en", "ru"] as const).map((l) => (
                <Link
                  key={l}
                  href={`/${l}`}
                  className="text-xs px-2 py-1 rounded-lg text-fog/50 hover:text-mist transition-colors"
                >
                  {l.toUpperCase()}
                </Link>
              ))}
            </div>
            <Link
              href="/"
              className="text-sm bg-gold-400 text-void px-4 py-2 rounded-full font-semibold hover:bg-gold-500 transition-colors"
            >
              Essayer gratuitement &rarr;
            </Link>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
