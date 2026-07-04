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
