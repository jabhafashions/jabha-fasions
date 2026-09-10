-- Run this once in Supabase: SQL Editor > New query

create table products (
  id text primary key default gen_random_uuid()::text,
  category text not null,
  name text not null,
  price numeric not null default 0,
  description text not null default '',
  variants jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

-- Anyone visiting the site can read the catalogue.
create policy "Public can read products"
  on products for select
  using (true);

-- Only a logged-in admin (see Step 3) can add, edit, or remove products.
create policy "Authenticated users can insert products"
  on products for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update products"
  on products for update
  to authenticated
  using (true);

create policy "Authenticated users can delete products"
  on products for delete
  to authenticated
  using (true);

-- Lets every visitor's browser get live updates when the catalogue changes.
alter publication supabase_realtime add table products;
