-- Run once in Supabase -> SQL Editor
alter table public.orders
  add column if not exists courier               text,
  add column if not exists tracking_number       text,
  add column if not exists tracking_url          text,
  add column if not exists shipped_email_sent_at timestamptz;
