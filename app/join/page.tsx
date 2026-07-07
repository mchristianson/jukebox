"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic } from "lucide-react";
import { joinBarn } from "@/components/api";
import { BrandHeader, Button, Shell } from "@/components/ui";

export default function JoinPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsJoining(true);
    try {
      const { guest } = await joinBarn(displayName);
      localStorage.setItem("barnGuest", JSON.stringify({ id: guest.id, name: guest.display_name }));
      router.push("/queue");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join");
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <Shell className="mx-auto flex max-w-md flex-col justify-center min-h-screen">
      <BrandHeader eyebrow="One shared queue." />
      <section className="mt-4 overflow-hidden rounded-2xl border-2 border-barn-700 shadow-md">
        <div className="bg-barn-500 px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-cream">
          Join the party
        </div>
        <div className="bg-parchment p-5">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#6b5c47]"
                style={{ fontFamily: "var(--font-oswald, sans-serif)" }}
              >
                Your name
              </label>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="h-14 w-full rounded-2xl border-2 border-barn-700/40 bg-white/50 px-4 text-xl font-semibold text-[#2a2320] outline-none placeholder:text-[#2a2320]/30 focus:border-barn-500/70 focus:ring-2 focus:ring-barn-500/20"
                style={{ fontFamily: "var(--font-oswald, sans-serif)" }}
                placeholder="Your name"
                maxLength={32}
                autoFocus
              />
            </div>
            {error ? <p className="rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
            <Button className="w-full" disabled={!displayName.trim() || isJoining}>
              <Mic className="mr-2 h-5 w-5" />
              {isJoining ? "Joining..." : "Join & Request"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-[#6b5c47]" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>
            No account needed. Scan the QR at the bar to join.
          </p>
        </div>
      </section>
    </Shell>
  );
}
