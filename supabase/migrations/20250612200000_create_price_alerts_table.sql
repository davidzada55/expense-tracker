create table public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  target_price numeric(10, 2) not null check (target_price > 0),
  direction text not null check (direction in ('above', 'below')),
  triggered boolean not null default false,
  triggered_at timestamptz,
  created_at timestamptz default now()
);

alter table public.price_alerts enable row level security;

create policy "anon access"
  on public.price_alerts
  for all
  to anon
  using (true);
