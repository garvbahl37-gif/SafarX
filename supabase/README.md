# SafarX database

Applied to Supabase project `qxtnqszhwqqlxazczsux` on 30 August 2026.

Run in this order — the order matters:

1. `vault-setup.sql`, **table only**. On a project where Storage has never been
   opened, `storage.buckets` does not exist and the bucket insert fails with
   42P01, taking the table with it.
2. Open Storage once in the dashboard, then run the bucket insert at the bottom
   of `vault-setup.sql`.
3. `groups-setup.sql`, which creates the four group tables and seeds the six
   curated groups.

## What the server needs

Set these in Vercel as **server-side** variables. None may take a `VITE_`
prefix: that compiles the value into the JavaScript served to every visitor,
and the service role key bypasses every row-level policy in the project.

| Variable | Where it comes from |
| --- | --- |
| `SUPABASE_URL` | `https://qxtnqszhwqqlxazczsux.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` |
| `CLERK_SECRET_KEY` | Clerk → API keys → Secret key |

## Why there are no RLS policies

RLS is on and no policies exist, so anon and authenticated can do nothing at
all — verified: a read returns `[]` while six rows exist, and a write is
refused with `42501 new row violates row-level security policy`. Supabase Auth
is not in play here, so there is no `auth.uid()` to write policies against;
identity comes from a verified Clerk token in the API layer, and only the
service role reaches the database. Supabase's linter reports this as INFO
`rls_enabled_no_policy`, which is the intended state rather than a finding.
