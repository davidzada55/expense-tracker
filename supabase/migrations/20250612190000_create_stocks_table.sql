create table public.stocks (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  name text not null,
  quantity numeric(10, 4) not null check (quantity > 0),
  purchase_price numeric(10, 2) not null check (purchase_price > 0),
  purchase_date date not null,
  created_at timestamptz default now()
);

alter table public.stocks enable row level security;

create policy "anon access"
  on public.stocks
  for all
  to anon
  using (true);
