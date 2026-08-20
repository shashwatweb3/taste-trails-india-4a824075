import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { myVoteQuery } from "@/lib/queries";
import type { CityRanking } from "@/lib/types";

export function VotePanel({ cities }: { cities: CityRanking[] }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const vote = useQuery(myVoteQuery(user?.id));
  const liveCities = cities.filter((city) => city.status === "live");

  useEffect(() => {
    const channel = supabase
      .channel("city-votes-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "city_votes" }, () => {
        queryClient.invalidateQueries({ queryKey: ["rankings"] });
        queryClient.invalidateQueries({ queryKey: ["platform-stats"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const castVote = useMutation({
    mutationFn: async (cityId: string) => {
      if (!user) throw new Error("Sign in to vote");
      const { error: deleteError } = await supabase
        .from("city_votes")
        .delete()
        .eq("user_id", user.id);
      if (deleteError) throw new Error(deleteError.message);
      const { error } = await supabase
        .from("city_votes")
        .insert({ user_id: user.id, city_id: cityId });
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      toast.success("Your national vote is in");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["rankings"] }),
        queryClient.invalidateQueries({ queryKey: ["platform-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["my-vote"] }),
      ]);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section id="vote" className="scroll-mt-24">
      <p className="eyebrow text-muted-foreground">One vote, one city</p>
      <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
        Which city makes India&apos;s best biryani?
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        You hold a single national vote. Change it any time — the index updates immediately.
      </p>

      {!user ? (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-surface/60 p-4">
          <p className="text-sm text-muted-foreground">Sign in to cast your vote.</p>
          <Button asChild size="sm">
            <Link to="/auth">Sign in to vote</Link>
          </Button>
        </div>
      ) : null}

      {liveCities.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">No cities are open for voting yet.</p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {liveCities.map((city) => {
            const isMine = vote.data?.city_id === city.id;
            return (
              <button
                key={city.id}
                type="button"
                disabled={!user || castVote.isPending}
                onClick={() => city.id && castVote.mutate(city.id)}
                className={
                  isMine
                    ? "rounded-xl border border-primary bg-primary/10 p-4 text-left transition-colors"
                    : "rounded-xl border border-border/70 bg-surface/60 p-4 text-left transition-colors hover:border-primary/60 disabled:opacity-60"
                }
              >
                <span className="block font-semibold text-foreground">{city.name}</span>
                <span className="block text-xs text-muted-foreground">{city.state}</span>
                <span className="mt-2 block text-xs text-muted-foreground">
                  {city.vote_count ?? 0} votes
                </span>
                {isMine ? (
                  <span className="mt-2 block text-xs font-semibold text-primary">Your vote</span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
