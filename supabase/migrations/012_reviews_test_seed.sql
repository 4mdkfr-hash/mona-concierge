-- Test reviews: 5★ French, 3★ English, 1★ Russian (pending — for AI reply testing)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM venues WHERE id = 'a1000000-0000-0000-0000-000000000001') THEN
    INSERT INTO google_reviews (venue_id, review_id, author_name, rating, content, reply_text, replied_at, sentiment)
    VALUES
      ('a1000000-0000-0000-0000-000000000001', 'test_review_fr_5', 'Claire D.',   5, 'Une expérience absolument inoubliable. La cuisine est raffinée, le service irréprochable et l''ambiance magique. Je recommande vivement !', NULL, NULL, 'positive'),
      ('a1000000-0000-0000-0000-000000000001', 'test_review_en_3', 'Michael B.',  3, 'Decent place but not worth the price. Food was average, nothing special. Service was okay. Expected more for Monaco.', NULL, NULL, 'neutral'),
      ('a1000000-0000-0000-0000-000000000001', 'test_review_ru_1', 'Анна С.',     1, 'Ужасный опыт. Еда была холодной, официанты грубыми. Ждали заказ больше часа. Никогда не вернёмся!', NULL, NULL, 'negative')
    ON CONFLICT (review_id) DO NOTHING;
  END IF;
END $$;
