-- Run this in the Supabase SQL editor if the private MVP is using
-- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY without SUPABASE_SERVICE_ROLE_KEY.
--
-- It allows the local/private jukebox app to bootstrap the default session,
-- add guests and requests, update queue state, and receive realtime reads.
-- Add admin auth before using this outside a private barn/preview setting.

alter table sessions enable row level security;
alter table guests enable row level security;
alter table tracks enable row level security;
alter table requests enable row level security;
alter table playback_state enable row level security;
alter table app_settings enable row level security;

drop policy if exists "public read sessions" on sessions;
create policy "public read sessions" on sessions for select using (true);

drop policy if exists "public create sessions" on sessions;
create policy "public create sessions" on sessions for insert with check (true);

drop policy if exists "public read guests" on guests;
create policy "public read guests" on guests for select using (true);

drop policy if exists "public create guests" on guests;
create policy "public create guests" on guests for insert with check (true);

drop policy if exists "public read tracks" on tracks;
create policy "public read tracks" on tracks for select using (true);

drop policy if exists "public create tracks" on tracks;
create policy "public create tracks" on tracks for insert with check (true);

drop policy if exists "public update tracks" on tracks;
create policy "public update tracks" on tracks for update using (true) with check (true);

drop policy if exists "public read requests" on requests;
create policy "public read requests" on requests for select using (true);

drop policy if exists "public create requests" on requests;
create policy "public create requests" on requests for insert with check (true);

drop policy if exists "public update requests" on requests;
create policy "public update requests" on requests for update using (true) with check (true);

drop policy if exists "public read playback" on playback_state;
create policy "public read playback" on playback_state for select using (true);

drop policy if exists "public create playback" on playback_state;
create policy "public create playback" on playback_state for insert with check (true);

drop policy if exists "public update playback" on playback_state;
create policy "public update playback" on playback_state for update using (true) with check (true);

drop policy if exists "public read settings" on app_settings;
create policy "public read settings" on app_settings for select using (true);

drop policy if exists "public create settings" on app_settings;
create policy "public create settings" on app_settings for insert with check (true);

drop policy if exists "public update settings" on app_settings;
create policy "public update settings" on app_settings for update using (true) with check (true);

insert into sessions (name, join_slug)
values ('Barn Party', 'barn')
on conflict (join_slug) do nothing;

insert into app_settings (id, session_id)
select 1, id from sessions where join_slug = 'barn'
on conflict (id) do nothing;

insert into playback_state (id, session_id)
select 1, id from sessions where join_slug = 'barn'
on conflict (id) do nothing;
