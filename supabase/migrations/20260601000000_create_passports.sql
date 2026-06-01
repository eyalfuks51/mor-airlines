create table passports (
  id          uuid primary key,
  data        jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);

alter table passports enable row level security;

create policy "anon_select" on passports for select using (true);
create policy "anon_insert" on passports for insert with check (true);
create policy "anon_update" on passports for update using (true);
