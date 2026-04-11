-- Projects: per-user records with input/output URLs.
-- Apply via Supabase CLI (`supabase db push`) or SQL Editor (run full file).

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null
    constraint projects_user_id_not_blank check (char_length(trim(user_id)) > 0),
  input_url text not null
    constraint projects_input_url_not_blank check (char_length(trim(input_url)) > 0),
  output_url text,
  created_at timestamptz not null default now()
);

comment on table public.projects is 'User-scoped project runs; output_url set when processing completes.';
comment on column public.projects.user_id is 'Application user id (e.g. Clerk user id).';
comment on column public.projects.output_url is 'Nullable until an output URL exists.';

create index projects_user_id_created_at_idx
  on public.projects (user_id, created_at desc);

alter table public.projects enable row level security;

-- Secure default: no policies on `anon` — deny all for the publishable key until you add policies
-- or use the service role on the server (bypasses RLS).
--
-- Example when Supabase accepts your auth JWT and `sub` matches `user_id` (e.g. Clerk):
-- create policy "projects_select_own"
--   on public.projects for select to authenticated
--   using ((auth.jwt() ->> 'sub') = user_id);
-- create policy "projects_insert_own"
--   on public.projects for insert to authenticated
--   with check ((auth.jwt() ->> 'sub') = user_id);
-- create policy "projects_update_own"
--   on public.projects for update to authenticated
--   using ((auth.jwt() ->> 'sub') = user_id)
--   with check ((auth.jwt() ->> 'sub') = user_id);
-- create policy "projects_delete_own"
--   on public.projects for delete to authenticated
--   using ((auth.jwt() ->> 'sub') = user_id);
