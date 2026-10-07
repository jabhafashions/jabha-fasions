-- Run this once in Supabase -> SQL Editor

create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text unique not null
                        default ('JF' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text), 1, 5))),
  customer_name       text not null,
  phone               text not null,
  email               text not null,
  address_line        text not null,
  city                text not null,
  state               text not null,
  pincode             text not null,
  notes               text,
  items               jsonb not null,            -- snapshot of what was bought, at the price paid
  subtotal            numeric(10,2) not null,
  shipping            numeric(10,2) not null default 0,
  total               numeric(10,2) not null,
  payment_status      text not null default 'pending'
                        check (payment_status in ('pending', 'paid', 'failed')),
  order_status        text not null default 'new'
                        check (order_status in ('new', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  razorpay_order_id   text unique,
  razorpay_payment_id text,
  created_at          timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Only users with the server-managed app_metadata role can read / update orders.
-- There is deliberately NO insert policy: visitors can never write to this
-- table directly. Orders are created by the create-order Edge Function, which
-- uses the service-role key.
create policy "admins read orders"
  on public.orders for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admins update orders"
  on public.orders for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- live updates in the admin Orders tab
alter publication supabase_realtime add table public.orders;
