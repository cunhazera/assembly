-- ============================================================
-- Assembly — Church Election App
-- Run this in your Supabase project's SQL editor
-- ============================================================



-- ------------------------------------------------------------
-- Members (linked 1:1 to Supabase Auth users)
-- ------------------------------------------------------------
create table public.members (
  id         uuid references auth.users(id) on delete cascade primary key,
  name       text        not null,
  email      text        not null unique,
  has_voted  boolean     not null default false,
  created_at timestamptz not null default now()
);

alter table public.members enable row level security;

create policy "members: read own record"
  on public.members for select
  using (auth.uid() = id);

create policy "members: update own record"
  on public.members for update
  using (auth.uid() = id);

-- Auto-create a member row when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.members (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- Elections
-- ------------------------------------------------------------
create table public.elections (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  description text,
  active      boolean     not null default false,
  created_at  timestamptz not null default now()
);

alter table public.elections enable row level security;

create policy "elections: authenticated members can read"
  on public.elections for select
  to authenticated
  using (true);

-- ------------------------------------------------------------
-- Positions (Elder, Deacon, etc.)
-- ------------------------------------------------------------
create table public.positions (
  id          uuid        primary key default gen_random_uuid(),
  election_id uuid        not null references public.elections(id) on delete cascade,
  name        text        not null,
  max_votes   int         not null default 1,
  created_at  timestamptz not null default now()
);

alter table public.positions enable row level security;

create policy "positions: authenticated members can read"
  on public.positions for select
  to authenticated
  using (true);

-- ------------------------------------------------------------
-- Candidates
-- ------------------------------------------------------------
create table public.candidates (
  id          uuid        primary key default gen_random_uuid(),
  position_id uuid        not null references public.positions(id) on delete cascade,
  name        text        not null,
  bio         text,
  photo_url   text,
  created_at  timestamptz not null default now()
);

alter table public.candidates enable row level security;

create policy "candidates: authenticated members can read"
  on public.candidates for select
  to authenticated
  using (true);

-- ------------------------------------------------------------
-- Votes (write-only for members — no one can read others' votes)
-- ------------------------------------------------------------
create table public.votes (
  id           uuid        primary key default gen_random_uuid(),
  member_id    uuid        not null references public.members(id) on delete cascade,
  candidate_id uuid        not null references public.candidates(id) on delete cascade,
  election_id  uuid        not null references public.elections(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (member_id, candidate_id, election_id)
);

alter table public.votes enable row level security;

create policy "votes: members can insert own votes"
  on public.votes for insert
  to authenticated
  with check (auth.uid() = member_id);

-- Admins (service role) can read all votes for tallying

-- ============================================================
-- Sample data — remove or edit before going live
-- ============================================================

insert into public.elections (id, title, description, active) values
  (
    '00000000-0000-0000-0000-000000000001',
    'Elder & Deacon Election 2026',
    'Annual election of church officers per BCO standards. All communing members in good standing are eligible to vote.',
    true
  );

insert into public.positions (id, election_id, name, max_votes) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Elder',  3),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'Deacon', 3);

insert into public.candidates (position_id, name, bio) values
  ('00000000-0000-0000-0000-000000000010', 'James Wilson',      'Member since 1998. Sunday school teacher for 12 years.'),
  ('00000000-0000-0000-0000-000000000010', 'Robert Anderson',   'Ordained ruling elder at his previous congregation. Joined us in 2019.'),
  ('00000000-0000-0000-0000-000000000010', 'Thomas Mitchell',   'Faithful in ministry of mercy and men''s discipleship.'),
  ('00000000-0000-0000-0000-000000000010', 'David Thompson',    'Member for 8 years, active in men''s Bible study leadership.'),
  ('00000000-0000-0000-0000-000000000020', 'Michael Brown',     'Coordinates our food pantry ministry since 2020.'),
  ('00000000-0000-0000-0000-000000000020', 'Christopher Davis', 'Has served faithfully in the benevolence fund committee.'),
  ('00000000-0000-0000-0000-000000000020', 'Daniel Martin',     'Volunteer at local mission. Member for 6 years.'),
  ('00000000-0000-0000-0000-000000000020', 'Matthew Johnson',   'Coordinates AV ministry and facilities team.');
