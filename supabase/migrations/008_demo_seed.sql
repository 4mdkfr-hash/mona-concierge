-- MonaConcierge Demo Seed Data
-- Creates 3 demo tenant accounts with realistic Monaco/Riviera data
-- Run ONLY in development/staging — guarded by a flag check

DO $$
BEGIN
  -- Safety guard: skip if already seeded
  IF EXISTS (SELECT 1 FROM venues WHERE name = 'Le Grill de Monaco') THEN
    RAISE NOTICE 'Demo seed already applied, skipping.';
    RETURN;
  END IF;

  -- ================================================================
  -- VENUE 1: Le Grill de Monaco (Restaurant)
  -- ================================================================
  INSERT INTO venues (
    id, name, type, country, timezone, tone_brief,
    languages, google_place_id,
    subscription_status, subscription_plan,
    trial_ends_at, auto_reply_reviews, onboarding_completed, onboarding_step,
    menu_text
  ) VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'Le Grill de Monaco',
    'restaurant',
    'MC',
    'Europe/Monaco',
    'Upscale Monaco restaurant on the rooftop of Hotel de Paris. Warm, professional tone in all 3 languages. Emphasise panoramic sea views and Chef''s seasonal menu.',
    ARRAY['fr','en','ru'],
    'ChIJ_demo_legrill_monaco',
    'trialing',
    'standard',
    NOW() + INTERVAL '28 days',
    TRUE, TRUE, 'complete',
    E'MENU HIGHLIGHTS\n---\nEntrées: Salade Niçoise Traditionnelle (28€), Foie Gras Poêlé (42€)\nPlats: Loup de Mer en Croûte de Sel (68€), Côte de Bœuf pour 2 (145€)\nDesserts: Tarte Tatin Tiède (18€), Soufflé au Grand Marnier (22€)\n\nHours: Mon–Sun 12:00–14:30, 19:00–22:30\nReservations recommended. Dress code: smart casual.'
  );

  -- Channels for Le Grill
  INSERT INTO venue_channels (venue_id, channel, channel_account_id, webhook_verified, status)
  VALUES
    ('a1000000-0000-0000-0000-000000000001', 'whatsapp',         '+37799001234', TRUE,  'active'),
    ('a1000000-0000-0000-0000-000000000001', 'google_business',  'legrill_mc',   FALSE, 'active');

  -- Conversations for Le Grill
  INSERT INTO conversations (id, venue_id, channel, customer_id, customer_name, customer_phone, language, status, last_message_at)
  VALUES
    ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'whatsapp', 'whatsapp:+33612345678', 'Sophie Martin',   '+33612345678', 'fr', 'resolved', NOW() - INTERVAL '2 days'),
    ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'whatsapp', 'whatsapp:+44790123456', 'James Wilson',    '+44790123456', 'en', 'resolved', NOW() - INTERVAL '1 day'),
    ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'whatsapp', 'whatsapp:+79161234567', 'Андрей Петров',   '+79161234567', 'ru', 'open',     NOW() - INTERVAL '3 hours');

  -- Messages for Le Grill conversations
  INSERT INTO messages (conversation_id, direction, content, ai_generated, ai_model, status)
  VALUES
    -- Sophie (FR booking inquiry)
    ('b1000000-0000-0000-0000-000000000001', 'inbound',  'Bonjour, je voudrais réserver une table pour 2 personnes samedi soir vers 20h.', FALSE, NULL, 'read'),
    ('b1000000-0000-0000-0000-000000000001', 'outbound', 'Bonjour Sophie ! Bien sûr, nous avons une belle table disponible samedi 29 mars à 20h00 avec vue sur la mer. Dois-je confirmer la réservation à votre nom ?', TRUE, 'claude-sonnet-4-6', 'delivered'),
    ('b1000000-0000-0000-0000-000000000001', 'inbound',  'Oui parfait, merci !', FALSE, NULL, 'read'),
    ('b1000000-0000-0000-0000-000000000001', 'outbound', 'Parfait ! Votre table est confirmée pour samedi 29 mars à 20h00 pour 2 personnes. Nous vous attendons ! Bonne soirée 🌟', TRUE, 'claude-sonnet-4-6', 'delivered'),
    -- James (EN menu inquiry)
    ('b1000000-0000-0000-0000-000000000002', 'inbound',  'Hi, do you have a vegetarian menu option?', FALSE, NULL, 'read'),
    ('b1000000-0000-0000-0000-000000000002', 'outbound', 'Hello James! Yes, our Chef prepares beautiful seasonal vegetarian dishes daily. Tonight we have a Roasted Provençal Vegetable Millefeuille and a Truffle Risotto. Would you like to book a table?', TRUE, 'claude-sonnet-4-6', 'delivered'),
    -- Andrey (RU inquiry)
    ('b1000000-0000-0000-0000-000000000003', 'inbound',  'Здравствуйте, можно заказать столик на 4 человека на завтра вечером?', FALSE, NULL, 'delivered'),
    ('b1000000-0000-0000-0000-000000000003', 'outbound', 'Добрый день, Андрей! Конечно, мы рады вас принять. Завтра, 28 марта, у нас есть столик на 4 персоны в 19:30 или 21:00. Какое время вам удобнее?', TRUE, 'claude-sonnet-4-6', 'delivered');

  -- Bookings for Le Grill
  INSERT INTO bookings (venue_id, customer_name, customer_phone, customer_channel, service_type, booked_at, status, confirmation_sent, party_size)
  VALUES
    ('a1000000-0000-0000-0000-000000000001', 'Sophie Martin',  '+33612345678', 'whatsapp', 'dinner', NOW() + INTERVAL '2 days' + INTERVAL '20 hours', 'confirmed', TRUE,  2),
    ('a1000000-0000-0000-0000-000000000001', 'James Wilson',   '+44790123456', 'whatsapp', 'dinner', NOW() + INTERVAL '3 days' + INTERVAL '19 hours', 'confirmed', TRUE,  2),
    ('a1000000-0000-0000-0000-000000000001', 'Famille Dupont', '+33698765432', 'whatsapp', 'lunch',  NOW() - INTERVAL '5 days' + INTERVAL '13 hours', 'completed', TRUE,  4),
    ('a1000000-0000-0000-0000-000000000001', 'Elena Sorokina', '+79031234567', 'whatsapp', 'dinner', NOW() - INTERVAL '10 days' + INTERVAL '20 hours','completed', TRUE,  3);

  -- Google Reviews for Le Grill
  INSERT INTO google_reviews (venue_id, review_id, author_name, rating, content, reply_text, replied_at, sentiment)
  VALUES
    ('a1000000-0000-0000-0000-000000000001', 'demo_review_001', 'Sophie M.',      5, 'Repas exceptionnel avec une vue magnifique sur la mer. Le service était impeccable et le loup de mer fondait en bouche. On reviendra !',
     'Merci infiniment Sophie ! Votre enthousiasme nous touche beaucoup. Nous vous attendons avec plaisir pour votre prochaine visite ! 🌟', NOW() - INTERVAL '1 day', 'positive'),
    ('a1000000-0000-0000-0000-000000000001', 'demo_review_002', 'James W.',       4, 'Fantastic location and food. Vegetarian options were creative and delicious. Service was a bit slow but overall a memorable evening.',
     'Thank you James! We''re so glad you enjoyed the vegetarian menu — our Chef puts great care into those seasonal creations. We''ll work on the service pace. Hope to see you again!', NOW() - INTERVAL '3 days', 'positive'),
    ('a1000000-0000-0000-0000-000000000001', 'demo_review_003', 'Mikhail K.',     3, 'Красивое место, но цены очень высокие для такого качества. Официанты не говорили по-русски.',
     'Уважаемый Михаил, благодарим за честный отзыв. Мы учтём ваши пожелания — теперь в нашей команде есть русскоязычный сотрудник. Будем рады принять вас снова!', NOW() - INTERVAL '6 days', 'neutral');

  -- Review templates for Le Grill
  INSERT INTO review_templates (venue_id, sentiment, language, template)
  VALUES
    ('a1000000-0000-0000-0000-000000000001', 'positive', 'fr', 'Merci chaleureusement pour votre avis ! Nous sommes ravis que votre expérience au Grill de Monaco ait été à la hauteur de vos attentes. Nous vous attendons avec plaisir pour une prochaine visite !'),
    ('a1000000-0000-0000-0000-000000000001', 'positive', 'en', 'Thank you so much for your kind words! We''re thrilled you enjoyed your experience at Le Grill de Monaco. We look forward to welcoming you back soon!'),
    ('a1000000-0000-0000-0000-000000000001', 'positive', 'ru', 'Большое спасибо за ваш прекрасный отзыв! Мы рады, что ваш визит в Le Grill de Monaco оставил приятные впечатления. Будем рады видеть вас снова!'),
    ('a1000000-0000-0000-0000-000000000001', 'neutral',  'fr', 'Merci pour votre retour. Nous prenons note de vos remarques et travaillons continuellement à améliorer notre service. N''hésitez pas à nous recontacter.'),
    ('a1000000-0000-0000-0000-000000000001', 'neutral',  'en', 'Thank you for your feedback. We appreciate your comments and are always working to improve. Please don''t hesitate to reach out if you''d like to discuss your experience.'),
    ('a1000000-0000-0000-0000-000000000001', 'neutral',  'ru', 'Спасибо за ваш отзыв. Мы ценим ваше мнение и постоянно работаем над улучшением сервиса. Пожалуйста, свяжитесь с нами, если хотите обсудить ваш визит подробнее.'),
    ('a1000000-0000-0000-0000-000000000001', 'negative', 'fr', 'Nous sommes sincèrement désolés pour cette expérience décevante. Votre satisfaction est notre priorité et nous aimerions comprendre ce qui s''est passé. Pourriez-vous nous contacter directement ?'),
    ('a1000000-0000-0000-0000-000000000001', 'negative', 'en', 'We sincerely apologise for falling short of your expectations. Your satisfaction is our priority. Please contact us directly so we can make things right.'),
    ('a1000000-0000-0000-0000-000000000001', 'negative', 'ru', 'Приносим искренние извинения за неудачный опыт. Ваше удовлетворение — наш приоритет. Пожалуйста, свяжитесь с нами напрямую, чтобы мы могли исправить ситуацию.');

  -- ================================================================
  -- VENUE 2: Salon Lumière (Beauty Salon)
  -- ================================================================
  INSERT INTO venues (
    id, name, type, country, timezone, tone_brief,
    languages, google_place_id,
    subscription_status, subscription_plan,
    trial_ends_at, auto_reply_reviews, onboarding_completed, onboarding_step
  ) VALUES (
    'a2000000-0000-0000-0000-000000000002',
    'Salon Lumière',
    'salon',
    'MC',
    'Europe/Monaco',
    'Chic Monaco beauty salon specialising in hair, nails, and skincare. Friendly yet professional tone. Emphasise expertise, hygiene, and bespoke treatments.',
    ARRAY['fr','en'],
    'ChIJ_demo_salon_lumiere',
    'trialing',
    'standard',
    NOW() + INTERVAL '25 days',
    TRUE, TRUE, 'complete'
  );

  -- Channels for Salon Lumière
  INSERT INTO venue_channels (venue_id, channel, channel_account_id, webhook_verified, status)
  VALUES
    ('a2000000-0000-0000-0000-000000000002', 'whatsapp',        '+37799005678', TRUE,  'active'),
    ('a2000000-0000-0000-0000-000000000002', 'google_business', 'salon_lumiere', FALSE, 'active');

  -- Conversations for Salon Lumière
  INSERT INTO conversations (id, venue_id, channel, customer_id, customer_name, customer_phone, language, status, last_message_at)
  VALUES
    ('b2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'whatsapp', 'whatsapp:+33601234567', 'Isabelle Blanc',  '+33601234567', 'fr', 'resolved', NOW() - INTERVAL '1 day'),
    ('b2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 'whatsapp', 'whatsapp:+44771234567', 'Charlotte Evans', '+44771234567', 'en', 'open',     NOW() - INTERVAL '30 minutes');

  -- Messages for Salon Lumière
  INSERT INTO messages (conversation_id, direction, content, ai_generated, ai_model, status)
  VALUES
    ('b2000000-0000-0000-0000-000000000001', 'inbound',  'Bonjour, est-ce que vous faites des soins kératine ? Et quel est le prix pour des cheveux longs ?', FALSE, NULL, 'read'),
    ('b2000000-0000-0000-0000-000000000001', 'outbound', 'Bonjour Isabelle ! Oui, nous proposons le soin kératine brésilien — idéal pour lisser et nourrir vos cheveux en profondeur. Pour les cheveux longs, comptez environ 150–180€ selon la longueur exacte. Le soin dure 2h environ. Souhaitez-vous prendre rendez-vous ?', TRUE, 'claude-sonnet-4-6', 'delivered'),
    ('b2000000-0000-0000-0000-000000000001', 'inbound',  'Oui s''il vous plaît pour vendredi après-midi si possible.', FALSE, NULL, 'read'),
    ('b2000000-0000-0000-0000-000000000001', 'outbound', 'Parfait ! J''ai un créneau disponible vendredi 28 mars à 14h00. Est-ce que ça vous convient ?', TRUE, 'claude-sonnet-4-6', 'delivered'),
    ('b2000000-0000-0000-0000-000000000002', 'inbound',  'Hello, do you offer gel nail extensions? How much does it cost?', FALSE, NULL, 'delivered'),
    ('b2000000-0000-0000-0000-000000000002', 'outbound', 'Hello Charlotte! Yes, we specialise in gel nail extensions — natural, almond, coffin, or stiletto shapes. Our full set starts from 75€ and includes a consultation and nail art of your choice. Would you like to book an appointment?', TRUE, 'claude-sonnet-4-6', 'delivered');

  -- Bookings for Salon Lumière
  INSERT INTO bookings (venue_id, customer_name, customer_phone, customer_channel, service_type, booked_at, status, confirmation_sent, party_size)
  VALUES
    ('a2000000-0000-0000-0000-000000000002', 'Isabelle Blanc',  '+33601234567', 'whatsapp', 'keratin_treatment', NOW() + INTERVAL '1 day' + INTERVAL '14 hours', 'confirmed', TRUE,  1),
    ('a2000000-0000-0000-0000-000000000002', 'Marie Leclerc',   '+37799112233', 'whatsapp', 'haircut_color',     NOW() - INTERVAL '3 days' + INTERVAL '10 hours', 'completed', TRUE,  1),
    ('a2000000-0000-0000-0000-000000000002', 'Anne Fontaine',   '+33623456789', 'whatsapp', 'manicure',          NOW() + INTERVAL '4 days' + INTERVAL '11 hours', 'confirmed', TRUE,  1);

  -- Google Reviews for Salon Lumière
  INSERT INTO google_reviews (venue_id, review_id, author_name, rating, content, reply_text, replied_at, sentiment)
  VALUES
    ('a2000000-0000-0000-0000-000000000002', 'demo_review_010', 'Isabelle B.', 5, 'Salon magnifique, équipe professionnelle et accueillante. Mon soin kératine a duré parfaitement et le résultat est superbe. Je reviendrai !',
     'Merci mille fois Isabelle ! Votre satisfaction est notre plus belle récompense. À très bientôt chez Salon Lumière ! ✨', NOW() - INTERVAL '2 days', 'positive'),
    ('a2000000-0000-0000-0000-000000000002', 'demo_review_011', 'Charlotte E.', 5, 'Best nail salon in Monaco! The gel extensions lasted 3 weeks perfectly. Super friendly staff and great atmosphere.',
     'Thank you so much Charlotte! We put great care into every set of nails. Can''t wait to see you again! 💅', NOW() - INTERVAL '5 days', 'positive');

  -- Review templates for Salon Lumière
  INSERT INTO review_templates (venue_id, sentiment, language, template)
  VALUES
    ('a2000000-0000-0000-0000-000000000002', 'positive', 'fr', 'Merci pour ce beau message ! Toute l''équipe de Salon Lumière est ravie de vous avoir accueillie. Nous vous attendons pour votre prochain soin !'),
    ('a2000000-0000-0000-0000-000000000002', 'positive', 'en', 'Thank you for your lovely review! The whole Salon Lumière team is delighted you had a great experience. See you next time!'),
    ('a2000000-0000-0000-0000-000000000002', 'neutral',  'fr', 'Merci pour votre retour. Nous prenons en compte vos remarques pour améliorer nos services. N''hésitez pas à nous contacter si vous avez des questions.'),
    ('a2000000-0000-0000-0000-000000000002', 'neutral',  'en', 'Thank you for your feedback. We always look to improve and appreciate your comments. Feel free to reach out if you''d like to discuss anything.'),
    ('a2000000-0000-0000-0000-000000000002', 'negative', 'fr', 'Nous sommes désolés que votre expérience n''ait pas été à la hauteur. Contactez-nous directement et nous ferons tout pour remédier à la situation.'),
    ('a2000000-0000-0000-0000-000000000002', 'negative', 'en', 'We''re sorry your visit didn''t meet your expectations. Please contact us directly so we can make it right for you.');

  -- ================================================================
  -- VENUE 3: Boutique Azure (Fashion Boutique)
  -- ================================================================
  INSERT INTO venues (
    id, name, type, country, timezone, tone_brief,
    languages, google_place_id,
    subscription_status, subscription_plan,
    trial_ends_at, auto_reply_reviews, onboarding_completed, onboarding_step
  ) VALUES (
    'a3000000-0000-0000-0000-000000000003',
    'Boutique Azure',
    'boutique',
    'FR',
    'Europe/Paris',
    'Luxury fashion boutique in Nice, Côte d''Azur. Sophisticated, warm tone. Specialises in Mediterranean designers, local artisans, and summer resort wear.',
    ARRAY['fr','en','ru'],
    'ChIJ_demo_boutique_azure',
    'trialing',
    'standard',
    NOW() + INTERVAL '22 days',
    TRUE, TRUE, 'complete'
  );

  -- Channels for Boutique Azure
  INSERT INTO venue_channels (venue_id, channel, channel_account_id, webhook_verified, status)
  VALUES
    ('a3000000-0000-0000-0000-000000000003', 'whatsapp',        '+33493456789', TRUE,  'active'),
    ('a3000000-0000-0000-0000-000000000003', 'google_business', 'boutique_azure', FALSE, 'active');

  -- Conversations for Boutique Azure
  INSERT INTO conversations (id, venue_id, channel, customer_id, customer_name, customer_phone, language, status, last_message_at)
  VALUES
    ('b3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'whatsapp', 'whatsapp:+33698112233', 'Claire Moreau',    '+33698112233', 'fr', 'resolved', NOW() - INTERVAL '4 hours'),
    ('b3000000-0000-0000-0000-000000000002', 'a3000000-0000-0000-0000-000000000003', 'whatsapp', 'whatsapp:+79261234567', 'Наталья Иванова',  '+79261234567', 'ru', 'open',     NOW() - INTERVAL '1 hour');

  -- Messages for Boutique Azure
  INSERT INTO messages (conversation_id, direction, content, ai_generated, ai_model, status)
  VALUES
    ('b3000000-0000-0000-0000-000000000001', 'inbound',  'Bonjour, avez-vous des robes de soirée pour une taille 38 ?', FALSE, NULL, 'read'),
    ('b3000000-0000-0000-0000-000000000001', 'outbound', 'Bonjour Claire ! Oui, notre nouvelle collection printemps propose plusieurs robes de soirée en taille 38. Nous avons notamment une magnifique robe de la créatrice niçoise Léa Marseille — robe midi en soie bleue à 420€ — et une robe évasée brodée à la main à 380€. Souhaitez-vous venir les essayer en boutique ?', TRUE, 'claude-sonnet-4-6', 'delivered'),
    ('b3000000-0000-0000-0000-000000000002', 'inbound',  'Здравствуйте! Есть ли у вас сумки Saint-Laurent или Jacquemus?', FALSE, NULL, 'delivered'),
    ('b3000000-0000-0000-0000-000000000002', 'outbound', 'Добрый день, Наталья! Да, у нас есть текущая коллекция Jacquemus — сумки Le Chiquito и Le Bambino в нескольких расцветках от 395€. Saint Laurent сейчас нет в наличии, но мы ожидаем поставку в апреле. Хотите, чтобы мы уведомили вас, как только они поступят?', TRUE, 'claude-sonnet-4-6', 'delivered');

  -- Google Reviews for Boutique Azure
  INSERT INTO google_reviews (venue_id, review_id, author_name, rating, content, reply_text, replied_at, sentiment)
  VALUES
    ('a3000000-0000-0000-0000-000000000003', 'demo_review_020', 'Claire M.',    5, 'Boutique magnifique avec une sélection unique de créateurs locaux. J''ai trouvé ma robe de soirée parfaite en 20 minutes ! Équipe très conseillère.',
     'Merci Claire ! Nous sommes ravis de vous avoir aidée à trouver votre robe parfaite. Nous vous attendons pour la prochaine occasion ! 💙', NOW() - INTERVAL '1 day', 'positive'),
    ('a3000000-0000-0000-0000-000000000003', 'demo_review_021', 'Natalia I.',   5, 'Прекрасный бутик с отличным выбором! Персонал очень вежлив и помог мне подобрать образ. Обязательно вернусь!',
     'Спасибо большое, Наталья! Очень рады, что вам понравилось. Будем рады видеть вас снова! 🌊', NOW() - INTERVAL '2 days', 'positive');

  -- Review templates for Boutique Azure
  INSERT INTO review_templates (venue_id, sentiment, language, template)
  VALUES
    ('a3000000-0000-0000-0000-000000000003', 'positive', 'fr', 'Merci pour votre beau témoignage ! Nous adorons partager notre passion pour la mode méditerranéenne. À très bientôt chez Boutique Azure !'),
    ('a3000000-0000-0000-0000-000000000003', 'positive', 'en', 'Thank you for your wonderful review! We love sharing our passion for Mediterranean fashion. See you soon at Boutique Azure!'),
    ('a3000000-0000-0000-0000-000000000003', 'positive', 'ru', 'Большое спасибо за ваш чудесный отзыв! Мы обожаем делиться нашей страстью к средиземноморской моде. До скорой встречи в Boutique Azure!'),
    ('a3000000-0000-0000-0000-000000000003', 'neutral',  'fr', 'Merci pour votre avis. Vos remarques nous aident à progresser. N''hésitez pas à revenir nous voir.'),
    ('a3000000-0000-0000-0000-000000000003', 'neutral',  'en', 'Thank you for your feedback. We always look to improve and hope to see you again soon.'),
    ('a3000000-0000-0000-0000-000000000003', 'neutral',  'ru', 'Спасибо за ваш отзыв. Мы стремимся к совершенству и надеемся снова увидеть вас в нашем бутике.'),
    ('a3000000-0000-0000-0000-000000000003', 'negative', 'fr', 'Nous sommes navrés pour cette expérience. Contactez-nous directement afin que nous puissions échanger et trouver une solution.'),
    ('a3000000-0000-0000-0000-000000000003', 'negative', 'en', 'We''re sorry your visit was disappointing. Please reach out to us directly and we''ll do our best to make it right.'),
    ('a3000000-0000-0000-0000-000000000003', 'negative', 'ru', 'Нам жаль, что ваш визит не оправдал ожиданий. Пожалуйста, свяжитесь с нами напрямую — мы хотим исправить ситуацию.');

END $$;
