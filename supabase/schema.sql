create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  archetype text not null check (archetype in ('explorer', 'stoic', 'builder')),
  theme text not null check (theme in ('obsidian', 'aurora', 'ivory')),
  token_balance integer not null default 0,
  started_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists atom_actions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  title text not null,
  rewardable boolean not null default true,
  reward_token integer not null default 10,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists version_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  atom_action_id uuid not null references atom_actions(id) on delete cascade,
  state text not null check (state in ('changed', 'maintained', 'repeated')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists social_impact_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  engagement_score numeric,
  consistency_score numeric,
  recovery_index numeric,
  captured_at timestamptz not null default now()
);

create index if not exists idx_challenges_user_id on challenges(user_id);
create index if not exists idx_atom_actions_challenge_id on atom_actions(challenge_id);
create index if not exists idx_version_history_user_id on version_history(user_id);
create index if not exists idx_social_impact_user_id on social_impact_data(user_id);

create table if not exists app_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_app_snapshots_updated_at on app_snapshots(updated_at desc);

alter table app_snapshots enable row level security;

drop policy if exists "snapshot_select_own" on app_snapshots;
create policy "snapshot_select_own"
on app_snapshots
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "snapshot_insert_own" on app_snapshots;
create policy "snapshot_insert_own"
on app_snapshots
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "snapshot_update_own" on app_snapshots;
create policy "snapshot_update_own"
on app_snapshots
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
