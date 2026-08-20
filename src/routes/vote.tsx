import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/empty-state";
import { VotePanel } from "@/components/vote-panel";
import { rankingsQuery } from "@/lib/queries";

const TITLE = "Cast your national biryani vote | Biryani Index";
const DESC =
  "You get one national vote for the city that makes India's best biryani. Change it any time.";

export const Route = createFileRoute("/vote")({
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
  component: VotePage,
  errorComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <EmptyState title="Voting didn't load" description="Please refresh and try again." />
    </div>
  ),
});

function VotePage() {
  const { data: cities } = useSuspenseQuery(rankingsQuery());
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <VotePanel cities={cities} />
    </div>
  );
}
