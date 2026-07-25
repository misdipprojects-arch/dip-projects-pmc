-- =====================================================================
-- DIP Projects PMC — additive migration
-- Run this AFTER schema.sql, on the SAME (single, merged) Supabase project.
-- It only ADDS tables/columns — nothing here drops or rewrites anything
-- that TaskFlow already has (users, projects, departments, tasks, leaves,
-- tickets, drawings, task_types, recurring_tasks...).
--
-- Bridging strategy: DIP's frontend code (Clockinout.jsx, Sitereport.jsx,
-- Wprgenerator.jsx, Dpr.jsx, MatRequirement.jsx, Checklists.jsx...) is
-- written entirely around a text `user_name` / `site_name`, not TaskFlow's
-- uuid ids. Rather than rewrite all of that code in one shot, every new
-- table below keys off `username` (references users.username, already
-- unique) and `site_name` (references projects.name, already unique).
-- This lets DIP's pages keep working with minimal query changes while
-- staying relationally tied to the real users/projects tables. Routes can
-- be migrated to uuid-based FKs later without a data model rewrite.
-- =====================================================================

-- ============ 1. Widen users.role + add DIP-style fields ============
-- TaskFlow's users.role is currently constrained to ('admin','employee').
-- DIP's roles are richer strings (Project Head, MIS Head, MIS Executive,
-- Engineer Office, Site Engineer, Site Incharge, Site Coordinator,
-- Junior Estimator, Process Controller, Client) and access.js keys nav
-- visibility off exactly these strings. We drop the tight check and keep
-- 'admin' as the one column both apps agree matters (department_id/role
-- text drives the rest via access.js).
alter table users drop constraint if exists users_role_check;

-- 'office' or 'site' — drives the portal switch requested for users who
-- can see both (e.g. a Project Head toggling between their office tasks
-- and the site-side manpower/report tools).
alter table users add column if not exists portal_default text
  check (portal_default in ('office', 'site')) default 'office';

-- ============ 2. Attendance / Clock in-out ============
-- One row per user per day; clock_in/out_at get filled as the two events
-- happen (matches Clockinout.jsx's select-by-user+date-then-update pattern).
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  username text not null references users(username),
  date date not null default current_date,
  clock_in_at timestamptz,
  clock_in_lat numeric,
  clock_in_lng numeric,
  clock_out_at timestamptz,
  clock_out_lat numeric,
  clock_out_lng numeric,
  site_name text references projects(name),
  created_at timestamptz not null default now(),
  unique (username, date)
);
create index if not exists idx_attendance_username_date on attendance(username, date);

-- ============ 3. Manpower ============
create table if not exists man_type (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  manpowertype text not null,
  scope text,
  created_at timestamptz not null default now(),
  unique (category, manpowertype)
);

create table if not exists workcategory (
  id uuid primary key default gen_random_uuid(),
  category text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists manpower (
  id uuid primary key default gen_random_uuid(),
  site_name text not null references projects(name),
  report_date date not null default current_date,
  category text,
  manpowertype text,
  count int not null default 0,
  logged_by text references users(username),
  created_at timestamptz not null default now()
);
create index if not exists idx_manpower_site_date on manpower(site_name, report_date);

-- ============ 4. Site Visit Reports ============
create table if not exists site_reports (
  id uuid primary key default gen_random_uuid(),
  site_name text not null references projects(name),
  reporter_name text not null,
  visit_date date not null,
  payload jsonb not null default '{}'::jsonb,   -- full form (sections/photos/etc.)
  pdf_url text,
  created_at timestamptz not null default now()
);
create index if not exists idx_site_reports_site_date on site_reports(site_name, visit_date);

-- Autosave drafts (SVR = Site Visit Report), one per reporter+site+date
create table if not exists svr_drafts (
  id uuid primary key default gen_random_uuid(),
  site_name text not null references projects(name),
  reporter_name text not null,
  visit_date date not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (site_name, reporter_name, visit_date)
);

-- ============ 5. WPR (Weekly Progress Report) ============
create table if not exists wpr_reports (
  id uuid primary key default gen_random_uuid(),
  site_name text not null references projects(name),
  engineer_name text not null,
  report_date date not null,
  report_number int,
  payload jsonb not null default '{}'::jsonb,
  pdf_url text,
  created_at timestamptz not null default now()
);
create index if not exists idx_wpr_site_date on wpr_reports(site_name, report_date);

create table if not exists wpr_images (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references wpr_reports(id) on delete cascade,
  url text not null,
  caption text,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

create table if not exists wpr_drafts (
  id uuid primary key default gen_random_uuid(),
  site_name text not null references projects(name),
  engineer_name text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (site_name, engineer_name)
);

-- ============ 6. DPR (Daily Progress Report — morning/evening) ============
create table if not exists dpr_reports (
  id uuid primary key default gen_random_uuid(),
  site text not null references projects(name),
  engineer text not null,
  date date not null,
  report_type text not null check (report_type in ('morning', 'evening')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (site, engineer, date, report_type)
);

create table if not exists dpr_drafts (
  id uuid primary key default gen_random_uuid(),
  site text not null references projects(name),
  engineer text not null,
  report_type text not null check (report_type in ('morning', 'evening')),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (site, engineer, report_type)
);

create table if not exists dpr_equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists dpr_manpower_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  scope text,
  work_category text
);

-- ============ 7. Material Requirements ============
create table if not exists material_requirements (
  id uuid primary key default gen_random_uuid(),
  site_name text not null references projects(name),
  material_name text not null,
  quantity numeric,
  unit_name text,
  requested_by text references users(username),
  status text not null default 'pending' check (status in ('pending', 'received', 'rejected')),
  received_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_matreq_site_status on material_requirements(site_name, status);

-- ============ 8. Checklists ============
create table if not exists checklists (
  id uuid primary key default gen_random_uuid(),
  site_name text references projects(name),
  submitted_by text references users(username),
  title text,
  task_type text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references checklists(id) on delete cascade,
  label text not null,
  is_checked boolean not null default false,
  sort_order int default 0
);

-- Standing per-task-type checkpoint labels shown when filling a checklist
create table if not exists checkpoints (
  id uuid primary key default gen_random_uuid(),
  task_type text not null,
  checkpoint text not null,
  created_at timestamptz not null default now()
);

-- ============ ROW LEVEL SECURITY ============
-- Same rationale as schema.sql: these are only ever hit through the
-- Express backend (service_role key), so RLS is a harmless no-op backstop.
do $$
declare t text;
begin
  for t in select unnest(array[
    'attendance','man_type','workcategory','manpower',
    'site_reports','svr_drafts',
    'wpr_reports','wpr_images','wpr_drafts',
    'dpr_reports','dpr_drafts','dpr_equipment','dpr_manpower_types',
    'material_requirements','checklists','checklist_items','checkpoints'
  ])
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "backend full access" on %I;', t);
    execute format('create policy "backend full access" on %I for all using (true) with check (true);', t);
  end loop;
end $$;
