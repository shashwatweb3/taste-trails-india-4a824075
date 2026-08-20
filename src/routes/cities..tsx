import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/empty-state";
import { formatScore, rankLabel } from "@/lib/format";
import { cityQuery } from "@/lib/queries";

export const Route = createFileRoute("/cities/$slug")({
  loader: async ({ context, params }) => {
    const city = await context.queryClient.ensureQueryData(cityQuery(params.slug));
    if (!city) throw notFound();
    return { name: city.city.name ?? "City", state: city.city.state ?? "" };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "City unavailable | Biryani Index" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} biryani ranking | Biryani Index`;
    const description = `${loaderData.name}, ${loaderData.state} in India's biryani index: community score, votes and the biryani houses people rate.`;
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
  const { data } = useSuspenseQuery(cityQuery(slug));
  if (!data) return null;
  const { city, restaurants, photos, totalCities } = data;

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6">
      <header>
        <p className="eyebrow text-primary">
          {city.status === "live" ? "Live city" : "Coming soon"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">{city.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{city.state}, India</p>
        <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <dt className="eyebrow text-muted-foreground">National rank</dt>
            <dd className="mt-1 font-display text-3xl font-bold">
              {rankLabel(city.rank)}
              {city.rank != null && totalCities > 0 ? (
                <span className="text-sm text-muted-foreground"> / {totalCities}</span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-muted-foreground">Index score</dt>
            <dd className="mt-1 font-display text-3xl font-bold">
              {formatScore(city.index_score)}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-muted-foreground">Votes</dt>
            <dd className="mt-1 font-display text-3xl font-bold">{city.vote_count ?? 0}</dd>
          </div>
          <div>
            <dt className="eyebrow text-muted-foreground">Reviews</dt>
            <dd className="mt-1 font-display text-3xl font-bold">{city.review_count ?? 0}</dd>
          </div>
        </dl>
        {city.description ? (
          <p className="mt-6 max-w-2xl text-sm text-muted-foreground">{city.description}</p>
        ) : null}
      </header>

      <section>
        <h2 className="font-display text-2xl font-bold">Biryani houses</h2>
        <div className="mt-5">
          {restaurants.length === 0 ? (
            <EmptyState
              title="No places listed yet"
              description="Biryani houses for this city are still being verified."
            />
          ) : (
            <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-surface/60">
              {restaurants.map((restaurant) => (
                <li key={restaurant.id}>
                  <Link
                    to="/cities/$slug/$restaurantSlug"
                    params={{ slug: city.slug ?? slug, restaurantSlug: restaurant.slug }}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-foreground/5"
                  >
                    <span className="w-10 font-display text-lg font-bold text-primary">
                      {restaurant.stats.rank == null ? "—" : `#${restaurant.stats.rank}`}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{restaurant.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {restaurant.area ?? restaurant.address ?? ""}
                      </span>
                    </span>
                    <span className="text-right text-xs text-muted-foreground">
                      {restaurant.stats.review_count ?? 0} reviews
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold">Community photos</h2>
        <div className="mt-5">
          {photos.length === 0 ? (
            <EmptyState
              title="No photos yet"
              description="Photos appear here as soon as members start posting reviews with pictures."
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
  );
}
