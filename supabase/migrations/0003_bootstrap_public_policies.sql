drop policy if exists "public create sessions" on sessions;
create policy "public create sessions" on sessions for insert with check (true);

drop policy if exists "public create playback" on playback_state;
create policy "public create playback" on playback_state for insert with check (true);

drop policy if exists "public create settings" on app_settings;
create policy "public create settings" on app_settings for insert with check (true);
