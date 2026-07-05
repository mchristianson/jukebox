"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Coins, History, ListMusic, Zap } from "lucide-react";
import { createSongRequest, fetchGuestCredits, fetchGuestPlayedTracks, searchTracks } from "@/components/api";
import { BrandHeader, Button, CreditBadge, LinkButton, Shell, TrackRow } from "@/components/ui";
import type { Track } from "@/lib/types";

function getGuest() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("barnGuest");
  return raw ? (JSON.parse(raw) as { id: string; name: string }) : null;
}

export default function SearchPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [toast, setToast] = useState("");
  const guest = useMemo(getGuest, []);
  const search = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchTracks(debouncedQuery),
    enabled: debouncedQuery.trim().length > 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });
  const credits = useQuery({
    queryKey: ["credits", guest?.id],
    queryFn: () => fetchGuestCredits(guest!.id),
    enabled: Boolean(guest)
  });
  const playedTracks = useQuery({
    queryKey: ["played-tracks", guest?.id],
    queryFn: () => fetchGuestPlayedTracks(guest!.id),
    enabled: Boolean(guest)
  });

  const requestSong = useMutation({
    mutationFn: ({ track, fastPass }: { track: Track; fastPass: boolean }) => {
      if (!guest) throw new Error("Join first so we can show your queue position.");
      return createSongRequest({ guestId: guest.id, guestName: guest.name, trackId: track.id, fastPass });
    },
    onSuccess: ({ request }, variables) => {
      setToast(`${request.track_title} ${variables.fastPass ? "fast passed" : "added"} to the queue.`);
      void queryClient.invalidateQueries({ queryKey: ["credits", guest?.id] });
      void queryClient.invalidateQueries({ queryKey: ["queue"] });
      void queryClient.invalidateQueries({ queryKey: ["played-tracks", guest?.id] });
    }
  });

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    const timeout = window.setTimeout(() => setDebouncedQuery(normalizedQuery), 350);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const available = credits.data?.credits.available;
  const canSpend = (cost: number) => credits.data?.credits.isSuperUser || (available ?? 0) >= cost;

  return (
    <Shell className="mx-auto max-w-2xl">
      <BrandHeader eyebrow="One shared queue" />
      {toast ? (
        <div className="fixed left-4 right-4 top-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-neon/25 bg-night/95 p-4 font-black text-white shadow-glow backdrop-blur">
          <CheckCircle2 className="h-5 w-5 flex-none text-neon" />
          <p className="min-w-0 flex-1">{toast}</p>
        </div>
      ) : null}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {!guest ? (
          <div className="rounded-2xl bg-barn-400/15 p-4 font-bold text-barn-50">Join first so your name appears on the request.</div>
        ) : (
          <CreditBadge credits={credits.data?.credits} />
        )}
        <LinkButton href="/queue" variant="secondary" className="min-h-10 px-4 py-2 text-sm">
          <ListMusic className="mr-2 h-4 w-4" />
          View queue
        </LinkButton>
        {credits.error ? <p className="text-sm font-bold text-red-200">{credits.error.message}</p> : null}
      </div>
      <div className="sticky top-0 z-10 -mx-4 border-b border-white/10 bg-night/95 px-4 pb-4 pt-1 backdrop-blur sm:-mx-6 sm:px-6">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-14 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-lg font-bold text-white outline-none ring-neon/50 placeholder:text-white/25 focus:ring-4"
          placeholder="Search Spotify songs"
        />
      </div>
      <div className="mt-5 space-y-3">
        {query.trim().length < 2 ? (
          <>
            {guest ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-barn-400">Your history</p>
                    <h2 className="text-2xl font-black text-white">Previous plays</h2>
                  </div>
                  <History className="h-5 w-5 text-white/40" />
                </div>
                {playedTracks.isLoading ? <p className="rounded-2xl bg-white/10 p-4 font-bold text-white/65">Loading your previous plays...</p> : null}
                {playedTracks.data?.tracks.map((track) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      meta={`${track.playCount} ${track.playCount === 1 ? "play" : "plays"}`}
                      action={
                        <div className="grid min-w-[7.5rem] gap-2">
                          <Button className="min-h-10 px-3 py-2 text-sm" disabled={requestSong.isPending || !guest || !canSpend(1)} onClick={() => requestSong.mutate({ track, fastPass: false })}>
                            <Coins className="mr-1 h-4 w-4" />
                            Add 1
                          </Button>
                          <Button variant="secondary" className="min-h-10 px-3 py-2 text-sm" disabled={requestSong.isPending || !guest || !canSpend(2)} onClick={() => requestSong.mutate({ track, fastPass: true })}>
                            <Zap className="mr-1 h-4 w-4" />
                            Fast 2
                          </Button>
                        </div>
                      }
                    />
                  ))}
                {playedTracks.data && !playedTracks.data.tracks.length ? (
                  <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
                    <p className="text-lg font-black text-white">No previous plays yet.</p>
                    <p className="mt-1 text-sm font-semibold text-white/45">Songs will appear here after they finish playing.</p>
                  </div>
                ) : null}
              </section>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
                <p className="text-lg font-black text-white">Search for a crowd-pleaser.</p>
                <p className="mt-1 text-sm font-semibold text-white/45">Join first to see your previous plays.</p>
              </div>
            )}
            {playedTracks.error ? <p className="rounded-2xl bg-red-500/15 p-4 font-bold text-red-200">{playedTracks.error.message}</p> : null}
          </>
        ) : null}
        {query.trim().length > 1 && query.trim() !== debouncedQuery ? (
          <p className="rounded-2xl bg-white/10 p-4 font-bold text-white/65">Searching...</p>
        ) : null}
        {search.isLoading ? <p className="rounded-2xl bg-white/10 p-4 font-bold text-white/65">Searching...</p> : null}
        {search.error ? <p className="rounded-2xl bg-red-500/15 p-4 font-bold text-red-200">{search.error.message}</p> : null}
        {requestSong.error ? <p className="rounded-2xl bg-red-500/15 p-4 font-bold text-red-200">{requestSong.error.message}</p> : null}
        {search.data?.tracks.map((track) => (
          <TrackRow
            key={track.id}
            track={track}
            action={
              <div className="grid min-w-[7.5rem] gap-2">
                <Button className="min-h-10 px-3 py-2 text-sm" disabled={requestSong.isPending || !guest || !canSpend(1)} onClick={() => requestSong.mutate({ track, fastPass: false })}>
                  <Coins className="mr-1 h-4 w-4" />
                  Add 1
                </Button>
                <Button variant="secondary" className="min-h-10 px-3 py-2 text-sm" disabled={requestSong.isPending || !guest || !canSpend(2)} onClick={() => requestSong.mutate({ track, fastPass: true })}>
                  <Zap className="mr-1 h-4 w-4" />
                  Fast 2
                </Button>
              </div>
            }
          />
        ))}
        {search.data && !search.data.tracks.length ? (
          <p className="rounded-2xl border border-dashed border-white/15 p-6 text-center font-bold text-white/50">No songs found.</p>
        ) : null}
      </div>
    </Shell>
  );
}
