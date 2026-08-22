import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { IndiaMap } from "@/components/india-map";
import { RestaurantRankList } from "@/components/restaurant-rank-list";
import { Button } from "@/components/ui/button";
import { formatScore, rankLabel } from "@/lib/format";
import { cityQuery, rankingsQuery } from "@/lib/queries";
import { useRankingRealtime } from "@/lib/use-ranking-realtime";

export const Route = createFileRoute("/city/$slug")({
  loader: async ({ context, params }) => {
    const [city] = await Promise.all([
      context.queryClient.ensureQueryData(cityQuery(params.slug)),
      context.queryClient.ensureQueryData(rankingsQuery()),
    ]);
    if (!city) throw notFound();
    return { name: city.city.name ?? "City", state: city.city.state ?? "" };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "City unavailable | Biryani Index" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `Best biryani in ${loaderData.name} | Biryani Index`;
    const description = `${loaderData.name}, ${loaderData.state}: its current national biryani rank and the top biryani restaurants, ranked by real community reviews.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CityPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <EmptyState title="City not found" description="This city isn't part of the index yet." />
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <EmptyState title="City didn't load" description="Please refresh and try again." />
    </div>
  ),
});

function CityPage() {
  const { slug } = Route.useParams();
  const navigate = Route.useNavigate();
  const { data } = useSuspenseQuery(cityQuery(slug));
  const { data: cities } = useSuspenseQuery(rankingsQuery());
  useRankingRealtime();

  if (!data) return null;
  const { city, restaurants, photos, totalCities } = data;

  return (
    <div className="relative">
      <div className="bi-map-canvas relative h-[52vh] min-h-72 w-full overflow-hidden border-b border-border/70">
        <IndiaMap
          cities={cities}
          focusSlug={city.slug ?? slug}
          onSelectCity={(next) => {
            if (next !== slug) void navigate({ to: "/city/$slug", params: { slug: next } });
          }}
          className="absolute inset-0"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-4">
          <Button asChild size="sm" variant="outline" className="pointer-events-auto gap-2">
            <Link to="/">
              <ArrowLeft className="size-4" /> Explore another city
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-14 px-4 py-10 sm:px-6">
        <header className="rise">
          <p className="eyebrow text-primary">
            {city.status === "live" ? "Live city" : "Coming soon"}
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-6xl">{city.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{city.state}, India</p>

          <div className="mt-8 grid gap-6 border-t border-border/70 pt-8 sm:grid-cols-4">
            <div>
              <p className="eyebrow text-muted-foreground">National rank</p>
              <p className="mt-1 font-display text-4xl font-bold text-primary">
                {rankLabel(city.rank)}
                {city.rank != null && totalCities > 0 ? (
                  <span className="text-sm text-muted-foreground"> / {totalCities}</span>
                ) : null}
              </p>
            </div>
            <div>
              <p className="eyebrow text-muted-foreground">Community votes</p>
              <p className="mt-1 font-display text-4xl font-bold">{city.vote_count ?? 0}</p>
            </div>
            <div>
              <p className="eyebrow text-muted-foreground">Community rating</p>
              <p className="mt-1 font-display text-4xl font-bold">
                {city.raw_average == null ? (
                  <span className="text-base text-muted-foreground">No rating yet</span>
                ) : (
                  formatScore(city.raw_average)
                )}
              </p>
            </div>
            <div>
              <p className="eyebrow text-muted-foreground">Reviews</p>
              <p className="mt-1 font-display text-4xl font-bold">{city.review_count ?? 0}</p>
            </div>
          </div>

          {city.description ? (
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {city.description}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/vote">Vote for {city.name}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/rankings">See national rankings</Link>
            </Button>
          </div>
        </header>

        <section>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Top 5 biryani in {city.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ordered by real community reviews. Places with no reviews stay unrated.
          </p>
          <div className="mt-6">
            <RestaurantRankList citySlug={city.slug ?? slug} restaurants={restaurants} />
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold">Community photos</h2>
          <div className="mt-5">
            {photos.length === 0 ? (
              <EmptyState
                title="No photos yet"
                description="Photos appear here as soon as members post reviews with pictures."
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.photo_url ?? ""}
                    alt={`Biryani at ${photo.restaurant_name} in ${photo.city_name}`}
                    loading="lazy"
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
