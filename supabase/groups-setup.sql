-- SafarX Safar Groups — run once in the same Supabase project as the vault.
--
-- Ownership and membership are enforced in the API layer, which verifies a
-- Clerk session token and derives the user id from it. Supabase Auth is not in
-- play, so there is no auth.uid() to write policies against: RLS denies
-- everything by default and only the service role, held server-side in the
-- Vercel function, can read or write. Nothing here is reachable from a browser.

create table if not exists public.groups (
  id            text primary key,
  name          text not null,
  description   text not null default '',
  city          text not null,
  country       text not null default 'India',
  lat           double precision,
  lng           double precision,
  start_date    date,
  end_date      date,
  category      text not null default 'general',
  visibility    text not null default 'public',
  max_members   integer not null default 20,
  seed_members  integer not null default 0,   -- travellers who joined before SafarX
  cover_image   text,
  verified      boolean not null default false,
  created_by    text,
  created_at    timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id    text not null references public.groups(id) on delete cascade,
  user_id     text not null,
  display_name text,
  avatar_url  text,
  role        text not null default 'member',
  joined_at   timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.group_messages (
  id          uuid primary key default gen_random_uuid(),
  group_id    text not null references public.groups(id) on delete cascade,
  user_id     text not null,
  display_name text,
  avatar_url  text,
  body        text not null,
  created_at  timestamptz not null default now()
);

-- Amounts are integer paise. Money in floating point eventually loses a rupee,
-- and a group splitting a bill will notice.
create table if not exists public.group_expenses (
  id          uuid primary key default gen_random_uuid(),
  group_id    text not null references public.groups(id) on delete cascade,
  paid_by     text not null,
  paid_by_name text,
  description text not null,
  amount_paise bigint not null check (amount_paise > 0),
  currency    text not null default 'INR',
  created_at  timestamptz not null default now()
);

create index if not exists group_members_user_idx   on public.group_members (user_id);
create index if not exists group_messages_group_idx on public.group_messages (group_id, created_at desc);
create index if not exists group_expenses_group_idx on public.group_expenses (group_id, created_at desc);
create index if not exists groups_city_idx          on public.groups (city);

alter table public.groups          enable row level security;
alter table public.group_members   enable row level security;
alter table public.group_messages  enable row level security;
alter table public.group_expenses  enable row level security;

-- Curated groups, seeded as real rows so they can be joined, discussed and
-- split like any other. seed_members stands for travellers who signed up
-- before SafarX existed; live joins are counted on top of it.
insert into public.groups
  (id, name, description, city, country, lat, lng, start_date, end_date, category, max_members, seed_members, cover_image, verified)
values
  ('grp_demo_ladakh_winter', 'Ladakh Winter Expedition', 'Join our small-group winter expedition across frozen Ladakh. Chadar-season landscapes, monastery stays in Thiksey, and expert high-altitude guides with all gear provided.', 'Leh', 'India', 34.1526, 77.5771, '2027-01-15', '2027-01-24', 'adventure', 15, 12, 'https://images.unsplash.com/photo-1536295243470-d7cba4efab7b?w=800', true),
  ('grp_demo_rajasthan_retreat', 'Rajasthan Haveli & Food Retreat', 'Experience royal Rajasthan slowly. Heritage haveli stays in Udaipur, laal maas cooking classes, miniature painting workshops, and sunset boat rides on Lake Pichola.', 'Udaipur', 'India', 24.5854, 73.7125, '2026-11-05', '2026-11-12', 'food', 20, 18, 'https://images.unsplash.com/photo-1561312514-1d71b2b7e495?w=800', true),
  ('grp_demo_varanasi_dawn', 'Varanasi Dawn Photography Tour', 'Capture the ghats of Kashi at first light. Private dawn boat charters, evening Ganga aarti shoots, and portrait walks through the old city with a working photojournalist.', 'Varanasi', 'India', 25.3176, 82.9739, '2026-10-20', '2026-10-27', 'photography', 12, 10, 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800', true),
  ('grp_demo_thar_glamping', 'Thar Desert Glamping Safari', 'Luxury camping under Thar desert stars near Jaisalmer. Camel treks through the Sam dunes, Manganiyar folk music by the fire, and golden-hour views of the living fort.', 'Jaisalmer', 'India', 26.9157, 70.9083, '2026-12-10', '2026-12-17', 'adventure', 25, 22, 'https://images.unsplash.com/photo-1564509261027-29e141e2c598?w=800', true),
  ('grp_demo_gulmarg_ski', 'Gulmarg Powder Ski Week', 'Ride the Gulmarg gondola to 3,900 metres and ski the Himalayan powder of the Apharwat bowls. For intermediate and advanced skiers; avalanche gear and guides included.', 'Gulmarg', 'India', 34.0484, 74.3805, '2027-01-20', '2027-01-27', 'sports', 10, 8, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', true),
  ('grp_demo_andaman_dive', 'Andaman Reef Dive Crew', 'Liveaboard diving out of Havelock. Manta cleaning stations, coral gardens at Dixon''s Pinnacle, and PADI certification dives in some of India''s clearest water.', 'Havelock Island', 'India', 11.9762, 92.9615, '2026-11-10', '2026-11-20', 'adventure', 16, 14, 'https://images.unsplash.com/photo-1542429296407-20c78e10f375?w=800', true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  cover_image = excluded.cover_image;
