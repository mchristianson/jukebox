"use client";

import { CheckCircle2 } from "lucide-react";
import { BrandHeader, LinkButton, RequestRow, Shell } from "@/components/ui";
import { useQueue } from "@/components/use-queue";

export function RequestConfirmation({ id }: { id: string }) {
  const { data, isLoading } = useQueue();
  const request = data?.queued.find((item) => item.id === id) ?? (data?.nowPlaying?.id === id ? data.nowPlaying : null);

  return (
    <Shell className="mx-auto max-w-md">
      <BrandHeader eyebrow="You are in" />
      <section className="rounded-2xl border border-amber-900/40 bg-amber-950/30 p-5 text-center shadow-glow">
        <CheckCircle2 className="mx-auto h-14 w-14 text-barn-400" />
        <h2 className="mt-4 text-3xl font-bold text-cream">Request received</h2>
        {isLoading ? <p className="mt-3 font-semibold text-cream/50">Finding your spot...</p> : null}
        {request ? (
          <div className="mt-5 text-left">
            <RequestRow request={request} compact />
            <p className="mt-4 text-center text-lg font-bold text-cream">
              {request.status === "playing" ? "You are up now." : `You are #${request.queue_number ?? request.position} in line.`}
            </p>
          </div>
        ) : (
          <p className="mt-3 font-semibold text-cream/50">Your request may already have been played or moved.</p>
        )}
        <div className="mt-6 grid gap-3">
          <LinkButton href="/queue" className="w-full">Back to queue</LinkButton>
          <LinkButton href="/search" variant="secondary" className="w-full">
            Request another
          </LinkButton>
        </div>
      </section>
    </Shell>
  );
}
