import Link from "next/link";

const SECTIONS = {
  fr: {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : 28 mars 2026",
    sections: [
      {
        heading: "1. Données collectées",
        content:
          "Nous collectons les données suivantes dans le cadre de l'utilisation de MonaConcierge :\n\n- **Adresse email** — pour l'authentification via Magic Link\n- **Messages clients** — conversations WhatsApp, Instagram et Google Business Messages traitées par notre IA\n- **Réservations** — détails des réservations (date, heure, nombre de personnes)\n- **Avis Google** — contenu des avis et réponses générées\n- **Données d'utilisation** — statistiques anonymisées du tableau de bord",
      },
      {
        heading: "2. Finalité du traitement",
        content:
          "Vos données sont utilisées exclusivement pour :\n\n- Fournir le service d'assistant IA (réponses automatiques, gestion des réservations)\n- Générer des réponses personnalisées aux avis clients\n- Afficher les statistiques et rapports dans votre tableau de bord\n- Envoyer des relances post-visite (Smart Upsell)\n- Améliorer la qualité du service",
      },
      {
        heading: "3. Stockage et sécurité",
        content:
          "Toutes les données sont stockées sur **Supabase** (serveurs situés dans l'Union européenne). Les données sont chiffrées en transit (TLS) et au repos. L'accès aux données est protégé par des politiques de sécurité au niveau des lignes (Row Level Security).",
      },
      {
        heading: "4. Vos droits (RGPD)",
        content:
          "Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :\n\n- **Droit d'accès** — obtenir une copie de vos données personnelles\n- **Droit de rectification** — corriger des données inexactes\n- **Droit à l'effacement** — demander la suppression de vos données\n- **Droit à la portabilité** — exporter vos données dans un format structuré\n- **Droit d'opposition** — vous opposer au traitement de vos données\n\nPour exercer ces droits, contactez-nous via le formulaire de contact sur notre site.",
      },
      {
        heading: "5. Partage des données",
        content:
          "Nous ne vendons jamais vos données. Elles peuvent être partagées uniquement avec :\n\n- **Anthropic (Claude AI)** — pour le traitement des messages par intelligence artificielle\n- **Stripe** — pour le traitement des paiements\n- **Supabase** — hébergement de la base de données\n\nTous nos sous-traitants sont conformes au RGPD.",
      },
      {
        heading: "6. Contact",
        content:
          "Pour toute question relative à la protection de vos données, contactez-nous via le formulaire disponible sur notre site.\n\n**Siège :** MonaConcierge, Monaco",
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: March 28, 2026",
    sections: [
      {
        heading: "1. Data we collect",
        content:
          "We collect the following data when you use MonaConcierge:\n\n- **Email address** — for Magic Link authentication\n- **Customer messages** — WhatsApp, Instagram, and Google Business Messages conversations processed by our AI\n- **Bookings** — reservation details (date, time, party size)\n- **Google Reviews** — review content and AI-generated responses\n- **Usage data** — anonymised dashboard statistics",
      },
      {
        heading: "2. Purpose of processing",
        content:
          "Your data is used exclusively to:\n\n- Provide the AI assistant service (automatic replies, booking management)\n- Generate personalised responses to customer reviews\n- Display statistics and reports in your dashboard\n- Send post-visit follow-ups (Smart Upsell)\n- Improve service quality",
      },
      {
        heading: "3. Storage and security",
        content:
          "All data is stored on **Supabase** (servers located in the European Union). Data is encrypted in transit (TLS) and at rest. Access is protected by Row Level Security policies.",
      },
      {
        heading: "4. Your rights (GDPR)",
        content:
          "Under the General Data Protection Regulation (GDPR), you have the following rights:\n\n- **Right of access** — obtain a copy of your personal data\n- **Right to rectification** — correct inaccurate data\n- **Right to erasure** — request deletion of your data\n- **Right to portability** — export your data in a structured format\n- **Right to object** — object to the processing of your data\n\nTo exercise these rights, contact us through the form on our website.",
      },
      {
        heading: "5. Data sharing",
        content:
          "We never sell your data. It may be shared only with:\n\n- **Anthropic (Claude AI)** — for AI-powered message processing\n- **Stripe** — for payment processing\n- **Supabase** — database hosting\n\nAll our processors are GDPR-compliant.",
      },
      {
        heading: "6. Contact",
        content:
          "For any questions about data protection, please contact us through the form on our website.\n\n**Address:** MonaConcierge, Monaco",
      },
    ],
  },
  ru: {
    title: "Политика конфиденциальности",
    updated: "Последнее обновление: 28 марта 2026",
    sections: [
      {
        heading: "1. Собираемые данные",
        content:
          "Мы собираем следующие данные при использовании MonaConcierge:\n\n- **Email-адрес** — для авторизации через Magic Link\n- **Сообщения клиентов** — переписки WhatsApp, Instagram и Google Business Messages, обрабатываемые нашим ИИ\n- **Бронирования** — детали резерваций (дата, время, количество гостей)\n- **Отзывы Google** — содержание отзывов и сгенерированные ИИ ответы\n- **Данные использования** — анонимизированная статистика дашборда",
      },
      {
        heading: "2. Цели обработки",
        content:
          "Ваши данные используются исключительно для:\n\n- Предоставления ИИ-ассистента (автоматические ответы, управление бронированиями)\n- Генерации персонализированных ответов на отзывы клиентов\n- Отображения статистики и отчётов в дашборде\n- Отправки напоминаний после визита (Smart Upsell)\n- Улучшения качества сервиса",
      },
      {
        heading: "3. Хранение и безопасность",
        content:
          "Все данные хранятся на **Supabase** (серверы расположены в Европейском Союзе). Данные зашифрованы при передаче (TLS) и в состоянии покоя. Доступ защищён политиками безопасности на уровне строк (Row Level Security).",
      },
      {
        heading: "4. Ваши права (GDPR)",
        content:
          "В соответствии с Общим регламентом по защите данных (GDPR) вы имеете следующие права:\n\n- **Право на доступ** — получить копию ваших персональных данных\n- **Право на исправление** — исправить неточные данные\n- **Право на удаление** — запросить удаление ваших данных\n- **Право на переносимость** — экспортировать данные в структурированном формате\n- **Право на возражение** — возразить против обработки ваших данных\n\nДля реализации этих прав свяжитесь с нами через форму на сайте.",
      },
      {
        heading: "5. Передача данных",
        content:
          "Мы никогда не продаём ваши данные. Они могут быть переданы только:\n\n- **Anthropic (Claude AI)** — для обработки сообщений искусственным интеллектом\n- **Stripe** — для обработки платежей\n- **Supabase** — хостинг базы данных\n\nВсе наши подрядчики соответствуют требованиям GDPR.",
      },
      {
        heading: "6. Контакт",
        content:
          "По любым вопросам о защите данных свяжитесь с нами через форму на сайте.\n\n**Адрес:** MonaConcierge, Monaco",
      },
    ],
  },
};

function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.trim() === "") return <div key={i} className="h-2" />;
        const formatted = line.replace(
          /\*\*(.+?)\*\*/g,
          '<strong class="text-ivory font-medium">$1</strong>'
        );
        if (line.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-gold-400 flex-shrink-0 mt-0.5">&#8226;</span>
              <span
                className="text-fog leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatted.slice(2) }}
              />
            </div>
          );
        }
        return (
          <p
            key={i}
            className="text-fog leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      })}
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-void text-ivory font-body antialiased">
      {/* Nav */}
      <nav className="border-b border-white/[0.04] px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-gold-400 text-lg group-hover:rotate-45 transition-transform">
              &#10022;
            </span>
            <span className="font-display text-lg font-semibold">
              MonaConcierge
            </span>
          </Link>
          <div className="flex gap-4 text-xs text-fog">
            <a href="#fr" className="hover:text-gold-400 transition-colors">FR</a>
            <a href="#en" className="hover:text-gold-400 transition-colors">EN</a>
            <a href="#ru" className="hover:text-gold-400 transition-colors">RU</a>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20 space-y-24">
        {(["fr", "en", "ru"] as const).map((lang) => {
          const data = SECTIONS[lang];
          return (
            <article key={lang} id={lang} className="space-y-10">
              <div className="space-y-3">
                <div className="inline-block px-3 py-1 border border-gold-400/20 rounded-lg text-[10px] tracking-[0.2em] uppercase text-gold-400">
                  {lang.toUpperCase()}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-light text-ivory">
                  {data.title}
                </h1>
                <p className="text-sm text-fog/50">{data.updated}</p>
              </div>

              <div className="space-y-10">
                {data.sections.map((s) => (
                  <section key={s.heading} className="space-y-4">
                    <h2 className="text-lg font-semibold text-ivory/90">
                      {s.heading}
                    </h2>
                    <Markdown text={s.content} />
                  </section>
                ))}
              </div>

              {lang !== "ru" && (
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              )}
            </article>
          );
        })}
      </main>

      <footer className="py-8 px-6 border-t border-white/[0.04] text-center">
        <p className="text-xs text-fog/30">
          &copy; {new Date().getFullYear()} MonaConcierge
        </p>
      </footer>
    </div>
  );
}
