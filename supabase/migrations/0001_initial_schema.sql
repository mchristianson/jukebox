create extension if not exists pgcrypto;

create type request_status as enum ('queued', 'playing', 'played', 'skipped', 'removed');

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Barn Party',
  join_slug text not null unique default 'barn',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists tracks (
  id text primary key,
  provider text not null default 'mock',
  title text not null,
  artist_name text not null,
  album_art_url text,
  duration_ms integer not null,
  spotify_uri text,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  guest_id uuid references guests(id) on delete set null,
  guest_name text not null,
  track_id text not null references tracks(id),
  track_title text not null,
  artist_name text not null,
  album_art_url text,
  duration_ms integer not null,
  spotify_uri text,
  status request_status not null default 'queued',
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists playback_state (
  id integer primary key default 1 check (id = 1),
  session_id uuid references sessions(id) on delete set null,
  current_request_id uuid references requests(id) on delete set null,
  is_playing boolean not null default false,
  provider text not null default 'mock',
  device_name text,
  updated_at timestamptz not null default now()
);

create table if not exists app_settings (
  id integer primary key default 1 check (id = 1),
  session_id uuid references sessions(id) on delete set null,
  requests_locked boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists requests_session_status_position_idx on requests(session_id, status, position);
create index if not exists guests_session_idx on guests(session_id);

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_sessions_updated_at on sessions;
create trigger touch_sessions_updated_at before update on sessions
for each row execute function touch_updated_at();

drop trigger if exists touch_tracks_updated_at on tracks;
create trigger touch_tracks_updated_at before update on tracks
for each row execute function touch_updated_at();

drop trigger if exists touch_requests_updated_at on requests;
create trigger touch_requests_updated_at before update on requests
for each row execute function touch_updated_at();

drop trigger if exists touch_playback_state_updated_at on playback_state;
create trigger touch_playback_state_updated_at before update on playback_state
for each row execute function touch_updated_at();

drop trigger if exists touch_app_settings_updated_at on app_settings;
create trigger touch_app_settings_updated_at before update on app_settings
for each row execute function touch_updated_at();

insert into sessions (name, join_slug)
values ('Barn Party', 'barn')
on conflict (join_slug) do nothing;

insert into app_settings (id, session_id)
select 1, id from sessions where join_slug = 'barn'
on conflict (id) do nothing;

insert into playback_state (id, session_id)
select 1, id from sessions where join_slug = 'barn'
on conflict (id) do nothing;

alter table sessions enable row level security;
alter table guests enable row level security;
alter table tracks enable row level security;
alter table requests enable row level security;
alter table playback_state enable row level security;
alter table app_settings enable row level security;

drop policy if exists "public read sessions" on sessions;
create policy "public read sessions" on sessions for select using (true);

drop policy if exists "public read tracks" on tracks;
create policy "public read tracks" on tracks for select using (true);

drop policy if exists "public read requests" on requests;
create policy "public read requests" on requests for select using (true);

drop policy if exists "public read playback" on playback_state;
create policy "public read playback" on playback_state for select using (true);

drop policy if exists "public read settings" on app_settings;
create policy "public read settings" on app_settings for select using (true);

drop policy if exists "public create sessions" on sessions;
create policy "public create sessions" on sessions for insert with check (true);

drop policy if exists "public create guests" on guests;
create policy "public create guests" on guests for insert with check (true);

drop policy if exists "public upsert tracks" on tracks;
create policy "public upsert tracks" on tracks for insert with check (true);

drop policy if exists "public update tracks" on tracks;
create policy "public update tracks" on tracks for update using (true) with check (true);

drop policy if exists "public create requests" on requests;
create policy "public create requests" on requests for insert with check (true);

drop policy if exists "public update requests" on requests;
create policy "public update requests" on requests for update using (true) with check (true);

drop policy if exists "public update playback" on playback_state;
create policy "public update playback" on playback_state for update using (true) with check (true);

drop policy if exists "public create playback" on playback_state;
create policy "public create playback" on playback_state for insert with check (true);

drop policy if exists "public update settings" on app_settings;
create policy "public update settings" on app_settings for update using (true) with check (true);

drop policy if exists "public create settings" on app_settings;
create policy "public create settings" on app_settings for insert with check (true);

do $$
begin
  alter publication supabase_realtime add table requests;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table playback_state;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table app_settings;
exception
  when duplicate_object then null;
end $$;
