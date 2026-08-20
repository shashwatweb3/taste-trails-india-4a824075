import type { Database } from "@/integrations/supabase/types";

export type CityRanking = Database["public"]["Views"]["city_rankings"]["Row"];
export type PlatformStats = Database["public"]["Views"]["platform_stats"]["Row"];
export type RestaurantRow = Database["public"]["Tables"]["restaurants"]["Row"];
export type RestaurantStats = Database["public"]["Views"]["restaurant_stats"]["Row"];
export type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

export type RankedRestaurant = RestaurantRow & {
  stats: Pick<
    RestaurantStats,
    | "review_count"
    | "photo_count"
    | "raw_average"
    | "community_score"
    | "rank"
    | "taste_avg"
    | "rice_avg"
    | "meat_avg"
    | "spice_avg"
    | "value_avg"
  >;
};

export type PublicReview = {
  id: string;
  overall: number;
  taste: number | null;
  rice: number | null;
  meat: number | null;
  spice: number | null;
  value: number | null;
  body: string | null;
  photo_url: string | null;
  created_at: string;
  author: string;
  restaurant_name: string;
  restaurant_slug: string;
  city_name: string;
  city_slug: string;
};