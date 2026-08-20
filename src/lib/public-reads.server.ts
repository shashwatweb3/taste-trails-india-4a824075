import type { CityRanking, PlatformStats, PublicReview, RankedRestaurant } from "./types";
import { publicSupabase, publicStorageUrl } from "./supabase-public.server";

const REVIEW_COLUMNS =
  "id, overall, taste, rice, meat, spice, value, body, photo_path, created_at, user_id, restaurant_id, city_id";

export async function readRankings(): Promise<CityRanking[]> {
  const supabase = publicSupabase();
  const { data, error } = await supabase.from("city_rankings").select("*");
  if (error) throw new Error(error.message);
  return sortCities(data ?? []);
}

export function sortCities(cities: CityRanking[]): CityRanking[] {
  return [...cities].sort((a, b) => {
    if (a.rank != null && b.rank != null) return a.rank - b.rank;
    if (a.rank != null) return -1;
    if (b.rank != null) return 1;
    if (a.status !== b.status) return a.status === "live" ? -1 : 1;
    return (a.name ?? "").localeCompare(b.name ?? "");
  });
}

export async function readPlatformStats(): Promise<PlatformStats> {
  const supabase = publicSupabase();
  const { data, error } = await supabase.from("platform_stats").select("*").maybeSingle();
  if (error) throw new Error(error.message);
  return (
    data ?? {
      total_votes: 0,
      cities_ranked: 0,
      total_reviews: 0,
      photo_reviews: 0,
      live_cities: 0,
    }
  );
}

export async function readCity(slug: string): Promise<{
  city: CityRanking;
  restaurants: RankedRestaurant[];
  photos: PublicReview[];
  totalCities: number;
} | null> {
  const supabase = publicSupabase();
  const { data: city, error } = await supabase
    .from("city_rankings")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!city?.id) return null;

  const [restaurants, stats, rankedCount] = await Promise.all([
    supabase
      .from("restaurants")
      .select("*")
      .eq("city_id", city.id)
      .eq("is_active", true)
      .order("name"),
    supabase.from("restaurant_stats").select("*").eq("city_id", city.id),
    supabase.from("city_rankings").select("id", { count: "exact", head: true }).not("rank", "is", null),
  ]);
  if (restaurants.error) throw new Error(restaurants.error.message);
  if (stats.error) throw new Error(stats.error.message);

  const statsById = new Map((stats.data ?? []).map((row) => [row.restaurant_id, row]));
  const ranked: RankedRestaurant[] = (restaurants.data ?? []).map((restaurant) => ({
    ...restaurant,
    stats: statsById.get(restaurant.id) ?? emptyRestaurantStats(),
  }));
  ranked.sort(compareRestaurants);

  const photos = await readReviews({ cityId: city.id, withPhotoOnly: true, limit: 12 });
  return { city, restaurants: ranked, photos, totalCities: rankedCount.count ?? 0 };
}

export function emptyRestaurantStats(): RankedRestaurant["stats"] {
  return {
    review_count: 0,
    photo_count: 0,
    raw_average: null,
    community_score: null,
    rank: null,
    taste_avg: null,
    rice_avg: null,
    meat_avg: null,
    spice_avg: null,
    value_avg: null,
  };
}

function compareRestaurants(a: RankedRestaurant, b: RankedRestaurant) {
  const ra = a.stats.rank;
  const rb = b.stats.rank;
  if (ra != null && rb != null) return ra - rb;
  if (ra != null) return -1;
  if (rb != null) return 1;
  return a.name.localeCompare(b.name);
}

export async function readRestaurant(citySlug: string, restaurantSlug: string) {
  const supabase = publicSupabase();
  const { data: city, error: cityError } = await supabase
    .from("city_rankings")
    .select("*")
    .eq("slug", citySlug)
    .maybeSingle();
  if (cityError) throw new Error(cityError.message);
  if (!city?.id) return null;

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("city_id", city.id)
    .eq("slug", restaurantSlug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!restaurant) return null;

  const [stats, reviews] = await Promise.all([
    supabase.from("restaurant_stats").select("*").eq("restaurant_id", restaurant.id).maybeSingle(),
    readReviews({ restaurantId: restaurant.id, limit: 50 }),
  ]);

  return {
    city,
    restaurant: { ...restaurant, stats: stats.data ?? emptyRestaurantStats() },
    reviews,
  };
}

export async function readReviews(options: {
  cityId?: string;
  restaurantId?: string;
  withPhotoOnly?: boolean;
  limit?: number;
}): Promise<PublicReview[]> {
  const supabase = publicSupabase();
  let query = supabase
    .from("reviews")
    .select(REVIEW_COLUMNS)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 20);
  if (options.cityId) query = query.eq("city_id", options.cityId);
  if (options.restaurantId) query = query.eq("restaurant_id", options.restaurantId);
  if (options.withPhotoOnly) query = query.not("photo_path", "is", null);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const [profiles, restaurants, cities] = await Promise.all([
    supabase.from("profiles").select("id, display_name").in("id", unique(rows.map((r) => r.user_id))),
    supabase.from("restaurants").select("id, name, slug").in("id", unique(rows.map((r) => r.restaurant_id))),
    supabase.from("cities").select("id, name, slug").in("id", unique(rows.map((r) => r.city_id))),
  ]);

  const nameById = new Map((profiles.data ?? []).map((p) => [p.id, p.display_name]));
  const restaurantById = new Map((restaurants.data ?? []).map((r) => [r.id, r]));
  const cityById = new Map((cities.data ?? []).map((c) => [c.id, c]));

  return rows.map((row) => ({
    id: row.id,
    overall: row.overall,
    taste: row.taste,
    rice: row.rice,
    meat: row.meat,
    spice: row.spice,
    value: row.value,
    body: row.body,
    photo_url: row.photo_path ? publicStorageUrl(row.photo_path) : null,
    created_at: row.created_at,
    author: nameById.get(row.user_id) ?? "Biryani Index member",
    restaurant_name: restaurantById.get(row.restaurant_id)?.name ?? "",
    restaurant_slug: restaurantById.get(row.restaurant_id)?.slug ?? "",
    city_name: cityById.get(row.city_id)?.name ?? "",
    city_slug: cityById.get(row.city_id)?.slug ?? "",
  }));
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}