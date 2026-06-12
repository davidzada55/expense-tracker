create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  amount numeric(10, 2) not null check (amount > 0),
  category text not null check (
    category in (
      'food',
      'transport',
      'housing',
      'health',
      'entertainment',
      'investments',
      'other'
    )
  ),
  date date not null,
  note text,
  created_at timestamptz not null default now()
);

create index expenses_date_desc_idx on public.expenses (date desc);

alter table public.expenses enable row level security;

create policy "Allow anonymous select on expenses"
  on public.expenses
  for select
  to anon
  using (true);

create policy "Allow anonymous insert on expenses"
  on public.expenses
  for insert
  to anon
  with check (true);

create policy "Allow anonymous delete on expenses"
  on public.expenses
  for delete
  to anon
  using (true);
