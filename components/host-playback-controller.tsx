"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { ApiError, advancePlayback } from "@/components/api";

const HOST_ADVANCE_CHECK_INTERVAL_MS = 15_000;

export function HostPlaybackController() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let isChecking = false;
    let nextCheckAt = 0;
    const checkPlayback = async () => {
      if (isChecking || Date.now() < nextCheckAt) return;
      isChecking = true;
      try {
        const result = await advancePlayback();
        if (result.advanced) {
          void queryClient.invalidateQueries({ queryKey: ["queue"] });
          void queryClient.invalidateQueries({ queryKey: ["played-tracks"] });
        }
      } catch (error) {
        const retryAfterMs = error instanceof ApiError && error.retryAfterSeconds ? error.retryAfterSeconds * 1000 : HOST_ADVANCE_CHECK_INTERVAL_MS;
        nextCheckAt = Date.now() + retryAfterMs;
        console.error("Could not check host playback advancement", error);
      } finally {
        isChecking = false;
      }
    };

    const interval = window.setInterval(checkPlayback, HOST_ADVANCE_CHECK_INTERVAL_MS);
    void checkPlayback();

    return () => window.clearInterval(interval);
  }, [queryClient]);

  return null;
}
