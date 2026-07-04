"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, Music, Search, SkipForward } from "lucide-react";
import { fetchGuestCredits, updateRequestStatus } from "@/components/api";
import { BrandHeader, Button, CreditBadge, LinkButton, Pill, RequestRow, Shell } from "@/components/ui";
import { useQueue } from "@/components/use-queue";

function getGuest() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("barnGuest");
  return raw ? (JSON.parse(raw) as { id: string; name: string }) : null;
}

export default function QueuePage() {
  const { data, isLoading, error } = useQueue();
  const queryClient = useQueryClient();
  const guest = useMemo(getGuest, []);
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
      {isLoading ? <p className="rounded-2xl bg-white/10 p-4 font-bold text-white/70">Loading the barn queue...</p> : null}
      {error ? <p className="rounded-2xl bg-red-500/15 p-4 font-bold text-red-200">{error.message}</p> : null}
      {data ? (
        <div className="space-y-5">
          <section className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-neon">Now playing</p>
              <Pill tone="music">Music</Pill>
            </div>
            {data.nowPlaying ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr]">
                <img src={data.nowPlaying.album_art_url ?? "/record.svg"} alt="" className="h-24 w-24 rounded-2xl object-cover" />
                <div className="min-w-0">
                  <h2 className="text-2xl font-black text-white">{data.nowPlaying.track_title}</h2>
                  <p className="font-bold text-white/60">{data.nowPlaying.artist_name}</p>
                  <p className="mt-2 text-sm font-bold text-white/40">Requested by {data.nowPlaying.guest_name}</p>
                  {guest ? (
                    <Button
                      variant="danger"
                      className="mt-4 min-h-10 px-4 py-2 text-sm"
                      disabled={skipMutation.isPending || !canSkip}
                      onClick={() => skipMutation.mutate(data.nowPlaying!.id)}
                    >
                      <SkipForward className="mr-2 h-4 w-4" />
                      Skip
                      <Coins className="ml-2 mr-1 h-4 w-4" />
                      2
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-black/20 p-5 text-center">
                <Music className="mx-auto mb-2 h-8 w-8 text-white/35" />
                <p className="font-bold text-white/60">Nothing playing yet.</p>
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-barn-400">One shared line</p>
                <h2 className="text-2xl font-black text-white">{data.queued.length} up next</h2>
              </div>
              {data.settings.requests_locked ? <Pill>Locked</Pill> : null}
            </div>
            <div className="space-y-3">
              {data.queued.length ? data.queued.map((request) => <RequestRow request={request} key={request.id} />) : (
                <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
                  <p className="text-lg font-black text-white">The shared queue is wide open.</p>
                  <p className="mt-1 text-sm font-semibold text-white/45">Add songs to the live queue.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
      <div className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-night/90 p-4 backdrop-blur">
        {skipMutation.error ? <p className="mx-auto mb-3 max-w-2xl rounded-2xl bg-red-500/15 p-3 text-sm font-bold text-red-200">{skipMutation.error.message}</p> : null}
        <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-3">
          <LinkButton href="/search" className="flex-1">
            <Search className="mr-2 h-5 w-5" /> Request song
          </LinkButton>
          <LinkButton href="/admin" variant="secondary">Host</LinkButton>
        </div>
      </div>
    </Shell>
  );
}
