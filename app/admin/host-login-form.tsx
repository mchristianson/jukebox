"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { BrandHeader, Button, Shell } from "@/components/ui";

export function HostLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const json = await response.json();

    setIsSubmitting(false);
    if (!response.ok) {
      setError(json.error ?? "Could not unlock host controls");
      return;
    }

    router.refresh();
  }

  return (
    <Shell className="mx-auto flex max-w-md flex-col justify-center">
      <BrandHeader eyebrow="Host controls" />
      <form onSubmit={onSubmit} className="rounded-2xl border border-amber-900/40 bg-amber-950/30 p-5 shadow-glow">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-barn-700/40 bg-barn-900/40 text-barn-400">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-barn-400">Password</p>
            <h2 className="text-2xl font-bold text-cream">Host only</h2>
          </div>
        </div>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cream/50">
          Host password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="min-h-12 rounded-xl border border-amber-800/40 bg-amber-950/40 px-4 text-base font-semibold normal-case tracking-normal text-cream outline-none transition placeholder:text-cream/25 focus:border-barn-500/60 focus:ring-2 focus:ring-barn-500/25"
            required
          />
        </label>
        {error ? <p className="mt-4 rounded-xl bg-red-900/20 p-3 text-sm font-semibold text-red-300">{error}</p> : null}
        <Button type="submit" className="mt-5 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Checking..." : "Unlock host controls"}
        </Button>
      </form>
    </Shell>
  );
}
