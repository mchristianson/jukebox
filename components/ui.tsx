import Link from "next/link";
import { Coins, Zap } from "lucide-react";
import type { GuestCredits, QueueRequest, Track } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";

export function Shell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn("min-h-screen px-4 py-5 sm:px-6 lg:px-8", className)}>{children}</main>;
}

export function BrandHeader({ eyebrow }: { eyebrow?: string }) {
  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <Link href="/queue" className="leading-tight">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-neon">{eyebrow ?? "Private Barn"}</p>
        <h1 className="text-3xl font-black text-white">Barn Jukebox</h1>
      </Link>
      <Link href="/display" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white/80">
        QR
      </Link>
    </header>
  );
}

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "music" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide",
        tone === "music" && "bg-neon/15 text-neon",
        tone === "neutral" && "bg-white/10 text-white/70"
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
    "inline-flex min-h-12 items-center justify-center rounded-2xl px-5 py-3 text-base font-black transition disabled:cursor-not-allowed disabled:opacity-50",
    variant === "primary" && "bg-neon text-night hover:bg-white",
    variant === "secondary" && "border border-white/10 bg-white/8 text-white hover:bg-white/14",
    variant === "danger" && "bg-red-500/15 text-red-200 hover:bg-red-500/25",
    disabled && "pointer-events-none cursor-not-allowed opacity-50",
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
    <button
      className={buttonClasses({ variant, className })}
      {...props}
    >
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
    <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-2 text-sm font-black text-yellow-100">
      <Coins className="h-4 w-4 text-yellow-300" />
      <span>{credits.isSuperUser ? "Unlimited" : credits.available}</span>
      {!compact ? <span className="font-bold text-yellow-100/60">credits</span> : null}
    </div>
  );
}

export function TrackRow({ track, action, meta }: { track: Track; action?: React.ReactNode; meta?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
      <img
        src={track.album_art_url ?? "/record.svg"}
        alt=""
        className="h-16 w-16 flex-none rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-black text-white">{track.title}</h3>
        <p className="truncate text-sm font-semibold text-white/60">{track.artist_name}</p>
        <p className="mt-1 text-xs font-bold text-white/40">{meta ?? formatDuration(track.duration_ms)}</p>
      </div>
      {action}
    </div>
  );
}

export function RequestRow({ request, compact = false }: { request: QueueRequest; compact?: boolean }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sm font-black text-white">
        {request.queue_number ?? request.position}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-black text-white">{request.track_title}</h3>
          {request.is_fast_pass ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-neon/15 px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-wide text-neon">
              <Zap className="h-3 w-3" />
              Fast pass
            </span>
          ) : null}
        </div>
        <p className="truncate text-sm font-semibold text-white/60">
          {request.artist_name} requested by {request.guest_name}
        </p>
      </div>
      {!compact && request.album_art_url ? (
        <img src={request.album_art_url} alt="" className="h-12 w-12 rounded-xl object-cover" />
      ) : null}
    </div>
  );
}
