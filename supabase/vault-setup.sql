-- SafarX document vault — run once in a new Supabase project's SQL editor.
--
-- Ownership is enforced in the API layer, which verifies a Clerk session token
-- and derives the user id from it. Supabase Auth is not in play here, so there
-- is no auth.uid() to write policies against: RLS below denies everything by
-- default, and only the service role (held server-side, in the Vercel
-- functions) can read or write. Nothing reaches this table from a browser.

create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  name        text not null,
  type        text not null default 'Other',
  path        text not null unique,
  size        bigint not null default 0,
  uploaded_at timestamptz not null default now()
);

create index if not exists documents_user_id_idx on public.documents (user_id, uploaded_at desc);

-- No policies are created, so with RLS on, anon and authenticated can do
-- nothing at all. The service role bypasses RLS by design.
alter table public.documents enable row level security;

-- Private bucket. Files are only ever handed out as short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('vault', 'vault', false)
on conflict (id) do update set public = false;
