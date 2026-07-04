"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchQueue } from "@/components/api";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export function useQueue() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["queue"],
    queryFn: fetchQueue,
    refetchInterval: 15000
  });

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel("barn-jukebox")
      .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["queue"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "playback_state" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["queue"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["queue"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "guest_credit_transactions" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["queue"] });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
