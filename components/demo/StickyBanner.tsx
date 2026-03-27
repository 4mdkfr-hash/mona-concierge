export default function StickyBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-obsidian via-carbon to-obsidian border-t border-gold-400/20 px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-gold-400 text-xl">✦</span>
          <div>
            <span className="text-ivory font-semibold">MonaConcierge</span>
            <span className="text-fog text-sm ml-2">— IA pour votre établissement à Monaco</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-fog text-sm hidden md:block">Essai gratuit 14 jours · Aucune carte requise</span>
          <a
            href="/"
            className="bg-gold-400 text-void px-5 py-2 rounded-full text-sm font-semibold hover:bg-gold-500 transition-colors whitespace-nowrap"
          >
            Démarrer gratuitement →
          </a>
        </div>
      </div>
    </div>
  );
}
