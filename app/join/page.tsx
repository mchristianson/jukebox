"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <Shell className="mx-auto flex max-w-md flex-col">
      <BrandHeader eyebrow="Scan. Sing. Queue." />
      <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-glow">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-barn-400">Guest check-in</p>
        <h2 className="mt-3 text-4xl font-black leading-none text-white">What should we call you?</h2>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="h-14 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-xl font-bold text-white outline-none ring-neon/50 placeholder:text-white/25 focus:ring-4"
            placeholder="Your name"
            maxLength={32}
          />
          {error ? <p className="rounded-2xl bg-red-500/15 p-3 text-sm font-bold text-red-200">{error}</p> : null}
          <Button className="w-full" disabled={!displayName.trim() || isJoining}>
            {isJoining ? "Joining..." : "Join the queue"}
          </Button>
        </form>
      </section>
      <p className="mt-5 text-center text-sm font-semibold text-white/45">
        No account needed. Requests show up for everyone in the barn.
      </p>
    </Shell>
  );
}
