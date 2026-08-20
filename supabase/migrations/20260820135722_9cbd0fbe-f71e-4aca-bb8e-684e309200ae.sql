
-- ============ enums ============
CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
CREATE TYPE public.city_status AS ENUM ('live','coming_soon');
CREATE TYPE public.content_status AS ENUM ('published','hidden');

-- ============ profiles ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  home_city_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ roles ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- profile auto-create
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ cities ============
CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state text NOT NULL,
  country text NOT NULL DEFAULT 'India',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  status public.city_status NOT NULL DEFAULT 'coming_soon',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, state)
);
GRANT SELECT ON public.cities TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cities TO authenticated;
GRANT ALL ON public.cities TO service_role;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cities are public" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Admins manage cities" ON public.cities FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER cities_touch BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
ALTER TABLE public.profiles ADD CONSTRAINT profiles_home_city_fkey FOREIGN KEY (home_city_id) REFERENCES public.cities(id) ON DELETE SET NULL;

-- ============ restaurants ============
CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  area text,
  address text,
  latitude double precision,
  longitude double precision,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (city_id, slug)
);
GRANT SELECT ON public.restaurants TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.restaurants TO authenticated;
GRANT ALL ON public.restaurants TO service_role;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Restaurants are public" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Admins manage restaurants" ON public.restaurants FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER restaurants_touch BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ national city votes (one per user) ============
CREATE TABLE public.city_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  rating smallint CHECK (rating IS NULL OR (rating BETWEEN 1 AND 10)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.city_votes TO authenticated;
GRANT ALL ON public.city_votes TO service_role;
ALTER TABLE public.city_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own vote" ON public.city_votes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read votes" ON public.city_votes FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users cast own vote" ON public.city_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users change own vote" ON public.city_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own vote" ON public.city_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER city_votes_touch BEFORE UPDATE ON public.city_votes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- only LIVE cities can receive votes (server-side validation)
CREATE OR REPLACE FUNCTION public.validate_vote()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.city_status;
BEGIN
  SELECT status INTO s FROM public.cities WHERE id = NEW.city_id;
  IF s IS DISTINCT FROM 'live' THEN
    RAISE EXCEPTION 'This city is not open for voting yet';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER city_votes_validate BEFORE INSERT OR UPDATE ON public.city_votes
FOR EACH ROW EXECUTE FUNCTION public.validate_vote();

-- ============ reviews ============
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  overall smallint NOT NULL CHECK (overall BETWEEN 1 AND 10),
  taste smallint CHECK (taste IS NULL OR (taste BETWEEN 1 AND 10)),
  rice smallint CHECK (rice IS NULL OR (rice BETWEEN 1 AND 10)),
  meat smallint CHECK (meat IS NULL OR (meat BETWEEN 1 AND 10)),
  spice smallint CHECK (spice IS NULL OR (spice BETWEEN 1 AND 10)),
  value smallint CHECK (value IS NULL OR (value BETWEEN 1 AND 10)),
  body text CHECK (body IS NULL OR char_length(body) <= 2000),
  photo_path text,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, restaurant_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published reviews are public" ON public.reviews FOR SELECT USING (status = 'published');
CREATE POLICY "Users read own reviews" ON public.reviews FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Moderators read all reviews" ON public.reviews FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'));
CREATE POLICY "Users write own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'published');
CREATE POLICY "Users update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Moderators moderate reviews" ON public.reviews FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator')) WITH CHECK (true);
CREATE POLICY "Admins delete reviews" ON public.reviews FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER reviews_touch BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- restaurant must belong to the given city, and city must be live
CREATE OR REPLACE FUNCTION public.validate_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r_city uuid; s public.city_status;
BEGIN
  SELECT city_id INTO r_city FROM public.restaurants WHERE id = NEW.restaurant_id AND is_active;
  IF r_city IS NULL THEN RAISE EXCEPTION 'Unknown restaurant'; END IF;
  NEW.city_id := r_city;
  SELECT status INTO s FROM public.cities WHERE id = r_city;
  IF s IS DISTINCT FROM 'live' THEN RAISE EXCEPTION 'This city is not open for reviews yet'; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER reviews_validate BEFORE INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.validate_review();

-- ============ reports ============
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 3 AND 500),
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reporter_id, review_id)
);
GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users file reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users read own reports" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Moderators read reports" ON public.reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'));
CREATE POLICY "Moderators resolve reports" ON public.reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator')) WITH CHECK (true);

-- ============ city requests ============
CREATE TABLE public.city_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (city_id, user_id)
);
GRANT SELECT, INSERT ON public.city_requests TO authenticated;
GRANT ALL ON public.city_requests TO service_role;
ALTER TABLE public.city_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users request cities" ON public.city_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own requests" ON public.city_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read requests" ON public.city_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ ranking snapshots (real rank history only) ============
CREATE TABLE public.ranking_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  rank integer NOT NULL,
  index_score numeric(5,2),
  vote_count integer NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ranking_snapshots_city_time ON public.ranking_snapshots (city_id, captured_at DESC);
GRANT SELECT ON public.ranking_snapshots TO anon, authenticated;
GRANT ALL ON public.ranking_snapshots TO service_role;
ALTER TABLE public.ranking_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Snapshots are public" ON public.ranking_snapshots FOR SELECT USING (true);

-- ============ ranking engine (computed from real data only) ============
CREATE OR REPLACE VIEW public.city_stats AS
WITH v AS (
  SELECT city_id,
         count(*)::int AS vote_count,
         count(rating)::int AS rating_count,
         avg(rating) AS raw_average,
         count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS recent_vote_count
  FROM public.city_votes GROUP BY city_id
), r AS (
  SELECT city_id,
         count(*)::int AS review_count,
         count(photo_path)::int AS photo_count,
         count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS recent_review_count
  FROM public.reviews WHERE status = 'published' GROUP BY city_id
), g AS (
  SELECT avg(rating) AS global_avg FROM public.city_votes WHERE rating IS NOT NULL
), base AS (
  SELECT c.id AS city_id,
         COALESCE(v.vote_count,0) AS vote_count,
         COALESCE(v.rating_count,0) AS rating_count,
         round(v.raw_average::numeric,2) AS raw_average,
         COALESCE(v.recent_vote_count,0) AS recent_vote_count,
         COALESCE(r.review_count,0) AS review_count,
         COALESCE(r.photo_count,0) AS photo_count,
         COALESCE(r.recent_review_count,0) AS recent_review_count,
         CASE WHEN COALESCE(v.rating_count,0) = 0 THEN NULL
              ELSE round((((COALESCE(g.global_avg, 5) * 5) + (v.raw_average * v.rating_count)) / (5 + v.rating_count))::numeric, 2)
         END AS index_score
  FROM public.cities c
  LEFT JOIN v ON v.city_id = c.id
  LEFT JOIN r ON r.city_id = c.id
  CROSS JOIN g
)
SELECT b.*,
  CASE WHEN b.vote_count > 0
    THEN rank() OVER (
      PARTITION BY (b.vote_count > 0)
      ORDER BY COALESCE(b.index_score, 0) DESC, b.vote_count DESC
    )
  END::int AS rank
FROM base b;
GRANT SELECT ON public.city_stats TO anon, authenticated;

CREATE OR REPLACE VIEW public.restaurant_stats AS
WITH r AS (
  SELECT restaurant_id,
         count(*)::int AS review_count,
         count(photo_path)::int AS photo_count,
         avg(overall) AS raw_average,
         avg(taste) AS taste_avg, avg(rice) AS rice_avg, avg(meat) AS meat_avg,
         avg(spice) AS spice_avg, avg(value) AS value_avg
  FROM public.reviews WHERE status = 'published' GROUP BY restaurant_id
), g AS (
  SELECT avg(overall) AS global_avg FROM public.reviews WHERE status = 'published'
), base AS (
  SELECT t.id AS restaurant_id, t.city_id,
    COALESCE(r.review_count,0) AS review_count,
    COALESCE(r.photo_count,0) AS photo_count,
    round(r.raw_average::numeric,2) AS raw_average,
    round(r.taste_avg::numeric,2) AS taste_avg,
    round(r.rice_avg::numeric,2) AS rice_avg,
    round(r.meat_avg::numeric,2) AS meat_avg,
    round(r.spice_avg::numeric,2) AS spice_avg,
    round(r.value_avg::numeric,2) AS value_avg,
    CASE WHEN COALESCE(r.review_count,0) = 0 THEN NULL
         ELSE round((((COALESCE(g.global_avg,5) * 3) + (r.raw_average * r.review_count)) / (3 + r.review_count))::numeric,2)
    END AS community_score
  FROM public.restaurants t
  LEFT JOIN r ON r.restaurant_id = t.id
  CROSS JOIN g
  WHERE t.is_active
)
SELECT b.*,
  CASE WHEN b.review_count > 0
    THEN rank() OVER (PARTITION BY b.city_id, (b.review_count > 0)
      ORDER BY COALESCE(b.community_score,0) DESC, b.review_count DESC)
  END::int AS rank
FROM base b;
GRANT SELECT ON public.restaurant_stats TO anon, authenticated;

-- movement vs the most recent real snapshot
CREATE OR REPLACE VIEW public.city_rankings AS
SELECT c.id, c.name, c.state, c.country, c.slug, c.description, c.status,
       c.latitude, c.longitude, c.created_at,
       s.vote_count, s.rating_count, s.raw_average, s.index_score, s.rank,
       s.review_count, s.photo_count, s.recent_vote_count, s.recent_review_count,
       prev.rank AS previous_rank,
       CASE WHEN s.rank IS NULL THEN NULL
            WHEN prev.rank IS NULL THEN 0
            ELSE prev.rank - s.rank END AS rank_movement
FROM public.cities c
JOIN public.city_stats s ON s.city_id = c.id
LEFT JOIN LATERAL (
  SELECT rank FROM public.ranking_snapshots sn
  WHERE sn.city_id = c.id ORDER BY sn.captured_at DESC LIMIT 1
) prev ON true;
GRANT SELECT ON public.city_rankings TO anon, authenticated;

CREATE OR REPLACE VIEW public.platform_stats AS
SELECT
  (SELECT count(*)::int FROM public.city_votes) AS total_votes,
  (SELECT count(*)::int FROM public.city_stats WHERE rank IS NOT NULL) AS cities_ranked,
  (SELECT count(*)::int FROM public.reviews WHERE status='published') AS total_reviews,
  (SELECT count(*)::int FROM public.reviews WHERE status='published' AND photo_path IS NOT NULL) AS photo_reviews,
  (SELECT count(*)::int FROM public.cities WHERE status='live') AS live_cities;
GRANT SELECT ON public.platform_stats TO anon, authenticated;

-- snapshot capture (admin / scheduled)
CREATE OR REPLACE FUNCTION public.capture_ranking_snapshot()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  INSERT INTO public.ranking_snapshots (city_id, rank, index_score, vote_count)
  SELECT city_id, rank, index_score, vote_count FROM public.city_stats WHERE rank IS NOT NULL;
  SELECT count(*) INTO n FROM public.city_stats WHERE rank IS NOT NULL;
  RETURN n;
END; $$;
GRANT EXECUTE ON FUNCTION public.capture_ranking_snapshot() TO authenticated;

-- ============ real city records (no community metrics) ============
INSERT INTO public.cities (name, state, latitude, longitude, slug, description, status) VALUES
('Lucknow','Uttar Pradesh',26.8467,80.9462,'lucknow','Capital of Uttar Pradesh and the home of Awadhi cuisine, known for slow-cooked dum-style biryani and pulao traditions.','live'),
('Hyderabad','Telangana',17.3850,78.4867,'hyderabad','Known for kacchi-gosht dum biryani cooked with raw marinated meat and rice in a sealed pot.','live'),
('Kolkata','West Bengal',22.5726,88.3639,'kolkata','Known for a lightly spiced biryani with potato and boiled egg, developed from Awadhi cooking in the 19th century.','live'),
('Delhi','Delhi',28.6139,77.2090,'delhi','Mughlai cooking hub with biryani styles influenced by Awadhi, Hyderabadi and Punjabi kitchens.','live'),
('Mumbai','Maharashtra',19.0760,72.8777,'mumbai','Home to Bohri, Memoni and Irani-cafe biryani styles alongside coastal variations.','live'),
('Kozhikode','Kerala',11.2588,75.7804,'kozhikode','Known for Malabar biryani made with short-grain kaima rice and fried onion, cashew and raisin garnish.','live'),
('Bengaluru','Karnataka',12.9716,77.5946,'bengaluru','Known for Donne biryani served in dried-leaf bowls, plus military-hotel style preparations.','live'),
('Chennai','Tamil Nadu',13.0827,80.2707,'chennai','Known for Ambur and Dindigul-influenced seeraga samba biryani served across the city.','live'),
('Patna','Bihar',25.5941,85.1376,'patna','Biryani traditions shaped by neighbouring Awadhi and Bengali cooking.','coming_soon'),
('Srinagar','Jammu and Kashmir',34.0837,74.7973,'srinagar','Kashmiri Wazwan cooking traditions with rice preparations distinct from other regions.','coming_soon'),
('Kochi','Kerala',9.9312,76.2673,'kochi','Malabar and Syrian Christian influences on rice and meat preparations.','coming_soon'),
('Aurangabad','Maharashtra',19.8762,75.3433,'aurangabad','Nizami and Marathwada influences on the local biryani style.','coming_soon'),
('Bhopal','Madhya Pradesh',23.2599,77.4126,'bhopal','Bhopali cooking with distinctive slow-cooked meat and rice dishes.','coming_soon'),
('Amritsar','Punjab',31.6340,74.8723,'amritsar','Punjabi pulao and biryani traditions from local dhaba kitchens.','coming_soon');

INSERT INTO public.restaurants (city_id, name, slug, area, address, latitude, longitude, description)
SELECT c.id, x.name, x.slug, x.area, x.address, x.lat, x.lng, x.descr
FROM public.cities c, (VALUES
  ('Tunday Kababi','tunday-kababi','Aminabad','Aminabad, Lucknow, Uttar Pradesh',26.8480,80.9296,'Long-running Lucknow institution known for galouti kebab and Awadhi biryani.'),
  ('Idrees Biryani','idrees-biryani','Chowk','Prag Narayan Road area, Chowk, Lucknow, Uttar Pradesh',26.8560,80.9060,'Old-city kitchen known for large-pot dum-cooked mutton biryani.'),
  ('Wahid Biryani','wahid-biryani','Aminabad','Aminabad, Lucknow, Uttar Pradesh',26.8492,80.9300,'Aminabad landmark serving Lucknawi-style biryani and kebab.'),
  ('Marhaba Hotel','marhaba-hotel','Nakhas','Nakhas, Chowk, Lucknow, Uttar Pradesh',26.8552,80.9082,'Old-city hotel known for mutton biryani and Awadhi curries.'),
  ('Lalla Biryani','lalla-biryani','Akbari Gate','Akbari Gate, Chowk, Lucknow, Uttar Pradesh',26.8598,80.9027,'Small old-city outlet known for early-morning biryani service.')
) AS x(name,slug,area,address,lat,lng,descr)
WHERE c.slug = 'lucknow';

-- ============ realtime ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.city_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;

-- ============ storage for community photos ============
CREATE POLICY "Community photos are public" ON storage.objects FOR SELECT USING (bucket_id = 'biryani-photos');
CREATE POLICY "Users upload own photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'biryani-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'biryani-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'biryani-photos' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));
