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
      <form onSubmit={onSubmit} className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-glow">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon/15 text-neon">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neon">Password</p>
            <h2 className="text-2xl font-black text-white">Host only</h2>
          </div>
        </div>
        <label className="grid gap-2 text-sm font-black uppercase tracking-[0.16em] text-white/60">
          Host password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="min-h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-base font-bold normal-case tracking-normal text-white outline-none transition focus:border-neon"
            required
          />
        </label>
        {error ? <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm font-bold text-red-200">{error}</p> : null}
        <Button type="submit" className="mt-5 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Checking..." : "Unlock host controls"}
        </Button>
      </form>
    </Shell>
  );
}
