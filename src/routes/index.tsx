import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/empty-state";
import { RankingsTable } from "@/components/rankings-table";
import { Button } from "@/components/ui/button";
import { platformStatsQuery, rankingsQuery } from "@/lib/queries";

const TITLE = "Biryani Index | India's biryani rankings, voted by the people";
const DESC =
  "Vote for the city that makes India's best biryani, review real biryani houses, and watch the national index move in real time.";

export const Route = createFileRoute("/")({
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
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(rankingsQuery()),
      context.queryClient.ensureQueryData(platformStatsQuery()),
    ]);
  },
  component: Home,
  errorComponent: () => (
    <PageShell>
      <EmptyState title="The index didn't load" description="Please refresh and try again." />
    </PageShell>
  ),
});

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">{children}</div>;
}

function Home() {
  const { data: cities } = useSuspenseQuery(rankingsQuery());
  const { data: stats } = useSuspenseQuery(platformStatsQuery());
  const ranked = cities.filter((city) => city.rank != null).slice(0, 10);

  return (
    <div>
      <section className="border-b border-border/70 bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="eyebrow text-primary">India&apos;s national biryani index</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl">
            Which city makes India&apos;s best biryani?
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Every number here comes from a real vote or a real review. No fabricated scores, no
            padded counts. Cities stay unranked until people vote.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/vote">Cast your vote</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/rankings">See the rankings</Link>
            </Button>
          </div>
          <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              ["Votes cast", stats.total_votes ?? 0],
              ["Cities ranked", stats.cities_ranked ?? 0],
              ["Reviews", stats.total_reviews ?? 0],
              ["Live cities", stats.live_cities ?? 0],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <dt className="eyebrow text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-display text-3xl font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <PageShell>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">The national index</h2>
          <Link to="/rankings" className="text-sm text-primary hover:underline">
            Full rankings
          </Link>
        </div>
        <div className="mt-6">
          {ranked.length > 0 ? (
            <RankingsTable cities={ranked} />
          ) : (
            <EmptyState
              title="No city is ranked yet"
              description="The index starts the moment the first vote lands. Be the first to put a city on the board."
              action={
                <Button asChild>
                  <Link to="/vote">Cast the first vote</Link>
                </Button>
              }
            />
          )}
        </div>
      </PageShell>
    </div>
  );
}
