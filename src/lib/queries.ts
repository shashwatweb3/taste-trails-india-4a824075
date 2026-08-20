import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

import {
  getCity,
  getLatestPhotoReviews,
  getPlatformStats,
  getRankings,
  getRestaurant,
} from "./public.functions";

export const rankingsQuery = () =>
  queryOptions({ queryKey: ["rankings"], queryFn: () => getRankings() });

export const platformStatsQuery = () =>
  queryOptions({ queryKey: ["platform-stats"], queryFn: () => getPlatformStats() });

export const cityQuery = (slug: string) =>
  queryOptions({ queryKey: ["city", slug], queryFn: () => getCity({ data: { slug } }) });

export const restaurantQuery = (citySlug: string, restaurantSlug: string) =>
  queryOptions({
    queryKey: ["restaurant", citySlug, restaurantSlug],
    queryFn: () => getRestaurant({ data: { citySlug, restaurantSlug } }),
  });

export const latestPhotosQuery = () =>
  queryOptions({ queryKey: ["latest-photos"], queryFn: () => getLatestPhotoReviews() });

export const myVoteQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["my-vote", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("city_votes")
        .select("id, city_id, rating, created_at")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

export const myProfileQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["my-profile", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, home_city_id")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

export const myReviewsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["my-reviews", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, restaurant_id, city_id, overall, body, photo_path, created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });