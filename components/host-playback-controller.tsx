"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { advancePlayback } from "@/components/api";

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
        nextCheckAt = Date.now() + 15_000;
        console.error("Could not check host playback advancement", error);
      } finally {
        isChecking = false;
      }
    };

    const interval = window.setInterval(checkPlayback, 1000);
    void checkPlayback();

    return () => window.clearInterval(interval);
  }, [queryClient]);

  return null;
}
