-- =====================================================
-- FIX CARNIVAL ID MISMATCH AND INSERT PROPER FOOD STALLS
-- =====================================================

-- =====================================================
-- STEP 1: CHECK WHAT'S IN YOUR CARNIVALS TABLE
-- =====================================================

-- Check if carnivals table exists and what's in it
SELECT 
    id,
    external_id,
    name,
    location,
    date,
    status
FROM carnivals 
ORDER BY id;

-- =====================================================
-- STEP 2: INSERT CARNIVALS IF THEY DON'T EXIST
-- =====================================================

-- Insert carnival records (only if they don't exist)
INSERT INTO carnivals (
    external_id,
    name,
    location,
    date,
    status,
    description,
    website,
    expected_attendance,
    highlights,
    route_data,
    coordinates,
    images,
    tags
) VALUES 
('carnival-001', 'London Caribbean Carnival 2024', 'Notting Hill, London', '2024-08-26', 'active', 'The biggest Caribbean carnival in Europe featuring vibrant costumes, music, and Caribbean cuisine.', 'https://www.nottinghillcarnival.biz', '2 million+', '["Live Music", "Street Food", "Costume Parade", "Dance Performances"]'::jsonb, '{"route": "Notting Hill to Ladbroke Grove"}'::jsonb, '{"lat": 51.5200, "lng": -0.2100}'::jsonb, '["https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400"]'::jsonb, '["caribbean", "music", "culture", "food"]'::jsonb),
('carnival-002', 'Summer Food Festival 2024', 'Hyde Park, London', '2024-09-15', 'active', 'International food festival featuring cuisines from around the world with live cooking demonstrations.', 'https://www.summerfoodfestival.co.uk', '50,000+', '["Cooking Demos", "Food Tasting", "Chef Competitions", "Wine Pairing"]'::jsonb, '{"route": "Hyde Park Central"}'::jsonb, '{"lat": 51.5074, "lng": -0.1667}'::jsonb, '["https://images.unsplash.com/photo-1504674900240-9c9c0c1d0b1a?w=400"]'::jsonb, '["food", "international", "summer", "festival"]'::jsonb),
('carnival-003', 'Winter Street Food Market', 'Covent Garden, London', '2024-12-01', 'upcoming', 'Cozy winter food market with hot drinks, comfort food, and festive atmosphere.', 'https://www.winterstreetfood.co.uk', '25,000+', '["Hot Drinks", "Comfort Food", "Festive Decor", "Live Music"]'::jsonb, '{"route": "Covent Garden Piazza"}'::jsonb, '{"lat": 51.5115, "lng": -0.1220}'::jsonb, '["https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400"]'::jsonb, '["winter", "street-food", "festive", "cozy"]'::jsonb),
('carnival-004', 'Spring Festival 2024', 'Greenwich Park, London', '2024-04-15', 'upcoming', 'Spring celebration with fresh seasonal foods, outdoor activities, and family entertainment.', 'https://www.springfestival.co.uk', '30,000+', '["Seasonal Food", "Outdoor Activities", "Family Entertainment", "Garden Tours"]'::jsonb, '{"route": "Greenwich Park Central"}'::jsonb, '{"lat": 51.4769, "lng": 0.0005}'::jsonb, '["https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400"]'::jsonb, '["spring", "seasonal", "family", "outdoor"]'::jsonb)
ON CONFLICT (external_id) DO NOTHING;

-- Check carnivals again after insert
SELECT 
    id,
    external_id,
    name,
    location,
    status
FROM carnivals 
ORDER BY id;

-- =====================================================
-- STEP 3: INSERT FOOD STALLS WITH PROPER JSONB CASTING
-- =====================================================

-- Insert food stalls with correct JSONB casting
INSERT INTO food_stalls (
    carnival_id,
    name,
    cuisine,
    location,
    description,
    rating,
    price_range,
    image_url,
    coordinates,
    opening_hours,
    special_dietary_options,
    contact_info,
    status
) 
SELECT 
    c.id as carnival_id,
    'Caribbean Delights' as name,
    'Caribbean' as cuisine,
    'Portobello Road Market' as location,
    'Authentic Caribbean cuisine featuring jerk chicken, rice and peas, and fresh tropical smoothies.' as description,
    4.8 as rating,
    '££' as price_range,
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400' as image_url,
    '{"lat": 51.5074, "lng": -0.1278}'::jsonb as coordinates,
    '["10:00-18:00", "11:00-19:00"]'::jsonb as opening_hours,
    '["vegan", "gluten-free", "halal"]'::jsonb as special_dietary_options,
    '{"phone": "+44 20 7123 4567", "email": "info@caribbeandelights.co.uk"}'::jsonb as contact_info,
    'active' as status
FROM carnivals c 
WHERE c.external_id = 'carnival-001'

UNION ALL

SELECT 
    c.id as carnival_id,
    'Global Street Kitchen' as name,
    'International' as cuisine,
    'Camden Market' as location,
    'A world tour of street food favorites including Thai pad thai, Mexican tacos, and Japanese ramen.' as description,
    4.6 as rating,
    '£££' as price_range,
    'https://images.unsplash.com/photo-1504674900240-9c9c0c1d0b1a?w=400' as image_url,
    '{"lat": 51.5419, "lng": -0.1439}'::jsonb as coordinates,
    '["11:00-21:00", "12:00-22:00"]'::jsonb as opening_hours,
    '["vegetarian", "vegan", "dairy-free"]'::jsonb as special_dietary_options,
    '{"phone": "+44 20 7985 4321", "email": "hello@globalstreetkitchen.com"}'::jsonb as contact_info,
    'active' as status
FROM carnivals c 
WHERE c.external_id = 'carnival-002';

-- =====================================================
-- STEP 4: VERIFY RESULTS
-- =====================================================

-- Show all food stalls with carnival names
SELECT 
    fs.id,
    fs.name,
    fs.cuisine,
    c.name as carnival_name,
    fs.location,
    fs.rating,
    fs.status
FROM food_stalls fs
JOIN carnivals c ON fs.carnival_id = c.id
ORDER BY fs.created_at DESC;
