"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SkipForward } from "lucide-react";
import { fetchGuestCredits, updateRequestStatus } from "@/components/api";
import { BottomNav, BrandHeader, Button, CreditBadge, NowPlayingCard, Pill, RequestRow, Shell } from "@/components/ui";
import { useQueue } from "@/components/use-queue";

function getGuest() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("barnGuest");
  return raw ? (JSON.parse(raw) as { id: string; name: string }) : null;
}

export default function QueuePage() {
  const { data, isLoading, error } = useQueue();
  const queryClient = useQueryClient();
  const [guest, setGuest] = useState<{ id: string; name: string } | null>(null);
  useEffect(() => setGuest(getGuest()), []);
  const credits = useQuery({
    queryKey: ["credits", guest?.id],
    queryFn: () => fetchGuestCredits(guest!.id),
    enabled: Boolean(guest),
    refetchInterval: 15000
  });
  const skipMutation = useMutation({
    mutationFn: (requestId: string) => {
      if (!guest) throw new Error("Join first before skipping a song.");
      return updateRequestStatus(requestId, "skipped", guest.id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["queue"] });
      void queryClient.invalidateQueries({ queryKey: ["credits", guest?.id] });
    }
  });

  const canSkip = Boolean(credits.data?.credits.isSuperUser || (credits.data?.credits.available ?? 0) >= 2);

  return (
    <Shell className="mx-auto max-w-2xl pb-28">
      <BrandHeader />
      <div className="mb-4 flex justify-end">
        <CreditBadge credits={credits.data?.credits} />
      </div>
      {isLoading ? <p className="rounded-2xl bg-card p-4 font-semibold text-cream/60">Loading the barn queue...</p> : null}
      {error ? <p className="rounded-2xl bg-red-950/40 p-4 font-semibold text-red-300">{error.message}</p> : null}
      {data ? (
        <div className="space-y-5">
          <NowPlayingCard nowPlaying={data.nowPlaying}>
            {guest && data.nowPlaying ? (
              <Button
                variant="secondary"
                className="min-h-10 border-barn-700/60 bg-barn-900 px-4 py-2 text-sm text-cream hover:bg-barn-800"
                disabled={skipMutation.isPending || !canSkip}
                onClick={() => skipMutation.mutate(data.nowPlaying!.id)}
              >
                <SkipForward className="mr-2 h-4 w-4" />
                Skip
                <span className="relative ml-2 inline-flex h-6 w-7 flex-none" aria-hidden="true">
                  <img src="/coin.png" alt="" className="absolute bottom-0 left-0 h-5 w-5 object-contain drop-shadow" />
                  <img src="/coin.png" alt="" className="absolute bottom-1.5 left-1.5 h-5 w-5 object-contain drop-shadow" />
                </span>
                2
              </Button>
            ) : null}
          </NowPlayingCard>

          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-barn-400" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>One shared line</p>
                <h2 className="text-2xl font-bold text-cream" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>{data.queued.length} up next</h2>
              </div>
              {data.settings.requests_locked ? <Pill>Locked</Pill> : null}
            </div>
            <div className="space-y-2">
              {data.queued.length ? data.queued.map((request) => <RequestRow request={request} key={request.id} />) : (
                <div className="rounded-2xl border-2 border-dashed border-night-400/40 p-8 text-center">
                  <p className="text-lg font-bold text-cream" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>The shared queue is wide open.</p>
                  <p className="mt-1 text-sm text-cream/40">Add songs to the live queue.</p>
                </div>
              )}
            </div>
          </section>

          {skipMutation.error ? (
            <p className="rounded-2xl bg-red-950/40 p-3 text-sm font-semibold text-red-300">{skipMutation.error.message}</p>
          ) : null}
        </div>
      ) : null}
      <BottomNav active="queue" />
    </Shell>
  );
}
