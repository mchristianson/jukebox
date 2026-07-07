import Link from "next/link";
import { Music, Search, Zap } from "lucide-react";
import type { GuestCredits, QueueRequest, Track } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";

export function Shell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn("min-h-screen px-4 py-5 sm:px-6 lg:px-8", className)}>{children}</main>;
}

export function BrandHeader({ eyebrow }: { eyebrow?: string }) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <Link href="/queue" className="leading-none">
        <h1
          className="font-display text-5xl uppercase leading-[0.9] text-barn-500"
          style={{ fontFamily: "var(--font-anton, 'Impact', sans-serif)" }}
        >
          Barn<br />Jukebox
        </h1>
        {eyebrow ? (
          <p
            className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-cream"
            style={{ fontFamily: "var(--font-oswald, sans-serif)" }}
          >
            {eyebrow}
          </p>
        ) : null}
      </Link>
      <Link
        href="/display"
        className="mt-1 rounded-xl border-2 border-night-400/60 bg-night-600 px-3 py-2 text-sm font-bold text-cream/60 transition hover:border-barn-700/60 hover:text-cream/90"
        style={{ fontFamily: "var(--font-oswald, sans-serif)" }}
      >
        QR
      </Link>
    </header>
  );
}

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "music" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
        tone === "music" && "border-2 border-barn-500/40 bg-barn-500/15 text-barn-400",
        tone === "neutral" && "border-2 border-night-400/50 bg-night-600 text-cream/55"
      )}
    >
      {children}
    </span>
  );
}

function buttonClasses({
  variant = "primary",
  className,
  disabled
}: {
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  disabled?: boolean;
}) {
  return cn(
    "inline-flex min-h-12 items-center justify-center rounded-2xl border-2 px-5 py-3 text-base font-semibold transition-all duration-100 disabled:cursor-not-allowed disabled:opacity-45",
    variant === "primary" &&
      "border-barn-700 bg-barn-500 text-cream shadow-btn hover:bg-barn-400 active:translate-y-[3px] active:shadow-none",
    variant === "secondary" &&
      "border-night-400/60 bg-night-600 text-cream/80 hover:border-night-400 hover:bg-night-500 hover:text-cream active:translate-y-px",
    variant === "danger" &&
      "border-red-900/50 bg-red-950/40 text-red-300 hover:bg-red-900/50 active:translate-y-px",
    disabled && "pointer-events-none",
    className
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  return (
    <button className={buttonClasses({ variant, className })} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  className,
  variant = "primary",
  disabled = false,
  href
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      className={buttonClasses({ variant, className, disabled })}
    >
      {children}
    </Link>
  );
}

export function CreditBadge({ credits, compact = false }: { credits?: GuestCredits | null; compact?: boolean }) {
  if (!credits) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border-2 border-hay/30 bg-night-600 px-3 py-2 text-sm font-semibold text-hay">
      <img src="/coin.png" alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
      <span>{credits.isSuperUser ? "Unlimited" : credits.available}</span>
      {!compact ? <span className="font-medium text-hay/55">credits</span> : null}
    </div>
  );
}

export function TrackRow({ track, action, meta }: { track: Track; action?: React.ReactNode; meta?: string }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] items-center gap-3 rounded-2xl border-2 border-night-400/40 bg-card p-3 transition-colors hover:border-night-400/70 hover:bg-night-600 sm:grid-cols-[5.5rem_1fr_auto]">
      <img
        src={track.album_art_url ?? "/record.svg"}
        alt=""
        className="h-[5.5rem] w-[5.5rem] rounded-xl object-cover shadow-sm"
      />
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-base font-semibold leading-snug text-barn-400" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>{track.title}</h3>
        <p className="mt-0.5 truncate text-sm text-cream/50" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>{track.artist_name}</p>
        <p className="mt-0.5 text-xs text-cream/35">{meta ?? formatDuration(track.duration_ms)}</p>
      </div>
      {action ? <div className="col-span-2 sm:col-span-1">{action}</div> : null}
    </div>
  );
}

export function RequestRow({ request, compact = false }: { request: QueueRequest; compact?: boolean }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] items-center gap-3 rounded-2xl border-2 border-night-400/40 bg-card p-3 transition-colors hover:border-night-400/70">
      <div className="relative">
        <img
          src={request.album_art_url ?? "/record.svg"}
          alt=""
          className="h-[4.5rem] w-[4.5rem] rounded-xl object-cover shadow-sm"
        />
        <div className="absolute -left-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-lg border-2 border-night-400/60 bg-night-900 text-xs font-bold text-barn-400">
          {request.queue_number ?? request.position}
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="line-clamp-1 text-base font-semibold leading-snug text-barn-400" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>{request.track_title}</h3>
          {request.is_fast_pass ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-barn-500/30 bg-barn-500/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-barn-400">
              <Zap className="h-3 w-3" />
              Fast pass
            </span>
          ) : null}
        </div>
        <p className="truncate text-sm text-cream/45">
          {request.artist_name} · {request.guest_name}
        </p>
      </div>
    </div>
  );
}

/** Cream paper card with burnt-orange "NOW PLAYING" header band — album art is the hero */
export function NowPlayingCard({
  nowPlaying,
  children
}: {
  nowPlaying: QueueRequest | null | undefined;
  children?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border-2 border-barn-700 shadow-lg">
      <div className="bg-barn-500 px-4 py-2.5 text-center text-sm font-bold uppercase tracking-[0.14em] text-cream">
        Now Playing
      </div>
      {nowPlaying ? (
        <>
          {/* Full-width album art — the main focal point */}
          <div className="relative aspect-square w-full bg-night-900">
            <img
              src={nowPlaying.album_art_url ?? "/record.svg"}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Gradient overlay at bottom for text legibility */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h2
                className="line-clamp-2 text-2xl uppercase leading-tight text-white drop-shadow-lg"
                style={{ fontFamily: "var(--font-anton, 'Impact', sans-serif)", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
              >
                {nowPlaying.track_title}
              </h2>
              <p className="mt-0.5 text-sm font-semibold text-white/80 drop-shadow" style={{ fontFamily: "var(--font-oswald, sans-serif)", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                {nowPlaying.artist_name}
              </p>
            </div>
          </div>
          <div className="bg-parchment px-4 py-3">
            <p className="text-base font-semibold text-[#3d2e1e]" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>
              Requested by {nowPlaying.guest_name}
            </p>
            {children ? <div className="mt-3">{children}</div> : null}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 bg-parchment py-12">
          <Music className="h-12 w-12 text-[#6b5c47]" />
          <p className="text-base font-medium text-[#2a2320]" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>
            Nothing playing yet
          </p>
        </div>
      )}
    </section>
  );
}

/** Fixed bottom tab bar */
export function BottomNav({ active }: { active: "queue" | "search" | "admin" }) {
  const tabs = [
    {
      key: "queue" as const,
      label: "Queue",
      href: "/queue",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 6h11M3 12h11M3 18h7" />
          <circle cx="18" cy="16" r="3" /><path d="M21 16V8l-3 1" />
        </svg>
      )
    },
    {
      key: "search" as const,
      label: "Request",
      href: "/search",
      icon: <Search className="h-[22px] w-[22px]" aria-hidden="true" />
    },
    {
      key: "admin" as const,
      label: "Host",
      href: "/admin",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      )
    }
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t-2 border-night-400/30 bg-night-900">
      {tabs.map((tab) => {
        const on = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className="relative flex flex-1 flex-col items-center gap-1.5 px-1 py-3 text-xs font-semibold uppercase tracking-[0.04em] transition-colors"
            style={{
              fontFamily: "var(--font-oswald, sans-serif)",
              color: on ? "#c85a24" : "rgba(242,227,196,0.38)"
            }}
          >
            {on && (
              <span className="absolute left-[25%] right-[25%] top-0 h-[3px] rounded-b-sm bg-barn-500" />
            )}
            {tab.icon}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
