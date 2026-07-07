"use client";

import { X, Zap } from "lucide-react";
import type { Track } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/>
    <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
    <circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
  </svg>
);

const CoinIcon = () => (
  <img src="/coin.png" alt="" aria-hidden="true" className="h-7 w-7 flex-none object-contain drop-shadow-md" />
);

const StackedCoins = () => (
  <span className="relative inline-flex h-8 w-9 flex-none" aria-hidden="true">
    <img src="/coin.png" alt="" className="absolute bottom-0 left-0 h-7 w-7 object-contain drop-shadow-md" />
    <img src="/coin.png" alt="" className="absolute bottom-2 left-2 h-7 w-7 object-contain drop-shadow-md" />
  </span>
);

export function SongModal({
  track,
  onClose,
  onAdd,
  onFastPass,
  canAdd,
  canFastPass,
  isPending
}: {
  track: Track;
  onClose: () => void;
  onAdd: () => void;
  onFastPass: () => void;
  canAdd: boolean;
  canFastPass: boolean;
  isPending: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-3xl"
        style={{ background: "#1a1d20" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-night-400/60" />
        </div>

        <div className="px-6 pb-8 pt-2">
          {/* Album art */}
          <div className="mx-auto mb-5 w-52 overflow-hidden rounded-2xl shadow-lg" style={{ boxShadow: "0 18px 42px rgba(0,0,0,0.55)" }}>
            <img
              src={track.album_art_url ?? "/record.svg"}
              alt=""
              className="aspect-square w-full object-cover"
            />
          </div>

          {/* Track info */}
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-cream" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>
              {track.title}
            </h2>
            <p className="mt-1 text-base font-medium text-cream/70" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>
              {track.artist_name}
            </p>
            <p className="mt-0.5 text-sm text-cream/35">{formatDuration(track.duration_ms)}</p>
          </div>

          {/* Fast Pass button */}
          <button
            disabled={!canFastPass || isPending}
            onClick={() => { onFastPass(); onClose(); }}
            className="mb-3 flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition-opacity disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #d4712f, #c85a24)", boxShadow: "0 4px 0 rgba(95,40,16,0.7)" }}
          >
            <Zap className="h-6 w-6 flex-none text-night-900" fill="currentColor" />
            <div className="flex-1">
              <p className="text-base font-bold text-night-900" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>Fast Pass</p>
              <p className="text-sm font-medium text-night-900/70" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>Play next</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-night-900">2</span>
              <StackedCoins />
            </div>
          </button>

          {/* Queue Song button */}
          <button
            disabled={!canAdd || isPending}
            onClick={() => { onAdd(); onClose(); }}
            className="mb-4 flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-opacity disabled:opacity-40"
            style={{ background: "#f2e3c4", borderColor: "rgba(200,90,36,0.25)", boxShadow: "0 0 0 1px rgba(150,80,20,0.08), 0 4px 0 rgba(0,0,0,0.15)" }}
          >
            <GridIcon />
            <div className="flex-1">
              <p className="text-base font-bold text-[#2a2320]" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>Queue song</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-[#2a2320]">1</span>
              <CoinIcon />
            </div>
          </button>

          <p className="text-center text-xs text-barn-400/70" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>
            Credits deducted from your balance
          </p>
        </div>
      </div>
    </div>
  );
}
