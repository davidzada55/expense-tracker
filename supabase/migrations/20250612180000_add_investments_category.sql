alter table public.expenses drop constraint if exists expenses_category_check;

alter table public.expenses add constraint expenses_category_check check (
  category in (
    'food',
    'transport',
    'housing',
    'health',
    'entertainment',
    'investments',
    'other'
  )
);
