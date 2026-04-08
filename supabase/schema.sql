create extension if not exists pgcrypto;

create table if not exists cases (
  id text primary key,
  slug text unique not null,
  title text not null,
  subtitle text,
  theme text,
  total_budget bigint not null,
  target_patients integer not null,
  target_share integer not null,
  annual_net_price integer not null,
  population_total integer not null,
  patient_universe integer not null
);

create table if not exists variables (
  key text primary key,
  case_id text references cases(id) on delete cascade,
  label text not null,
  description text,
  initial_value integer not null,
  min integer not null,
  max integer not null,
  invert boolean default false
);

create table if not exists actions (
  id text primary key,
  case_id text references cases(id) on delete cascade,
  title text not null,
  category text not null,
  description text,
  rationale text,
  year_from integer not null,
  year_to integer not null,
  ideal_year integer not null,
  cost bigint not null,
  impacts jsonb not null default '{}'::jsonb,
  early_penalty numeric not null,
  late_penalty numeric not null
);

create table if not exists segments_hcp (
  id text primary key,
  case_id text references cases(id) on delete cascade,
  name text not null,
  calls_to_first_rx integer not null,
  share_weight numeric not null,
  description text
);

create table if not exists events (
  id text primary key,
  case_id text references cases(id) on delete cascade,
  title text not null,
  year integer not null,
  probability numeric not null,
  description text,
  impacts jsonb not null default '{}'::jsonb,
  financial_impact bigint,
  narrative_tone text not null
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  case_id text references cases(id) on delete cascade,
  team_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists game_actions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  year integer not null,
  action_id text references actions(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  status text not null default 'draft',
  current_year_unlocked int not null default 2017,
  language text not null default 'es',
  facilitator_name text,
  created_at timestamptz not null default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  team_name text not null,
  access_code text,
  is_active boolean not null default true,
  joined_at timestamptz not null default now()
);

create table if not exists team_year_decisions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  year int not null,
  action_key text not null,
  selected_level text not null,
  calculated_cost numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(session_id, team_id, year, action_key)
);

create table if not exists team_year_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  year int not null,
  recurring_cost numeric not null default 0,
  new_cost numeric not null default 0,
  total_cost numeric not null default 0,
  readiness int not null default 0,
  projected_share numeric not null default 0,
  projected_patients int not null default 0,
  pnl_revenue numeric not null default 0,
  pnl_opex numeric not null default 0,
  pnl_margin numeric not null default 0,
  areas_json jsonb not null default '{}'::jsonb,
  notes_json jsonb not null default '[]'::jsonb,
  hospitals_touched int not null default 0,
  people_activated int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(session_id, team_id, year)
);

create table if not exists session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  year int not null,
  event_key text not null,
  title text not null,
  body text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique(session_id, year, event_key)
);
