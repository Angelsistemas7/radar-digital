-- ============================================================
-- Radar Digital — Database schema (PostgreSQL / Supabase)
-- Run this in the Supabase SQL editor.
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  -- respondent
  company       text not null,
  full_name     text not null,
  role          text not null,
  gender        text not null,
  email         text not null,
  phone         text not null,
  city          text not null,
  country       text not null,
  sector        text not null default 'Otro',
  -- result
  overall_score numeric(4,1) not null,
  level_id      smallint not null,
  dimensions    jsonb not null,   -- [{ dimensionId, score }]
  answers       jsonb not null,   -- { questionId: 0..10 }
  wants_contact boolean,          -- lead: ¿quiere que el equipo lo contacte?
  -- audit (no raw PII beyond the form)
  user_agent    text,
  ip_hash       text
);

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);
create index if not exists submissions_country_idx    on public.submissions (country);
create index if not exists submissions_sector_idx     on public.submissions (sector);
create index if not exists submissions_level_idx      on public.submissions (level_id);

-- If you created the table with an older version of this schema, add the columns:
alter table public.submissions add column if not exists sector text not null default 'Otro';
alter table public.submissions add column if not exists wants_contact boolean;

-- ------------------------------------------------------------
-- Row Level Security: deny all by default.
-- Every read/write goes through the server using the SERVICE ROLE
-- key, which bypasses RLS. The anon/public key has NO access.
-- ------------------------------------------------------------
alter table public.submissions enable row level security;
revoke all on public.submissions from anon, authenticated;
