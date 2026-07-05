alter table guests add column if not exists device_id uuid;

create unique index if not exists guests_session_device_idx
  on guests(session_id, device_id)
  where device_id is not null;
