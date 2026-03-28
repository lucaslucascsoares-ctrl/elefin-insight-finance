create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.projection_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  legacy_local_id text,
  title text not null,
  account_name text not null,
  category_name text not null,
  description text,
  default_amount decimal(12,2) not null check (default_amount > 0),
  category_id uuid references public.categories(id) on delete set null,
  group_type text not null check (group_type in ('essenciais', 'desejos', 'prioridades')),
  source text not null default 'projecao' check (source in ('projecao')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, legacy_local_id)
);

create index if not exists projection_templates_user_id_idx
  on public.projection_templates (user_id);

create index if not exists projection_templates_user_group_idx
  on public.projection_templates (user_id, group_type, is_active);

create table if not exists public.monthly_projection_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid not null references public.projection_templates(id) on delete cascade,
  month integer not null check (month >= 0 and month <= 11),
  year integer not null,
  amount_override decimal(12,2),
  title_override text,
  status text not null default 'predicted' check (status in ('predicted', 'paid', 'ignored', 'edited')),
  paid_transaction_id uuid references public.transactions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, template_id, month, year)
);

create index if not exists monthly_projection_overrides_user_month_idx
  on public.monthly_projection_overrides (user_id, year, month);

create index if not exists monthly_projection_overrides_template_idx
  on public.monthly_projection_overrides (template_id);

drop trigger if exists set_projection_templates_updated_at on public.projection_templates;
create trigger set_projection_templates_updated_at
before update on public.projection_templates
for each row
execute function public.set_updated_at();

drop trigger if exists set_monthly_projection_overrides_updated_at on public.monthly_projection_overrides;
create trigger set_monthly_projection_overrides_updated_at
before update on public.monthly_projection_overrides
for each row
execute function public.set_updated_at();

alter table public.projection_templates enable row level security;
alter table public.monthly_projection_overrides enable row level security;

drop policy if exists "Users can view own projection templates" on public.projection_templates;
create policy "Users can view own projection templates"
on public.projection_templates for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own projection templates" on public.projection_templates;
create policy "Users can insert own projection templates"
on public.projection_templates for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own projection templates" on public.projection_templates;
create policy "Users can update own projection templates"
on public.projection_templates for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own projection templates" on public.projection_templates;
create policy "Users can delete own projection templates"
on public.projection_templates for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can view own monthly projection overrides" on public.monthly_projection_overrides;
create policy "Users can view own monthly projection overrides"
on public.monthly_projection_overrides for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own monthly projection overrides" on public.monthly_projection_overrides;
create policy "Users can insert own monthly projection overrides"
on public.monthly_projection_overrides for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own monthly projection overrides" on public.monthly_projection_overrides;
create policy "Users can update own monthly projection overrides"
on public.monthly_projection_overrides for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own monthly projection overrides" on public.monthly_projection_overrides;
create policy "Users can delete own monthly projection overrides"
on public.monthly_projection_overrides for delete
to authenticated
using (auth.uid() = user_id);
