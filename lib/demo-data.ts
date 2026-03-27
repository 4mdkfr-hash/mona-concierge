// Static demo data for public /demo page — no auth required

export interface DemoVenue {
  id: string;
  name: string;
  type: "restaurant" | "boutique" | "salon";
  location: string;
  avatar: string;
  primaryColor: string;
  stats: {
    totalConversations: number;
    avgResponseTime: string;
    satisfactionScore: number;
    bookingsThisMonth: number;
    reviewsReplied: number;
  };
}

export interface DemoMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  channel: "whatsapp" | "instagram" | "google";
}

export interface DemoConversation {
  id: string;
  venueId: string;
  guestName: string;
  guestAvatar: string;
  channel: "whatsapp" | "instagram" | "google";
  language: "fr" | "en" | "ru";
  status: "open" | "resolved" | "pending";
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  messages: DemoMessage[];
}

export interface DemoReview {
  id: string;
  venueId: string;
  guestName: string;
  rating: number;
  text: string;
  timestamp: string;
  replied: boolean;
  replyText?: string;
  platform: "google";
}

export interface DemoBooking {
  id: string;
  venueId: string;
  guestName: string;
  guestPhone: string;
  date: string;
  time: string;
  guests: number;
  status: "confirmed" | "pending" | "cancelled";
  notes?: string;
}

// ── Venues ──────────────────────────────────────────────────────────────────

export const DEMO_VENUES: DemoVenue[] = [
  {
    id: "v1",
    name: "Le Jardin Monégasque",
    type: "restaurant",
    location: "Monaco-Ville, MC",
    avatar: "🌿",
    primaryColor: "#D4AF37",
    stats: {
      totalConversations: 248,
      avgResponseTime: "1m 24s",
      satisfactionScore: 4.9,
      bookingsThisMonth: 87,
      reviewsReplied: 34,
    },
  },
  {
    id: "v2",
    name: "Maison Blanc",
    type: "boutique",
    location: "Monte-Carlo, MC",
    avatar: "✦",
    primaryColor: "#B8960C",
    stats: {
      totalConversations: 156,
      avgResponseTime: "2m 10s",
      satisfactionScore: 4.8,
      bookingsThisMonth: 43,
      reviewsReplied: 21,
    },
  },
  {
    id: "v3",
    name: "Atelier Lumière",
    type: "salon",
    location: "Beausoleil, FR",
    avatar: "◆",
    primaryColor: "#9A7D0A",
    stats: {
      totalConversations: 193,
      avgResponseTime: "58s",
      satisfactionScore: 5.0,
      bookingsThisMonth: 62,
      reviewsReplied: 28,
    },
  },
];

// ── Conversations ─────────────────────────────────────────────────────────

export const DEMO_CONVERSATIONS: DemoConversation[] = [
  {
    id: "c1",
    venueId: "v1",
    guestName: "Sophie Müller",
    guestAvatar: "SM",
    channel: "whatsapp",
    language: "fr",
    status: "resolved",
    lastMessage: "Merci beaucoup, à demain soir !",
    timestamp: "2026-03-27T19:45:00Z",
    unread: false,
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Bonjour, je voudrais réserver une table pour 4 personnes samedi soir.",
        timestamp: "2026-03-27T19:30:00Z",
        channel: "whatsapp",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Bonjour Sophie ! Bien sûr, nous avons de la disponibilité samedi soir. Quelle heure vous conviendrait le mieux — 19h30 ou 21h00 ?",
        timestamp: "2026-03-27T19:31:00Z",
        channel: "whatsapp",
      },
      {
        id: "m3",
        role: "user",
        content: "21h00 ce serait parfait.",
        timestamp: "2026-03-27T19:43:00Z",
        channel: "whatsapp",
      },
      {
        id: "m4",
        role: "assistant",
        content:
          "Parfait ! J'ai réservé une table pour 4 personnes samedi 28 mars à 21h00 au nom de Sophie Müller. Vous recevrez une confirmation par SMS. À samedi !",
        timestamp: "2026-03-27T19:44:00Z",
        channel: "whatsapp",
      },
      {
        id: "m5",
        role: "user",
        content: "Merci beaucoup, à demain soir !",
        timestamp: "2026-03-27T19:45:00Z",
        channel: "whatsapp",
      },
    ],
  },
  {
    id: "c2",
    venueId: "v1",
    guestName: "Natasha Volkova",
    guestAvatar: "NV",
    channel: "instagram",
    language: "ru",
    status: "open",
    lastMessage: "Есть ли у вас меню без глютена?",
    timestamp: "2026-03-27T20:15:00Z",
    unread: true,
    messages: [
      {
        id: "m6",
        role: "user",
        content: "Добрый вечер! Есть ли у вас меню без глютена?",
        timestamp: "2026-03-27T20:10:00Z",
        channel: "instagram",
      },
      {
        id: "m7",
        role: "assistant",
        content:
          "Добрый вечер, Наташа! Да, у нас есть специальное безглютеновое меню. Наш шеф-повар с удовольствием адаптирует большинство блюд. Хотите забронировать столик?",
        timestamp: "2026-03-27T20:11:00Z",
        channel: "instagram",
      },
      {
        id: "m8",
        role: "user",
        content: "Есть ли у вас меню без глютена?",
        timestamp: "2026-03-27T20:15:00Z",
        channel: "instagram",
      },
    ],
  },
  {
    id: "c3",
    venueId: "v1",
    guestName: "James Harrington",
    guestAvatar: "JH",
    channel: "whatsapp",
    language: "en",
    status: "resolved",
    lastMessage: "Perfect, see you Friday!",
    timestamp: "2026-03-27T16:20:00Z",
    unread: false,
    messages: [
      {
        id: "m9",
        role: "user",
        content: "Hi, do you have a private dining room for a business dinner?",
        timestamp: "2026-03-27T16:00:00Z",
        channel: "whatsapp",
      },
      {
        id: "m10",
        role: "assistant",
        content:
          "Hello James! Yes, we have an elegant private dining room accommodating up to 12 guests, perfect for business dinners. Would you like to book it for a specific date?",
        timestamp: "2026-03-27T16:01:00Z",
        channel: "whatsapp",
      },
      {
        id: "m11",
        role: "user",
        content: "Yes, Friday March 29th for 8 people at 8pm.",
        timestamp: "2026-03-27T16:15:00Z",
        channel: "whatsapp",
      },
      {
        id: "m12",
        role: "assistant",
        content:
          "Excellent! The private room is reserved for you on Friday March 29th at 8pm for 8 guests. I've sent a confirmation to your number. We look forward to welcoming you!",
        timestamp: "2026-03-27T16:16:00Z",
        channel: "whatsapp",
      },
      {
        id: "m13",
        role: "user",
        content: "Perfect, see you Friday!",
        timestamp: "2026-03-27T16:20:00Z",
        channel: "whatsapp",
      },
    ],
  },
  {
    id: "c4",
    venueId: "v2",
    guestName: "Elena Petrova",
    guestAvatar: "EP",
    channel: "instagram",
    language: "ru",
    status: "open",
    lastMessage: "Какие новые коллекции поступили на этой неделе?",
    timestamp: "2026-03-27T18:30:00Z",
    unread: true,
    messages: [
      {
        id: "m14",
        role: "user",
        content: "Bonjour, avez-vous reçu la nouvelle collection printemps ?",
        timestamp: "2026-03-27T18:25:00Z",
        channel: "instagram",
      },
      {
        id: "m15",
        role: "assistant",
        content:
          "Bonjour Elena ! Oui, notre collection printemps 2026 vient d'arriver — des pièces exclusives en soie et lin. Souhaitez-vous prendre rendez-vous pour une présentation privée ?",
        timestamp: "2026-03-27T18:26:00Z",
        channel: "instagram",
      },
      {
        id: "m16",
        role: "user",
        content: "Какие новые коллекции поступили на этой неделе?",
        timestamp: "2026-03-27T18:30:00Z",
        channel: "instagram",
      },
    ],
  },
  {
    id: "c5",
    venueId: "v2",
    guestName: "Marie-Claire Dupont",
    guestAvatar: "MD",
    channel: "whatsapp",
    language: "fr",
    status: "resolved",
    lastMessage: "Merci, j'arrive à 15h !",
    timestamp: "2026-03-27T14:45:00Z",
    unread: false,
    messages: [
      {
        id: "m17",
        role: "user",
        content: "Bonjour ! Je voudrais réserver un créneau pour un conseil personnalisé.",
        timestamp: "2026-03-27T14:30:00Z",
        channel: "whatsapp",
      },
      {
        id: "m18",
        role: "assistant",
        content:
          "Bonjour Marie-Claire ! Bien sûr, nous avons un créneau disponible aujourd'hui à 15h00 ou demain à 11h00. Qu'est-ce qui vous convient ?",
        timestamp: "2026-03-27T14:31:00Z",
        channel: "whatsapp",
      },
      {
        id: "m19",
        role: "user",
        content: "15h00 aujourd'hui c'est parfait.",
        timestamp: "2026-03-27T14:40:00Z",
        channel: "whatsapp",
      },
      {
        id: "m20",
        role: "assistant",
        content: "C'est noté ! Votre créneau conseil est à 15h00 aujourd'hui. À tout à l'heure !",
        timestamp: "2026-03-27T14:41:00Z",
        channel: "whatsapp",
      },
      {
        id: "m21",
        role: "user",
        content: "Merci, j'arrive à 15h !",
        timestamp: "2026-03-27T14:45:00Z",
        channel: "whatsapp",
      },
    ],
  },
  {
    id: "c6",
    venueId: "v3",
    guestName: "Anastasia Romanova",
    guestAvatar: "AR",
    channel: "whatsapp",
    language: "ru",
    status: "resolved",
    lastMessage: "Спасибо, жду подтверждения!",
    timestamp: "2026-03-27T11:20:00Z",
    unread: false,
    messages: [
      {
        id: "m22",
        role: "user",
        content: "Здравствуйте, хочу записаться на окрашивание и стрижку.",
        timestamp: "2026-03-27T11:00:00Z",
        channel: "whatsapp",
      },
      {
        id: "m23",
        role: "assistant",
        content:
          "Здравствуйте, Анастасия! У нас есть свободное время завтра в 14:00 и в пятницу в 10:00. Какой вариант вам удобнее?",
        timestamp: "2026-03-27T11:01:00Z",
        channel: "whatsapp",
      },
      {
        id: "m24",
        role: "user",
        content: "Завтра в 14:00 отлично.",
        timestamp: "2026-03-27T11:15:00Z",
        channel: "whatsapp",
      },
      {
        id: "m25",
        role: "assistant",
        content:
          "Записала вас на завтра, 28 марта в 14:00. Процедура займёт около 3 часов. Подтверждение придёт на ваш номер.",
        timestamp: "2026-03-27T11:16:00Z",
        channel: "whatsapp",
      },
      {
        id: "m26",
        role: "user",
        content: "Спасибо, жду подтверждения!",
        timestamp: "2026-03-27T11:20:00Z",
        channel: "whatsapp",
      },
    ],
  },
  {
    id: "c7",
    venueId: "v3",
    guestName: "Isabella Rossi",
    guestAvatar: "IR",
    channel: "instagram",
    language: "fr",
    status: "pending",
    lastMessage: "Je reviendrai vous voir bientôt !",
    timestamp: "2026-03-26T17:00:00Z",
    unread: false,
    messages: [
      {
        id: "m27",
        role: "user",
        content: "Bonjour ! Proposez-vous des soins pour les cheveux abîmés ?",
        timestamp: "2026-03-26T16:45:00Z",
        channel: "instagram",
      },
      {
        id: "m28",
        role: "assistant",
        content:
          "Bonjour Isabella ! Oui, nous proposons des soins kératine et des masques nutritifs intensifs. Nos coiffeurs experts analyseront votre type de cheveux pour un traitement personnalisé.",
        timestamp: "2026-03-26T16:46:00Z",
        channel: "instagram",
      },
      {
        id: "m29",
        role: "user",
        content: "Je reviendrai vous voir bientôt !",
        timestamp: "2026-03-26T17:00:00Z",
        channel: "instagram",
      },
    ],
  },
  {
    id: "c8",
    venueId: "v1",
    guestName: "Pierre Duval",
    guestAvatar: "PD",
    channel: "whatsapp",
    language: "fr",
    status: "open",
    lastMessage: "Quels sont vos horaires ce weekend ?",
    timestamp: "2026-03-27T21:00:00Z",
    unread: true,
    messages: [
      {
        id: "m30",
        role: "user",
        content: "Quels sont vos horaires ce weekend ?",
        timestamp: "2026-03-27T21:00:00Z",
        channel: "whatsapp",
      },
    ],
  },
];

// ── Reviews ───────────────────────────────────────────────────────────────

export const DEMO_REVIEWS: DemoReview[] = [
  {
    id: "r1",
    venueId: "v1",
    guestName: "Alexander B.",
    rating: 5,
    text: "Une expérience gastronomique exceptionnelle. Le service est impeccable et la cuisine est sublime. Je recommande vivement.",
    timestamp: "2026-03-26T12:00:00Z",
    replied: true,
    replyText:
      "Merci infiniment pour votre avis chaleureux, Alexander ! Votre satisfaction est notre plus belle récompense. Nous espérons vous revoir très bientôt.",
    platform: "google",
  },
  {
    id: "r2",
    venueId: "v1",
    guestName: "Olga P.",
    rating: 5,
    text: "Великолепный ресторан! Атмосфера, кухня и обслуживание — всё на высшем уровне. Особенно понравилось, что с нами общались на русском языке.",
    timestamp: "2026-03-25T18:30:00Z",
    replied: true,
    replyText:
      "Большое спасибо, Ольга! Нам очень приятно, что вы почувствовали себя желанным гостем. Ждём вас снова!",
    platform: "google",
  },
  {
    id: "r3",
    venueId: "v1",
    guestName: "Thomas R.",
    rating: 4,
    text: "Very good restaurant, excellent food and ambiance. Service was quick and attentive. The wine selection is impressive.",
    timestamp: "2026-03-24T20:00:00Z",
    replied: true,
    replyText:
      "Thank you so much for your kind review, Thomas! We're delighted you enjoyed your evening with us. We hope to welcome you again soon.",
    platform: "google",
  },
  {
    id: "r4",
    venueId: "v1",
    guestName: "Camille F.",
    rating: 5,
    text: "Le meilleur restaurant de Monaco sans hésitation. Ambiance feutrée, service discret et cuisine raffinée.",
    timestamp: "2026-03-23T21:15:00Z",
    replied: false,
    platform: "google",
  },
  {
    id: "r5",
    venueId: "v2",
    guestName: "Victoria S.",
    rating: 5,
    text: "Boutique extraordinaire avec une sélection unique. Le personnel est très attentionné et professionnel.",
    timestamp: "2026-03-26T15:00:00Z",
    replied: true,
    replyText:
      "Merci beaucoup pour votre retour, Victoria ! C'est un plaisir de vous accueillir dans notre maison. À très bientôt !",
    platform: "google",
  },
  {
    id: "r6",
    venueId: "v2",
    guestName: "Michael K.",
    rating: 4,
    text: "Outstanding boutique with exclusive pieces. The staff went above and beyond to help find the perfect gift.",
    timestamp: "2026-03-25T14:00:00Z",
    replied: true,
    replyText:
      "Thank you, Michael! We're so happy we could help you find the perfect piece. We look forward to your next visit.",
    platform: "google",
  },
  {
    id: "r7",
    venueId: "v3",
    guestName: "Irina M.",
    rating: 5,
    text: "Лучший салон на Лазурном берегу! Мастера настоящие профессионалы, результат превзошёл все ожидания.",
    timestamp: "2026-03-27T10:00:00Z",
    replied: true,
    replyText:
      "Спасибо огромное, Ирина! Ваш отзыв нас очень вдохновляет. Будем рады видеть вас снова!",
    platform: "google",
  },
  {
    id: "r8",
    venueId: "v3",
    guestName: "Chloé B.",
    rating: 5,
    text: "Salon d'excellence, résultats parfaits à chaque fois. L'équipe est talentueuse et le cadre est magnifique.",
    timestamp: "2026-03-26T16:00:00Z",
    replied: true,
    replyText:
      "Merci Chloé pour ce superbe témoignage ! Votre confiance nous touche. On vous attend avec plaisir !",
    platform: "google",
  },
  {
    id: "r9",
    venueId: "v1",
    guestName: "Dmitri V.",
    rating: 5,
    text: "Превосходный ужин! Всё идеально — от встречи у входа до последнего десерта.",
    timestamp: "2026-03-22T22:00:00Z",
    replied: false,
    platform: "google",
  },
  {
    id: "r10",
    venueId: "v3",
    guestName: "Emma L.",
    rating: 4,
    text: "Great salon, very professional team. The result was exactly what I wanted. Highly recommend!",
    timestamp: "2026-03-25T12:00:00Z",
    replied: true,
    replyText:
      "Thank you Emma! We're delighted you're happy with your new look. See you next time!",
    platform: "google",
  },
];

// ── Bookings ─────────────────────────────────────────────────────────────

export const DEMO_BOOKINGS: DemoBooking[] = [
  {
    id: "b1",
    venueId: "v1",
    guestName: "Sophie Müller",
    guestPhone: "+377 6X XX XX XX",
    date: "2026-03-28",
    time: "21:00",
    guests: 4,
    status: "confirmed",
    notes: "Anniversary dinner — champagne requested",
  },
  {
    id: "b2",
    venueId: "v1",
    guestName: "James Harrington",
    guestPhone: "+44 7X XX XX XX",
    date: "2026-03-29",
    time: "20:00",
    guests: 8,
    status: "confirmed",
    notes: "Private dining room — business dinner",
  },
  {
    id: "b3",
    venueId: "v1",
    guestName: "Natasha Volkova",
    guestPhone: "+7 9XX XXX XX XX",
    date: "2026-03-30",
    time: "19:30",
    guests: 2,
    status: "pending",
  },
  {
    id: "b4",
    venueId: "v2",
    guestName: "Marie-Claire Dupont",
    guestPhone: "+33 6X XX XX XX",
    date: "2026-03-27",
    time: "15:00",
    guests: 1,
    status: "confirmed",
    notes: "Personal styling session",
  },
  {
    id: "b5",
    venueId: "v3",
    guestName: "Anastasia Romanova",
    guestPhone: "+7 9XX XXX XX XX",
    date: "2026-03-28",
    time: "14:00",
    guests: 1,
    status: "confirmed",
    notes: "Full colour + cut — 3 hours",
  },
];

// ── Chart data for stats page ────────────────────────────────────────────

export const DEMO_WEEKLY_STATS = [
  { day: "Lun", conversations: 32, bookings: 8, reviews: 3 },
  { day: "Mar", conversations: 45, bookings: 12, reviews: 5 },
  { day: "Mer", conversations: 38, bookings: 9, reviews: 4 },
  { day: "Jeu", conversations: 52, bookings: 15, reviews: 7 },
  { day: "Ven", conversations: 61, bookings: 18, reviews: 9 },
  { day: "Sam", conversations: 74, bookings: 22, reviews: 11 },
  { day: "Dim", conversations: 43, bookings: 10, reviews: 6 },
];

export const DEMO_CHANNEL_STATS = [
  { name: "WhatsApp", value: 58, color: "#25D366" },
  { name: "Instagram", value: 27, color: "#E1306C" },
  { name: "Google", value: 15, color: "#4285F4" },
];
