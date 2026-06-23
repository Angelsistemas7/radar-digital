-- Radar Digital — PostgreSQL schema (sin Supabase)
-- Se ejecuta automáticamente al iniciar el contenedor la primera vez.

create extension if not exists "pgcrypto";

create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  company       text not null,
  full_name     text not null,
  role          text not null,
  gender        text not null,
  email         text not null,
  phone         text not null,
  city          text not null,
  country       text not null,
  sector        text not null default 'Otro',
  overall_score numeric(4,1) not null,
  level_id      smallint not null,
  dimensions    jsonb not null,
  answers       jsonb not null,
  wants_contact boolean,
  user_agent    text,
  ip_hash       text
);

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);
create index if not exists submissions_country_idx    on public.submissions (country);
create index if not exists submissions_sector_idx     on public.submissions (sector);
create index if not exists submissions_level_idx      on public.submissions (level_id);
