-- ============================================================
-- CraftShare Database Schema
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ───────────────────────────────────────────────────
create type material_type   as enum ('leather', 'metal', 'other');
create type order_status    as enum (
  'pending', 'accepted', 'in_progress', 'shipped', 'delivered', 'cancelled'
);
create type payment_status  as enum ('unpaid', 'paid', 'refunded');
create type listing_status  as enum ('active', 'sold', 'archived');

-- ── profiles ────────────────────────────────────────────────
-- Extends auth.users with display info
create table if not exists profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  username       text unique not null,
  display_name   text,
  avatar_url     text,
  bio            text,
  is_artisan     boolean not null default false,
  stripe_customer_id text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── ideas (C2C listings) ─────────────────────────────────────
create table if not exists ideas (
  id             uuid primary key default uuid_generate_v4(),
  seller_id      uuid not null references profiles(id) on delete cascade,
  title          text not null,
  description    text,
  image_urls     text[] not null default '{}',
  price          numeric(10,2) not null check (price >= 0),
  material       material_type not null,
  tags           text[] not null default '{}',
  status         listing_status not null default 'active',
  view_count     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── orders ──────────────────────────────────────────────────
create table if not exists orders (
  id               uuid primary key default uuid_generate_v4(),
  buyer_id         uuid not null references profiles(id),
  idea_id          uuid references ideas(id),          -- null = custom order
  title            text not null,
  description      text,
  material         material_type not null,
  image_urls       text[] not null default '{}',
  custom_text      text,
  quantity         integer not null default 1 check (quantity > 0),
  unit_price       numeric(10,2) not null check (unit_price >= 0),
  total_price      numeric(10,2) not null check (total_price >= 0),
  status           order_status  not null default 'pending',
  payment_status   payment_status not null default 'unpaid',
  stripe_payment_intent_id text,
  tracking_number  text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── favorites ───────────────────────────────────────────────
create table if not exists favorites (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  idea_id    uuid not null references ideas(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, idea_id)
);

-- ── reviews ─────────────────────────────────────────────────
create table if not exists reviews (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references orders(id) on delete cascade,
  reviewer_id uuid not null references profiles(id),
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (order_id, reviewer_id)
);

-- ── idea_purchases ──────────────────────────────────────────
create table if not exists idea_purchases (
  id              uuid primary key default uuid_generate_v4(),
  buyer_id        uuid not null references profiles(id),
  idea_id         uuid not null references ideas(id),
  amount_paid     numeric(10,2) not null,
  stripe_payment_intent_id text,
  purchased_at    timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles         enable row level security;
alter table ideas             enable row level security;
alter table orders            enable row level security;
alter table favorites         enable row level security;
alter table reviews           enable row level security;
alter table idea_purchases    enable row level security;

-- profiles: anyone can read; owner can update
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- ideas: anyone can read active listings; owner can insert/update
create policy "ideas_select_active" on ideas for select using (status = 'active' or seller_id = auth.uid());
create policy "ideas_insert_own"    on ideas for insert with check (seller_id = auth.uid());
create policy "ideas_update_own"    on ideas for update using (seller_id = auth.uid());
create policy "ideas_delete_own"    on ideas for delete using (seller_id = auth.uid());

-- orders: buyer can see their own orders
create policy "orders_select_own"   on orders for select using (buyer_id = auth.uid());
create policy "orders_insert_own"   on orders for insert with check (buyer_id = auth.uid());
create policy "orders_update_own"   on orders for update using (buyer_id = auth.uid());

-- favorites: owner only
create policy "favorites_select_own" on favorites for select using (user_id = auth.uid());
create policy "favorites_insert_own" on favorites for insert with check (user_id = auth.uid());
create policy "favorites_delete_own" on favorites for delete using (user_id = auth.uid());

-- reviews: public read, owner insert
create policy "reviews_select_all"  on reviews for select using (true);
create policy "reviews_insert_own"  on reviews for insert with check (reviewer_id = auth.uid());

-- idea_purchases: owner only
create policy "purchases_select_own" on idea_purchases for select using (buyer_id = auth.uid());
create policy "purchases_insert_own" on idea_purchases for insert with check (buyer_id = auth.uid());

-- ============================================================
-- Triggers – auto-update updated_at
-- ============================================================
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute procedure handle_updated_at();

create trigger trg_ideas_updated_at
  before update on ideas
  for each row execute procedure handle_updated_at();

create trigger trg_orders_updated_at
  before update on orders
  for each row execute procedure handle_updated_at();

-- ============================================================
-- Storage buckets (run via Supabase dashboard or CLI)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('order-images', 'order-images', false);
-- insert into storage.buckets (id, name, public) values ('idea-images',  'idea-images',  true);
-- insert into storage.buckets (id, name, public) values ('avatars',      'avatars',      true);
