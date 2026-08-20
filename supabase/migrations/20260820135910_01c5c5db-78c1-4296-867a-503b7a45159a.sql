
-- ---------- aggregate-only public vote tallies ----------
CREATE TABLE public.city_tallies (
  city_id uuid PRIMARY KEY REFERENCES public.cities(id) ON DELETE CASCADE,
  vote_count integer NOT NULL DEFAULT 0,
  rating_count integer NOT NULL DEFAULT 0,
  rating_sum integer NOT NULL DEFAULT 0,
  last_vote_at timestamptz,
  recent_vote_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.city_tallies TO anon, authenticated;
GRANT ALL ON public.city_tallies TO service_role;
ALTER TABLE public.city_tallies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vote tallies are public" ON public.city_tallies FOR SELECT USING (true);

INSERT INTO public.city_tallies (city_id) SELECT id FROM public.cities
ON CONFLICT (city_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.city_tallies_seed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.city_tallies (city_id) VALUES (NEW.id) ON CONFLICT (city_id) DO NOTHING;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.city_tallies_seed() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER cities_seed_tallies AFTER INSERT ON public.cities
FOR EACH ROW EXECUTE FUNCTION public.city_tallies_seed();

CREATE OR REPLACE FUNCTION public.recount_city(_city_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.city_tallies (city_id, vote_count, rating_count, rating_sum, last_vote_at, recent_vote_count, updated_at)
  SELECT _city_id,
         count(*)::int,
         count(rating)::int,
         COALESCE(sum(rating),0)::int,
         max(created_at),
         count(*) FILTER (WHERE created_at > now() - interval '7 days')::int,
         now()
  FROM public.city_votes WHERE city_id = _city_id
  ON CONFLICT (city_id) DO UPDATE SET
    vote_count = EXCLUDED.vote_count,
    rating_count = EXCLUDED.rating_count,
    rating_sum = EXCLUDED.rating_sum,
    last_vote_at = EXCLUDED.last_vote_at,
    recent_vote_count = EXCLUDED.recent_vote_count,
    updated_at = now();
END; $$;
REVOKE ALL ON FUNCTION public.recount_city(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.city_votes_sync()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP <> 'INSERT' AND OLD.city_id IS NOT NULL THEN PERFORM public.recount_city(OLD.city_id); END IF;
  IF TG_OP <> 'DELETE' THEN PERFORM public.recount_city(NEW.city_id); END IF;
  RETURN NULL;
END; $$;
REVOKE ALL ON FUNCTION public.city_votes_sync() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER city_votes_sync_tallies AFTER INSERT OR UPDATE OR DELETE ON public.city_votes
FOR EACH ROW EXECUTE FUNCTION public.city_votes_sync();

-- ---------- rebuild stats on tallies + publicly readable reviews ----------
DROP VIEW IF EXISTS public.platform_stats;
DROP VIEW IF EXISTS public.city_rankings;
DROP VIEW IF EXISTS public.city_stats;
DROP VIEW IF EXISTS public.restaurant_stats;

CREATE VIEW public.city_stats WITH (security_invoker = on) AS
WITH r AS (
  SELECT city_id,
         count(*)::int AS review_count,
         count(photo_path)::int AS photo_count,
         count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS recent_review_count
  FROM public.reviews WHERE status = 'published' GROUP BY city_id
), g AS (
  SELECT CASE WHEN sum(rating_count) > 0 THEN sum(rating_sum)::numeric / sum(rating_count) END AS global_avg
  FROM public.city_tallies
), base AS (
  SELECT c.id AS city_id,
         t.vote_count,
         t.rating_count,
         CASE WHEN t.rating_count > 0 THEN round(t.rating_sum::numeric / t.rating_count, 2) END AS raw_average,
         t.recent_vote_count,
         COALESCE(r.review_count,0) AS review_count,
         COALESCE(r.photo_count,0) AS photo_count,
         COALESCE(r.recent_review_count,0) AS recent_review_count,
         CASE WHEN t.rating_count = 0 THEN NULL
              ELSE round(((COALESCE(g.global_avg,5) * 5) + t.rating_sum) / (5 + t.rating_count), 2)
         END AS index_score
  FROM public.cities c
  JOIN public.city_tallies t ON t.city_id = c.id
  LEFT JOIN r ON r.city_id = c.id
  CROSS JOIN g
)
SELECT b.*,
  CASE WHEN b.vote_count > 0 THEN rank() OVER (
    PARTITION BY (b.vote_count > 0)
    ORDER BY COALESCE(b.index_score, 0) DESC, b.vote_count DESC
  ) END::int AS rank
FROM base b;
GRANT SELECT ON public.city_stats TO anon, authenticated;

CREATE VIEW public.restaurant_stats WITH (security_invoker = on) AS
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
  CASE WHEN b.review_count > 0 THEN rank() OVER (
    PARTITION BY b.city_id, (b.review_count > 0)
    ORDER BY COALESCE(b.community_score,0) DESC, b.review_count DESC
  ) END::int AS rank
FROM base b;
GRANT SELECT ON public.restaurant_stats TO anon, authenticated;

CREATE VIEW public.city_rankings WITH (security_invoker = on) AS
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
  SELECT sn.rank FROM public.ranking_snapshots sn
  WHERE sn.city_id = c.id ORDER BY sn.captured_at DESC LIMIT 1
) prev ON true;
GRANT SELECT ON public.city_rankings TO anon, authenticated;

CREATE VIEW public.platform_stats WITH (security_invoker = on) AS
SELECT
  (SELECT COALESCE(sum(vote_count),0)::int FROM public.city_tallies) AS total_votes,
  (SELECT count(*)::int FROM public.city_tallies WHERE vote_count > 0) AS cities_ranked,
  (SELECT count(*)::int FROM public.reviews WHERE status='published') AS total_reviews,
  (SELECT count(*)::int FROM public.reviews WHERE status='published' AND photo_path IS NOT NULL) AS photo_reviews,
  (SELECT count(*)::int FROM public.cities WHERE status='live') AS live_cities;
GRANT SELECT ON public.platform_stats TO anon, authenticated;

-- ---------- lock down internal definer helpers ----------
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_vote() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_review() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
REVOKE ALL ON FUNCTION public.capture_ranking_snapshot() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.capture_ranking_snapshot() TO authenticated;
