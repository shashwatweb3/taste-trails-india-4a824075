import type { CityRanking } from "./types";

export function formatScore(score: number | null | undefined): string {
  if (score == null) return "—";
  return Number(score).toFixed(1);
}

export function rankLabel(rank: number | null | undefined): string {
  return rank == null ? "Unranked" : `#${rank}`;
}

export type MovementState = "new" | "up" | "down" | "stable" | "none";

export function movementState(city: Pick<CityRanking, "rank" | "previous_rank" | "rank_movement">): {
  state: MovementState;
  label: string;
} {
  if (city.rank == null) return { state: "none", label: "—" };
  if (city.previous_rank == null) return { state: "new", label: "NEW" };
  const delta = city.rank_movement ?? 0;
  if (delta > 0) return { state: "up", label: `↑ ${delta}` };
  if (delta < 0) return { state: "down", label: `↓ ${Math.abs(delta)}` };
  return { state: "stable", label: "—" };
}

export function plural(count: number, singular: string, pluralForm?: string): string {
  return `${count} ${count === 1 ? singular : (pluralForm ?? `${singular}s`)}`;
}

export function photoUrl(path: string): string {
  return `${import.meta.env["VITE_SUPABASE_URL"]}/storage/v1/object/public/biryani-photos/${path}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}