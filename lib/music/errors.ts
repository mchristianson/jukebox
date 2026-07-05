export class MusicRateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.name = "MusicRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function getRateLimitRetryAfterSeconds(error: unknown) {
  return error instanceof MusicRateLimitError ? error.retryAfterSeconds : null;
}
