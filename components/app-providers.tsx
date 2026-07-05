"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { advancePlayback } from "@/components/api";

function PlaybackAdvancer() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let isChecking = false;
    const checkPlayback = async () => {
      if (isChecking) return;
      isChecking = true;
      try {
        const result = await advancePlayback();
        if (result.advanced) {
          void queryClient.invalidateQueries({ queryKey: ["queue"] });
          void queryClient.invalidateQueries({ queryKey: ["played-tracks"] });
        }
      } catch (error) {
        console.error("Could not check playback advancement", error);
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

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <PlaybackAdvancer />
      {children}
    </QueryClientProvider>
  );
}
