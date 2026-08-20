import { Link } from "@tanstack/react-router";

import type { CityRanking } from "@/lib/types";
import { formatScore, movementState, rankLabel } from "@/lib/format";

export function RankingsTable({ cities }: { cities: CityRanking[] }) {
  return (
    <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-surface/60">
      {cities.map((city) => {
        const movement = movementState(city);
        return (
          <li key={city.id ?? city.slug}>
            <Link
              to="/cities/$slug"
              params={{ slug: city.slug ?? "" }}
              className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-foreground/5"
            >
              <span className="w-12 shrink-0 font-display text-xl font-bold text-primary">
                {rankLabel(city.rank)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-foreground">{city.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {city.state}
                  {city.status === "coming_soon" ? " · Coming soon" : ""}
                </span>
              </span>
              <span className="hidden text-right text-xs text-muted-foreground sm:block">
                <span className="block">{city.vote_count ?? 0} votes</span>
                <span className="block">{city.review_count ?? 0} reviews</span>
              </span>
              <span className="w-16 text-right">
                <span className="block font-display text-lg font-semibold">
                  {formatScore(city.index_score)}
                </span>
                <span
                  className={
                    movement.state === "up"
                      ? "block text-xs text-emerald-400"
                      : movement.state === "down"
                        ? "block text-xs text-rose-400"
                        : "block text-xs text-muted-foreground"
                  }
                >
                  {movement.label}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
