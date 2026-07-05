# Barn Jukebox

Phone-first jukebox queue for one private barn. Guests join with a QR code, request songs, and watch the live queue. The host runs the admin dashboard on a laptop and controls playback order and request locking.

This version is built for Vercel + Supabase:

- Next.js App Router on Vercel
- TypeScript + Tailwind CSS
- TanStack Query for client data/refetching
- Supabase Postgres for persistence
- Supabase Realtime for live queue updates
- Spotify Web API behind a `MusicProvider` interface
- Mock music provider for local testing before Spotify is connected

## Routes

- `/join` guest name entry
- `/queue` guest live queue
- `/search` Spotify/mock song search
- `/request/:id` request confirmation and queue position
- `/admin` host dashboard
- `/display` full-screen QR join page

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project, then copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

3. Fill these values from Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
# Optional for local/private MVP. Add this later if you want server-only writes.
SUPABASE_SERVICE_ROLE_KEY=
MUSIC_PROVIDER=mock
HOST_PASSWORD=change-this-host-password
```

4. Run the database migration in Supabase SQL editor:

```sql
-- paste supabase/migrations/0001_initial_schema.sql
```

If you already ran the first migration before public MVP write policies were added, also run:

```sql
-- paste supabase/migrations/0002_public_mvp_policies.sql
```

If joins fail with `new row violates row-level security policy for table "guests"`, paste and run:

```sql
-- paste supabase/repair_public_mvp_policies.sql
```

5. Add development tracks:

```sql
-- paste supabase/seed/seed.sql
```

6. Start locally:

```bash
npm run dev
```

For phones on the same Wi-Fi, run:

```bash
npm run dev:lan
```

Then open `http://<your-macbook-lan-ip>:3000/display` on the MacBook. The QR code uses the current page host, so guests will join through that same LAN address.

## Spotify Host Setup

Mock mode works immediately. To control Spotify playback:

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Add this redirect URI:

```text
http://127.0.0.1:3000/api/spotify/callback
```

3. Set:

```bash
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/spotify/callback
```

4. Restart the dev server, then visit:

```text
http://localhost:3000/api/spotify/login
```

5. Copy the returned `refresh_token` into:

```bash
SPOTIFY_REFRESH_TOKEN=...
MUSIC_PROVIDER=spotify
# Optional. Starts the next queued track this many milliseconds before the current duration ends.
PLAYBACK_OVERLAP_MS=3000
```

7. Restart the dev server again.
8. Open Spotify on the MacBook or target speaker, start any song manually, and leave that device active.
9. Search from `/search`, add a Spotify track, then press `Play` for that request in `/admin`.

Spotify audio is not streamed by this app. The admin screen sends playback commands to the host's Spotify account and active Spotify Connect device. Spotify's Web API playback control requires a Spotify Premium account and an active device.

## Deploy To Vercel

1. Create a Vercel project from this repo.
2. Add the same environment variables in Vercel Project Settings.
3. Deploy.
4. Set `SPOTIFY_REDIRECT_URI` to your deployed callback URL if using Spotify in production:

```text
https://your-project.vercel.app/api/spotify/callback
```

## MVP Notes

- Guest accounts are intentionally not implemented.
- Host controls at `/admin` require `HOST_PASSWORD`. Add the same environment variable in Vercel before using the dashboard there.
- Public MVP write policies allow guests and the host screen to update the shared queue with the publishable key. Add admin auth before using this outside a private setting.
- Lyrics stay outside the app; use Spotify's lyrics view when needed.
- Supabase Realtime replaces a custom WebSocket server for the Vercel architecture.

## TODO

- Add one-tap "play next" behavior.
- Add local Supabase CLI setup instructions.
- Add Playwright smoke tests for join, search, request, and admin playback.
