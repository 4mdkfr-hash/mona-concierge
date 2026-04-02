import Link from "next/link";

const SECTIONS = {
  fr: {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : 2 avril 2026",
    sections: [
      {
        heading: "1. Données collectées",
        content:
          "Nous collectons les données suivantes dans le cadre de l'utilisation de MonaConcierge :\n\n- **Adresse email** — pour l'authentification via Magic Link ou Google OAuth\n- **Messages clients** — conversations WhatsApp, Instagram et Google Business Messages traitées par notre IA\n- **Réservations** — détails des réservations (date, heure, nombre de personnes, service choisi)\n- **Avis Google** — contenu des avis et réponses générées automatiquement\n- **Données d'utilisation** — statistiques anonymisées du tableau de bord\n- **Numéros de téléphone** — transmis via WhatsApp Business API pour l'envoi de messages",
      },
      {
        heading: "2. Finalité du traitement",
        content:
          "Vos données sont utilisées exclusivement pour :\n\n- Fournir le service d'assistant IA (réponses automatiques, gestion des réservations)\n- Générer des réponses personnalisées aux avis clients\n- Afficher les statistiques et rapports dans votre tableau de bord\n- Envoyer des relances post-visite (Smart Upsell)\n- Synchroniser les réservations avec Google Calendar (si connecté)\n- Améliorer la qualité du service",
      },
      {
        heading: "3. Traitement IA (Claude Haiku)",
        content:
          "MonaConcierge utilise **Claude Haiku** (Anthropic) pour générer des réponses automatiques aux messages clients. À ce titre :\n\n- Le contenu des messages est transmis à l'API Anthropic pour traitement\n- Aucune donnée n'est utilisée pour entraîner les modèles d'Anthropic (conformément aux conditions d'utilisation API)\n- Les réponses IA sont identifiées dans l'interface (indicateur ✦ AI)\n- L'administrateur du lieu peut **désactiver l'IA par conversation** à tout moment depuis la boîte de réception\n- Les clients peuvent demander une réponse humaine en contactant directement l'établissement",
      },
      {
        heading: "4. WhatsApp Business API",
        content:
          "Les communications via WhatsApp sont soumises aux **Conditions d'utilisation de WhatsApp Business** (Meta Platforms Ireland).\n\n- Seuls les numéros ayant initié une conversation ou donné leur consentement reçoivent des messages\n- Les messages sont transmis via l'infrastructure Twilio (sous-traitant RGPD)\n- Les numéros de téléphone sont stockés uniquement pour identifier les conversations\n- Les clients peuvent demander la suppression de leurs données en répondant STOP ou en contactant l'établissement",
      },
      {
        heading: "5. Stockage et sécurité",
        content:
          "Toutes les données sont stockées sur **Supabase** (serveurs situés dans l'Union européenne). Les données sont chiffrées en transit (TLS 1.3) et au repos (AES-256). L'accès est protégé par des politiques de sécurité au niveau des lignes (Row Level Security). La durée de conservation des messages est de **12 mois** après la dernière activité.",
      },
      {
        heading: "6. Vos droits (RGPD)",
        content:
          "Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :\n\n- **Droit d'accès** — obtenir une copie de vos données personnelles\n- **Droit de rectification** — corriger des données inexactes\n- **Droit à l'effacement** — demander la suppression de vos données\n- **Droit à la portabilité** — exporter vos données dans un format structuré\n- **Droit d'opposition** — vous opposer au traitement automatisé\n- **Droit à la limitation** — limiter le traitement en cas de contestation\n\nPour exercer ces droits, contactez-nous via le formulaire de contact sur notre site. Délai de réponse : 30 jours.",
      },
      {
        heading: "7. Partage des données",
        content:
          "Nous ne vendons jamais vos données. Elles peuvent être partagées uniquement avec :\n\n- **Anthropic (Claude AI)** — traitement IA des messages (API uniquement, sans rétention)\n- **Twilio** — infrastructure WhatsApp Business API\n- **Stripe** — traitement sécurisé des paiements\n- **Supabase** — hébergement de la base de données (UE)\n- **Google** — Calendar sync (optionnel), Reviews API\n\nTous nos sous-traitants sont conformes au RGPD.",
      },
      {
        heading: "8. Contact",
        content:
          "Pour toute question relative à la protection de vos données, contactez-nous via le formulaire disponible sur notre site.\n\n**Siège :** MonaConcierge, Monaco\n**DPO :** privacy@monaconcierge.ai",
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: April 2, 2026",
    sections: [
      {
        heading: "1. Data we collect",
        content:
          "We collect the following data when you use MonaConcierge:\n\n- **Email address** — for Magic Link or Google OAuth authentication\n- **Customer messages** — WhatsApp, Instagram, and Google Business Messages conversations processed by our AI\n- **Bookings** — reservation details (date, time, party size, service)\n- **Google Reviews** — review content and AI-generated responses\n- **Usage data** — anonymised dashboard statistics\n- **Phone numbers** — transmitted via WhatsApp Business API for messaging",
      },
      {
        heading: "2. Purpose of processing",
        content:
          "Your data is used exclusively to:\n\n- Provide the AI assistant service (automatic replies, booking management)\n- Generate personalised responses to customer reviews\n- Display statistics and reports in your dashboard\n- Send post-visit follow-ups (Smart Upsell)\n- Sync bookings with Google Calendar (if connected)\n- Improve service quality",
      },
      {
        heading: "3. AI processing (Claude Haiku)",
        content:
          "MonaConcierge uses **Claude Haiku** (Anthropic) to generate automatic replies to customer messages. In this context:\n\n- Message content is sent to the Anthropic API for processing\n- No data is used to train Anthropic models (per API terms of service)\n- AI-generated replies are labelled in the interface (✦ AI indicator)\n- Venue admins can **disable AI per conversation** at any time from the inbox\n- Customers may request a human response by contacting the venue directly",
      },
      {
        heading: "4. WhatsApp Business API",
        content:
          "Communications via WhatsApp are subject to **WhatsApp Business Terms of Service** (Meta Platforms Ireland).\n\n- Only numbers that initiated a conversation or gave consent receive messages\n- Messages are sent via Twilio infrastructure (GDPR-compliant processor)\n- Phone numbers are stored only to identify conversations\n- Customers can request data deletion by replying STOP or contacting the venue",
      },
      {
        heading: "5. Storage and security",
        content:
          "All data is stored on **Supabase** (servers in the European Union). Data is encrypted in transit (TLS 1.3) and at rest (AES-256). Access is protected by Row Level Security policies. Message retention: **12 months** after the last activity.",
      },
      {
        heading: "6. Your rights (GDPR)",
        content:
          "Under the General Data Protection Regulation (GDPR), you have the following rights:\n\n- **Right of access** — obtain a copy of your personal data\n- **Right to rectification** — correct inaccurate data\n- **Right to erasure** — request deletion of your data\n- **Right to portability** — export your data in a structured format\n- **Right to object** — object to automated processing\n- **Right to restriction** — limit processing while a dispute is resolved\n\nTo exercise these rights, contact us through the form on our website. Response time: 30 days.",
      },
      {
        heading: "7. Data sharing",
        content:
          "We never sell your data. It may be shared only with:\n\n- **Anthropic (Claude AI)** — AI message processing (API only, no retention)\n- **Twilio** — WhatsApp Business API infrastructure\n- **Stripe** — secure payment processing\n- **Supabase** — database hosting (EU)\n- **Google** — Calendar sync (optional), Reviews API\n\nAll our processors are GDPR-compliant.",
      },
      {
        heading: "8. Contact",
        content:
          "For any questions about data protection, please contact us through the form on our website.\n\n**Address:** MonaConcierge, Monaco\n**DPO:** privacy@monaconcierge.ai",
      },
    ],
  },
  ru: {
    title: "Политика конфиденциальности",
    updated: "Последнее обновление: 2 апреля 2026",
    sections: [
      {
        heading: "1. Собираемые данные",
        content:
          "Мы собираем следующие данные при использовании MonaConcierge:\n\n- **Email-адрес** — для авторизации через Magic Link или Google OAuth\n- **Сообщения клиентов** — переписки WhatsApp, Instagram и Google Business Messages, обрабатываемые нашим ИИ\n- **Бронирования** — детали резерваций (дата, время, количество гостей, услуга)\n- **Отзывы Google** — содержание отзывов и сгенерированные ИИ ответы\n- **Данные использования** — анонимизированная статистика дашборда\n- **Номера телефонов** — передаются через WhatsApp Business API для отправки сообщений",
      },
      {
        heading: "2. Цели обработки",
        content:
          "Ваши данные используются исключительно для:\n\n- Предоставления ИИ-ассистента (автоматические ответы, управление бронированиями)\n- Генерации персонализированных ответов на отзывы клиентов\n- Отображения статистики и отчётов в дашборде\n- Отправки напоминаний после визита (Smart Upsell)\n- Синхронизации бронирований с Google Calendar (при подключении)\n- Улучшения качества сервиса",
      },
      {
        heading: "3. Обработка ИИ (Claude Haiku)",
        content:
          "MonaConcierge использует **Claude Haiku** (Anthropic) для генерации автоматических ответов на сообщения клиентов. В этой связи:\n\n- Содержимое сообщений передаётся в API Anthropic для обработки\n- Данные не используются для обучения моделей Anthropic (согласно условиям использования API)\n- Ответы ИИ помечены в интерфейсе (индикатор ✦ AI)\n- Администратор заведения может **отключить ИИ для каждой беседы** в любое время из раздела «Входящие»\n- Клиенты могут запросить ответ живого человека, связавшись напрямую с заведением",
      },
      {
        heading: "4. WhatsApp Business API",
        content:
          "Коммуникации через WhatsApp регулируются **Условиями использования WhatsApp Business** (Meta Platforms Ireland).\n\n- Сообщения получают только номера, инициировавшие беседу или давшие согласие\n- Сообщения отправляются через инфраструктуру Twilio (GDPR-совместимый обработчик)\n- Номера телефонов хранятся исключительно для идентификации бесед\n- Клиенты могут запросить удаление данных, ответив STOP или обратившись в заведение",
      },
      {
        heading: "5. Хранение и безопасность",
        content:
          "Все данные хранятся на **Supabase** (серверы в Европейском Союзе). Данные зашифрованы при передаче (TLS 1.3) и в состоянии покоя (AES-256). Доступ защищён политиками Row Level Security. Срок хранения сообщений: **12 месяцев** после последней активности.",
      },
      {
        heading: "6. Ваши права (GDPR)",
        content:
          "В соответствии с Общим регламентом по защите данных (GDPR) вы имеете следующие права:\n\n- **Право на доступ** — получить копию ваших персональных данных\n- **Право на исправление** — исправить неточные данные\n- **Право на удаление** — запросить удаление ваших данных\n- **Право на переносимость** — экспортировать данные в структурированном формате\n- **Право на возражение** — возразить против автоматизированной обработки\n- **Право на ограничение** — ограничить обработку в случае спора\n\nДля реализации этих прав свяжитесь с нами через форму на сайте. Срок ответа: 30 дней.",
      },
      {
        heading: "7. Передача данных",
        content:
          "Мы никогда не продаём ваши данные. Они могут быть переданы только:\n\n- **Anthropic (Claude AI)** — обработка сообщений ИИ (только API, без хранения)\n- **Twilio** — инфраструктура WhatsApp Business API\n- **Stripe** — безопасная обработка платежей\n- **Supabase** — хостинг базы данных (ЕС)\n- **Google** — синхронизация Calendar (опционально), Reviews API\n\nВсе наши подрядчики соответствуют требованиям GDPR.",
      },
      {
        heading: "8. Контакт",
        content:
          "По любым вопросам о защите данных свяжитесь с нами через форму на сайте.\n\n**Адрес:** MonaConcierge, Monaco\n**DPO:** privacy@monaconcierge.ai",
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
