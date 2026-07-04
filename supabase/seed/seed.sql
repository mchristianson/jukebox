insert into tracks (id, provider, title, artist_name, album_art_url, duration_ms, spotify_uri)
values
  ('mock-001', 'mock', 'Friends in Low Places', 'Garth Brooks', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=600&auto=format&fit=crop', 258000, 'spotify:track:mock-001'),
  ('mock-002', 'mock', 'Man! I Feel Like A Woman!', 'Shania Twain', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop', 233000, 'spotify:track:mock-002'),
  ('mock-003', 'mock', 'Mr. Brightside', 'The Killers', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop', 222000, 'spotify:track:mock-003'),
  ('mock-004', 'mock', 'Before He Cheats', 'Carrie Underwood', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600&auto=format&fit=crop', 199000, 'spotify:track:mock-004'),
  ('mock-005', 'mock', 'Sweet Caroline', 'Neil Diamond', 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=600&auto=format&fit=crop', 203000, 'spotify:track:mock-005'),
  ('mock-006', 'mock', 'Tennessee Whiskey', 'Chris Stapleton', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600&auto=format&fit=crop', 293000, 'spotify:track:mock-006'),
  ('mock-007', 'mock', 'Dancing Queen', 'ABBA', 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop', 230000, 'spotify:track:mock-007'),
  ('mock-008', 'mock', 'I Wanna Dance with Somebody', 'Whitney Houston', 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=600&auto=format&fit=crop', 291000, 'spotify:track:mock-008')
on conflict (id) do update set
  title = excluded.title,
  artist_name = excluded.artist_name,
  album_art_url = excluded.album_art_url,
  duration_ms = excluded.duration_ms,
  spotify_uri = excluded.spotify_uri;
