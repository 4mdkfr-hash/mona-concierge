-- Seed: upsell_mappings for the 3 demo pilot venues (MON-30)
-- Covers haircut → hair product, facial → serum, manicure → hand cream, etc.
-- fire_offset_hours: negative = before appointment, positive = after

DO $$
BEGIN
  -- Safety guard: skip if already seeded
  IF EXISTS (SELECT 1 FROM upsell_mappings WHERE venue_id = 'a2000000-0000-0000-0000-000000000002') THEN
    RAISE NOTICE 'Upsell mappings seed already applied, skipping.';
    RETURN;
  END IF;

  -- ================================================================
  -- VENUE 1: Le Grill de Monaco (Restaurant)
  -- ================================================================
  INSERT INTO upsell_mappings (venue_id, trigger_service, recommended_product, event_type, fire_offset_hours, template_key) VALUES
    -- Pre-visit: suggest wine pairing 24h before dinner
    ('a1000000-0000-0000-0000-000000000001', 'dinner', 'wine_pairing_selection', 'pre_visit_upsell',     -24, 'default'),
    -- Post-visit: suggest cheese & dessert platter 2h after dinner
    ('a1000000-0000-0000-0000-000000000001', 'dinner', 'cheese_dessert_platter', 'post_visit_cross_sell', 2,  'default'),
    -- Post-visit: suggest afternoon experience after lunch
    ('a1000000-0000-0000-0000-000000000001', 'lunch',  'chef_table_experience',  'post_visit_cross_sell', 2,  'default'),
    -- Retention: re-engage after 25 days
    ('a1000000-0000-0000-0000-000000000001', 'dinner', 'seasonal_menu_preview',  'retention',             600, 'default'),
    ('a1000000-0000-0000-0000-000000000001', 'lunch',  'seasonal_menu_preview',  'retention',             600, 'default');

  -- ================================================================
  -- VENUE 2: Salon Lumière (Beauty Salon)
  -- ================================================================
  INSERT INTO upsell_mappings (venue_id, trigger_service, recommended_product, event_type, fire_offset_hours, template_key) VALUES
    -- Pre-visit upsells: suggest add-ons before appointment
    ('a2000000-0000-0000-0000-000000000002', 'haircut',           'scalp_treatment',          'pre_visit_upsell',     -24, 'default'),
    ('a2000000-0000-0000-0000-000000000002', 'haircut_color',     'gloss_treatment',          'pre_visit_upsell',     -24, 'default'),
    ('a2000000-0000-0000-0000-000000000002', 'keratin_treatment', 'deep_conditioning_mask',   'pre_visit_upsell',     -24, 'default'),
    ('a2000000-0000-0000-0000-000000000002', 'manicure',          'nail_art_upgrade',         'pre_visit_upsell',     -24, 'default'),
    -- Post-visit cross-sells: recommend at-home products 48h after
    ('a2000000-0000-0000-0000-000000000002', 'haircut',           'hair_treatment_oil',        'post_visit_cross_sell', 48, 'default'),
    ('a2000000-0000-0000-0000-000000000002', 'haircut_color',     'color_maintenance_kit',     'post_visit_cross_sell', 48, 'default'),
    ('a2000000-0000-0000-0000-000000000002', 'keratin_treatment', 'keratin_maintenance_serum', 'post_visit_cross_sell', 48, 'default'),
    ('a2000000-0000-0000-0000-000000000002', 'manicure',          'luxury_hand_cream',         'post_visit_cross_sell', 48, 'default'),
    -- Retention: re-engage after 25 days
    ('a2000000-0000-0000-0000-000000000002', 'haircut',           'seasonal_color_refresh',   'retention',             600, 'default'),
    ('a2000000-0000-0000-0000-000000000002', 'haircut_color',     'seasonal_color_refresh',   'retention',             600, 'default'),
    ('a2000000-0000-0000-0000-000000000002', 'keratin_treatment', 'keratin_touch_up',         'retention',             600, 'default'),
    ('a2000000-0000-0000-0000-000000000002', 'manicure',          'gel_nail_refresh',         'retention',             600, 'default');

  -- ================================================================
  -- VENUE 3: Boutique Azure (Fashion Boutique)
  -- ================================================================
  INSERT INTO upsell_mappings (venue_id, trigger_service, recommended_product, event_type, fire_offset_hours, template_key) VALUES
    -- Post-visit: suggest styling session 24h after shopping visit
    ('a3000000-0000-0000-0000-000000000003', 'shopping',       'personal_styling_consultation', 'post_visit_cross_sell', 24,  'default'),
    ('a3000000-0000-0000-0000-000000000003', 'fitting',        'personal_styling_consultation', 'post_visit_cross_sell', 24,  'default'),
    -- Retention: notify about new arrivals after 25 days
    ('a3000000-0000-0000-0000-000000000003', 'shopping',       'new_collection_preview',        'retention',             600, 'default'),
    ('a3000000-0000-0000-0000-000000000003', 'fitting',        'new_collection_preview',        'retention',             600, 'default');

END $$;
