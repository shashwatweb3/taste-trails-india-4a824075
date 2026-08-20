import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/empty-state";
import { formatScore, rankLabel } from "@/lib/format";
import { rankingsQuery } from "@/lib/queries";

const TITLE = "Biryani cities of India | Biryani Index";
const DESC =
  "Every city in the Biryani Index — live for voting and reviews, or coming soon. Explore scores, votes and biryani houses.";

export const Route = createFileRoute("/cities/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(rankingsQuery()),
  component: CitiesPage,
  errorComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <EmptyState title="Cities didn't load" description="Please refresh and try again." />
    </div>
  ),
});

function CitiesPage() {
  const { data: cities } = useSuspenseQuery(rankingsQuery());
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-5xl">Cities</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        The index launches city by city. Live cities are open for votes and reviews.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => (
          <Link
            key={city.id ?? city.slug}
            to="/cities/$slug"
            params={{ slug: city.slug ?? "" }}
            className="rounded-xl border border-border/70 bg-surface/60 p-5 transition-colors hover:border-primary/60"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-xl font-semibold">{city.name}</span>
              <span className="text-sm text-primary">{rankLabel(city.rank)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{city.state}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              {city.status === "live" ? "Live" : "Coming soon"} · {city.vote_count ?? 0} votes ·
              score {formatScore(city.index_score)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
