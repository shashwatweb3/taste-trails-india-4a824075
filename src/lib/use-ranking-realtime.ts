import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

/**
 * Single subscription that keeps every ranking-aware surface in sync:
 * Top 3, map markers, city pages and restaurant lists all read the same
 * queries, so one invalidation updates all of them without a page refresh.
 */
export function useRankingRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["rankings"] });
      queryClient.invalidateQueries({ queryKey: ["platform-stats"] });
      queryClient.invalidateQueries({ queryKey: ["city"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant"] });
    };
    const channel = supabase
      .channel("biryani-index-rankings")
      .on("postgres_changes", { event: "*", schema: "public", table: "city_votes" }, invalidate)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, invalidate)
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
