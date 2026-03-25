-- Add role column to members
alter table public.members
  add column role text not null default 'member'
  check (role in ('member', 'admin'));

-- Helper function to check admin status (used in RLS policies)
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.members
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Elections: admins can insert, update, delete
create policy "elections: admins can insert"
  on public.elections for insert
  to authenticated
  with check (public.is_admin());

create policy "elections: admins can update"
  on public.elections for update
  to authenticated
  using (public.is_admin());

create policy "elections: admins can delete"
  on public.elections for delete
  to authenticated
  using (public.is_admin());

-- Positions: admins can insert, update, delete
create policy "positions: admins can insert"
  on public.positions for insert
  to authenticated
  with check (public.is_admin());

create policy "positions: admins can update"
  on public.positions for update
  to authenticated
  using (public.is_admin());

create policy "positions: admins can delete"
  on public.positions for delete
  to authenticated
  using (public.is_admin());

-- Candidates: admins can insert, update, delete
create policy "candidates: admins can insert"
  on public.candidates for insert
  to authenticated
  with check (public.is_admin());

create policy "candidates: admins can update"
  on public.candidates for update
  to authenticated
  using (public.is_admin());

create policy "candidates: admins can delete"
  on public.candidates for delete
  to authenticated
  using (public.is_admin());

-- Members: admins can read all members
drop policy if exists "members: read own record" on public.members;
create policy "members: read own or admin reads all"
  on public.members for select
  using (public.is_admin() or auth.uid() = id);

-- Votes: admins can read all votes (for tallying)
create policy "votes: admins can read all"
  on public.votes for select
  to authenticated
  using (public.is_admin());

-- To promote a user to admin, run this manually in the Supabase SQL editor
-- (do NOT commit emails to version control):
--
--   update public.members set role = 'admin' where email = 'your@email.com';
