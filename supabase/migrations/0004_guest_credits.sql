alter table guests
  add column if not exists is_super_user boolean not null default false;

alter table requests
  add column if not exists is_fast_pass boolean not null default false,
  add column if not exists credits_spent integer not null default 1;

create table if not exists guest_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  guest_id uuid not null references guests(id) on delete cascade,
  request_id uuid references requests(id) on delete set null,
  action text not null check (action in ('request', 'fast_pass', 'skip')),
  credits integer not null check (credits > 0),
  credit_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists guest_credit_transactions_guest_date_idx
  on guest_credit_transactions(guest_id, credit_date);

alter table guest_credit_transactions enable row level security;

drop policy if exists "public read guest credit transactions" on guest_credit_transactions;
create policy "public read guest credit transactions" on guest_credit_transactions for select using (true);

drop policy if exists "public create guest credit transactions" on guest_credit_transactions;
create policy "public create guest credit transactions" on guest_credit_transactions for insert with check (true);

do $$
begin
  alter publication supabase_realtime add table guests;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table guest_credit_transactions;
exception
  when duplicate_object then null;
end $$;
