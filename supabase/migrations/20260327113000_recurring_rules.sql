create table if not exists public.recurring_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount decimal(12,2) not null check (amount > 0),
  category_id uuid references public.categories(id) on delete set null,
  description text,
  starts_at date not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recurring_rules_user_id_idx
  on public.recurring_rules (user_id);

create index if not exists recurring_rules_user_active_idx
  on public.recurring_rules (user_id, active, starts_at);

drop trigger if exists set_recurring_rules_updated_at on public.recurring_rules;
create trigger set_recurring_rules_updated_at
before update on public.recurring_rules
for each row
execute function public.set_updated_at();

alter table public.recurring_rules enable row level security;

drop policy if exists "Users can view own recurring rules" on public.recurring_rules;
create policy "Users can view own recurring rules"
on public.recurring_rules for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own recurring rules" on public.recurring_rules;
create policy "Users can insert own recurring rules"
on public.recurring_rules for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own recurring rules" on public.recurring_rules;
create policy "Users can update own recurring rules"
on public.recurring_rules for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own recurring rules" on public.recurring_rules;
create policy "Users can delete own recurring rules"
on public.recurring_rules for delete
to authenticated
using (auth.uid() = user_id);
