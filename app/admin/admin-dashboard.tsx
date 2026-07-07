"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Lock, LogOut, Play, SkipForward, Trash2, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";
import { reorderQueue, updateRequestStatus, updateSettings } from "@/components/api";
import { HostPlaybackController } from "@/components/host-playback-controller";
import { BrandHeader, Button, Pill, RequestRow, Shell } from "@/components/ui";
import { useQueue } from "@/components/use-queue";
import type { QueueRequest } from "@/lib/types";

export function AdminDashboard() {
  const router = useRouter();
  const { data, isLoading, error } = useQueue();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["queue"] });

  const statusMutation = useMutation({ mutationFn: ({ id, status }: { id: string; status: QueueRequest["status"] }) => updateRequestStatus(id, status), onSuccess: refresh });
  const settingsMutation = useMutation({ mutationFn: updateSettings, onSuccess: refresh });
  const reorderMutation = useMutation({ mutationFn: reorderQueue, onSuccess: refresh });
  const logoutMutation = useMutation({
    mutationFn: () => fetch("/api/admin/logout", { method: "POST" }),
    onSuccess: () => router.refresh()
  });

  function move(id: string, direction: -1 | 1) {
    if (!data) return;
    const ids = data.queued.map((request) => request.id);
    const index = ids.indexOf(id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) return;
    const nextIds = [...ids];
    const [item] = nextIds.splice(index, 1);
    nextIds.splice(nextIndex, 0, item);
    reorderMutation.mutate(nextIds);
  }

  const busy = statusMutation.isPending || settingsMutation.isPending || reorderMutation.isPending;

  return (
    <Shell className="mx-auto max-w-6xl">
      <HostPlaybackController />
      <div className="flex items-start justify-between gap-4">
        <BrandHeader eyebrow="Host controls" />
        <Button variant="secondary" className="min-h-10 px-3 py-2" disabled={logoutMutation.isPending} onClick={() => logoutMutation.mutate()}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
      {isLoading ? <p className="rounded-xl bg-amber-950/30 p-4 font-semibold text-cream/60">Loading admin dashboard...</p> : null}
      {error ? <p className="rounded-xl bg-red-900/20 p-4 font-semibold text-red-300">{error.message}</p> : null}
      {statusMutation.error ? <p className="mb-4 rounded-xl bg-red-900/20 p-4 font-semibold text-red-300">{statusMutation.error.message}</p> : null}
      {data ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <section className="space-y-4">
            <div className="rounded-2xl border border-amber-900/35 bg-amber-950/30 p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-barn-400">Playback</p>
                  <h2 className="text-2xl font-bold text-cream">Now playing</h2>
                </div>
                {data.nowPlaying ? <Pill tone="music">Playing</Pill> : <Pill>Idle</Pill>}
              </div>
              {data.nowPlaying ? (
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <RequestRow request={data.nowPlaying} compact />
                  <div className="flex gap-2">
                    <Button variant="secondary" disabled={busy} onClick={() => statusMutation.mutate({ id: data.nowPlaying!.id, status: "played" })}>Done</Button>
                    <Button variant="danger" disabled={busy} onClick={() => statusMutation.mutate({ id: data.nowPlaying!.id, status: "skipped" })}>
                      <SkipForward className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-amber-900/30 p-5 text-center font-semibold text-cream/45">No active song.</p>
              )}
            </div>

            <div>
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-barn-400">Shared queue</p>
                  <h2 className="text-2xl font-bold text-cream">{data.queued.length} waiting in one line</h2>
                </div>
              </div>
              <div className="space-y-3">
                {data.queued.map((request, index) => (
                  <div key={request.id} className="grid gap-2 rounded-xl border border-amber-900/30 bg-amber-950/25 p-3 xl:grid-cols-[1fr_auto]">
                    <RequestRow request={request} />
                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      <Button variant="secondary" disabled={busy || index === 0} onClick={() => move(request.id, -1)}><ArrowUp className="h-5 w-5" /></Button>
                      <Button variant="secondary" disabled={busy || index === data.queued.length - 1} onClick={() => move(request.id, 1)}><ArrowDown className="h-5 w-5" /></Button>
                      <Button disabled={busy} onClick={() => statusMutation.mutate({ id: request.id, status: "playing" })}>
                        <Play className="mr-2 h-5 w-5" />
                        Play
                      </Button>
                      <Button variant="danger" disabled={busy} onClick={() => statusMutation.mutate({ id: request.id, status: "removed" })}><Trash2 className="h-5 w-5" /></Button>
                    </div>
                  </div>
                ))}
                {!data.queued.length ? (
                  <p className="rounded-xl border border-dashed border-amber-900/30 p-8 text-center font-semibold text-cream/45">The request line is empty.</p>
                ) : null}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-amber-900/35 bg-amber-950/30 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-barn-400">Barn switches</p>
              <div className="mt-4 grid gap-3">
                <Button
                  variant={data.settings.requests_locked ? "danger" : "secondary"}
                  disabled={busy}
                  onClick={() => settingsMutation.mutate({ requests_locked: !data.settings.requests_locked })}
                >
                  {data.settings.requests_locked ? <Lock className="mr-2 h-5 w-5" /> : <Unlock className="mr-2 h-5 w-5" />}
                  {data.settings.requests_locked ? "Unlock requests" : "Lock requests"}
                </Button>
                <Button variant="danger" disabled={busy || !data.queued.length} onClick={() => settingsMutation.mutate({ clearQueue: true })}>
                  Clear queued songs
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-amber-900/35 bg-amber-950/30 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-barn-400">Queue count</p>
              <div className="mt-4 rounded-xl bg-black/20 p-3">
                <p className="text-2xl font-bold text-barn-400">{data.queued.length}</p>
                <p className="text-sm font-semibold text-cream/50">songs waiting</p>
              </div>
            </section>
          </aside>
        </div>
      ) : null}
    </Shell>
  );
}
