"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CheckCircle2, History } from "lucide-react";
import { createSongRequest, fetchGuestCredits, fetchGuestPlayedTracks, searchTracks } from "@/components/api";
import { BottomNav, BrandHeader, CreditBadge, Shell } from "@/components/ui";
import { SongModal } from "@/components/song-modal";
import type { Track } from "@/lib/types";

function getGuest() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("barnGuest");
  return raw ? (JSON.parse(raw) as { id: string; name: string }) : null;
}

function SongCard({ track, onClick }: { track: Track; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left"
    >
      <div className="overflow-hidden rounded-2xl border-2 border-night-400/40 bg-card shadow-sm transition-all duration-150 group-active:scale-95 group-active:border-barn-700/60">
        <img
          src={track.album_art_url ?? "/record.svg"}
          alt=""
          className="aspect-square w-full object-cover"
        />
      </div>
      <div className="mt-2 px-0.5">
        <p
          className="line-clamp-1 font-semibold text-barn-400 leading-tight"
          style={{ fontFamily: "var(--font-oswald, sans-serif)", fontSize: "1.2rem" }}
        >
          {track.title}
        </p>
        <p
          className="mt-0.5 line-clamp-1 text-cream/45"
          style={{ fontFamily: "var(--font-oswald, sans-serif)", fontSize: "1rem" }}
        >
          {track.artist_name}
        </p>
      </div>
    </button>
  );
}

export default function SearchPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [toast, setToast] = useState("");
  const [selected, setSelected] = useState<Track | null>(null);
  const [coinAnim, setCoinAnim] = useState<{ count: number; key: number } | null>(null);
  const [guest, setGuest] = useState<{ id: string; name: string } | null>(null);
  useEffect(() => setGuest(getGuest()), []);

  const search = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: ({ signal }) => searchTracks(debouncedQuery, signal),
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
    const t = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    const t = window.setTimeout(() => setDebouncedQuery(normalizedQuery), 1000);
    return () => window.clearTimeout(t);
  }, [query]);

  const available = credits.data?.credits.available;
  const canSpend = (cost: number) => credits.data?.credits.isSuperUser || (available ?? 0) >= cost;

  const tracks = debouncedQuery.trim().length > 1 ? (search.data?.tracks ?? []) : [];
  const showHistory = query.trim().length < 2 && guest;

  return (
    <Shell className="mx-auto max-w-2xl pb-28">
      <BrandHeader eyebrow="One shared queue" />

      {toast ? (
        <div className="fixed left-4 right-4 top-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border-2 border-barn-700/40 bg-night-900/95 p-4 font-semibold text-cream shadow-md backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5 flex-none text-barn-400" />
          <p className="min-w-0 flex-1">{toast}</p>
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {!guest ? (
          <div className="rounded-2xl border-2 border-night-400/40 bg-card p-4 font-semibold text-cream/70">
            Join first so your name appears on the request.
          </div>
        ) : (
          <CreditBadge credits={credits.data?.credits} />
        )}
        {credits.error ? <p className="text-sm font-semibold text-red-300">{credits.error.message}</p> : null}
      </div>

      <div className="sticky top-0 z-10 -mx-4 border-b-2 border-night-400/30 bg-night-800/94 px-4 pb-4 pt-1 backdrop-blur-md sm:-mx-6 sm:px-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={(e) => e.target.select()}
          className="h-14 w-full rounded-2xl border-2 border-night-400/50 bg-card px-4 text-base font-semibold text-cream outline-none placeholder:text-cream/30 focus:border-barn-500/70 focus:ring-2 focus:ring-barn-500/20"
          style={{ fontFamily: "var(--font-oswald, sans-serif)" }}
          placeholder="Search Spotify songs…"
        />
      </div>

      <div className="mt-5">
        {/* History grid */}
        {showHistory ? (
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-barn-400" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>Your history</p>
                <h2 className="text-2xl font-bold text-cream" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>Previous plays</h2>
              </div>
              <History className="h-5 w-5 text-cream/30" />
            </div>
            {playedTracks.isLoading ? (
              <p className="rounded-2xl bg-card p-4 font-semibold text-cream/55">Loading your previous plays...</p>
            ) : null}
            {playedTracks.data?.tracks.length ? (
              <div className="grid grid-cols-2 gap-4">
                {playedTracks.data.tracks.map((track) => (
                  <SongCard key={track.id} track={track} onClick={() => setSelected(track)} />
                ))}
              </div>
            ) : null}
            {playedTracks.data && !playedTracks.data.tracks.length ? (
              <div className="rounded-2xl border-2 border-dashed border-night-400/40 p-8 text-center">
                <p className="text-lg font-bold text-cream" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>No previous plays yet.</p>
                <p className="mt-1 text-sm text-cream/40">Songs will appear here after they finish playing.</p>
              </div>
            ) : null}
            {playedTracks.error ? <p className="mt-2 rounded-2xl bg-red-950/40 p-4 font-semibold text-red-300">{playedTracks.error.message}</p> : null}
          </section>
        ) : null}

        {/* No guest, no search */}
        {!showHistory && query.trim().length < 2 ? (
          <div className="rounded-2xl border-2 border-dashed border-night-400/40 p-8 text-center">
            <p className="text-lg font-bold text-cream" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>Search for a crowd-pleaser.</p>
            <p className="mt-1 text-sm text-cream/40">Join first to see your previous plays.</p>
          </div>
        ) : null}

        {/* Searching indicator */}
        {query.trim().length > 1 && query.trim() !== debouncedQuery ? (
          <p className="rounded-2xl bg-card p-4 font-semibold text-cream/55">Searching...</p>
        ) : null}
        {search.isLoading ? <p className="rounded-2xl bg-card p-4 font-semibold text-cream/55">Searching...</p> : null}
        {search.error ? <p className="rounded-2xl bg-red-950/40 p-4 font-semibold text-red-300">{search.error.message}</p> : null}
        {requestSong.error ? <p className="mt-2 rounded-2xl bg-red-950/40 p-4 font-semibold text-red-300">{requestSong.error.message}</p> : null}

        {/* Search results grid */}
        {tracks.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {tracks.map((track) => (
              <SongCard key={track.id} track={track} onClick={() => setSelected(track)} />
            ))}
          </div>
        ) : null}
        {search.data && !search.data.tracks.length ? (
          <p className="rounded-2xl border-2 border-dashed border-night-400/40 p-6 text-center font-semibold text-cream/45">No songs found.</p>
        ) : null}
      </div>

      {/* Song modal */}
      {selected ? (
        <SongModal
          track={selected}
          onClose={() => setSelected(null)}
          onAdd={() => { requestSong.mutate({ track: selected, fastPass: false }); setCoinAnim({ count: 1, key: Date.now() }); }}
          onFastPass={() => { requestSong.mutate({ track: selected, fastPass: true }); setCoinAnim({ count: 2, key: Date.now() }); }}
          canAdd={Boolean(guest) && canSpend(1)}
          canFastPass={Boolean(guest) && canSpend(2)}
          isPending={requestSong.isPending}
        />
      ) : null}

      {coinAnim ? (
        <div key={coinAnim.key} className="pointer-events-none fixed inset-0 z-[100]">
          {Array.from({ length: coinAnim.count }).map((_, i) => (
            <img
              key={i}
              src="/coin.png"
              alt=""
              className="coin-fly absolute bottom-24 left-1/2 h-14 w-14 object-contain"
              style={{
                "--coin-x": coinAnim.count === 1 ? "0px" : i === 0 ? "-28px" : "28px",
                "--coin-spin": i === 0 ? "-15deg" : "15deg",
                animationDelay: `${i * 80}ms`,
              } as React.CSSProperties}
              onAnimationEnd={i === coinAnim.count - 1 ? () => setCoinAnim(null) : undefined}
            />
          ))}
        </div>
      ) : null}

      <BottomNav active="search" />
    </Shell>
  );
}
