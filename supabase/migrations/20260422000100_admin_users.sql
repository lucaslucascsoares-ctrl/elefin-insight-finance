create table if not exists public.admin_users (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

insert into public.admin_users (email)
values ('lucas.lucascsoares@gmail.com')
on conflict (email) do nothing;

alter table public.admin_users enable row level security;

drop policy if exists "Users can view own admin row" on public.admin_users;
create policy "Users can view own admin row"
on public.admin_users for select
to authenticated
using (email = lower(coalesce(auth.jwt() ->> 'email', '')));
