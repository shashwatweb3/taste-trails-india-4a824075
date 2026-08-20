import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/empty-state";
import { RankingsTable } from "@/components/rankings-table";
import { VotePanel } from "@/components/vote-panel";
import { Button } from "@/components/ui/button";
import { rankingsQuery } from "@/lib/queries";

const TITLE = "National biryani rankings | Biryani Index";
const DESC =
  "The live city-vs-city biryani ranking for India, built from real community votes and reviews.";

export const Route = createFileRoute("/rankings")({
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
  component: Rankings,
  errorComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <EmptyState title="Rankings didn't load" description="Please refresh and try again." />
    </div>
  ),
});

function Rankings() {
  const { data: cities } = useSuspenseQuery(rankingsQuery());
  const ranked = cities.filter((city) => city.rank != null);
  const unranked = cities.filter((city) => city.rank == null);

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6">
      <header>
        <p className="eyebrow text-primary">City vs city</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">National rankings</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Cities are ordered by a confidence-adjusted score. A city with zero votes stays unranked.
        </p>
      </header>

      {ranked.length > 0 ? (
        <RankingsTable cities={ranked} />
      ) : (
        <EmptyState
          title="Nothing ranked yet"
          description="No votes have been cast, so no city is ranked. Your vote can open the index."
          action={
            <Button asChild>
              <Link to="/rankings" hash="vote">
                Vote now
              </Link>
            </Button>
          }
        />
      )}

      <VotePanel cities={cities} />

      {unranked.length > 0 ? (
        <section>
          <h2 className="font-display text-xl font-semibold">Unranked cities</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These cities have no votes yet, or aren&apos;t open for voting.
          </p>
          <div className="mt-4">
            <RankingsTable cities={unranked} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
