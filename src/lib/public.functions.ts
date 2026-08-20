import { createServerFn } from "@tanstack/react-start";

import {
  readCity,
  readPlatformStats,
  readRankings,
  readRestaurant,
  readReviews,
} from "./public-reads.server";

export const getRankings = createServerFn({ method: "GET" }).handler(async () => readRankings());

export const getPlatformStats = createServerFn({ method: "GET" }).handler(async () =>
  readPlatformStats(),
);

export const getCity = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 80) }))
  .handler(async ({ data }) => readCity(data.slug));

export const getRestaurant = createServerFn({ method: "GET" })
  .inputValidator((data: { citySlug: string; restaurantSlug: string }) => ({
    citySlug: String(data.citySlug).slice(0, 80),
    restaurantSlug: String(data.restaurantSlug).slice(0, 120),
  }))
  .handler(async ({ data }) => readRestaurant(data.citySlug, data.restaurantSlug));

export const getLatestPhotoReviews = createServerFn({ method: "GET" }).handler(async () =>
  readReviews({ withPhotoOnly: true, limit: 12 }),
);