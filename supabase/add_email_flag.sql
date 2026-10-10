-- Run once in Supabase -> SQL Editor.
-- Remembers that the confirmation emails for an order were already sent,
-- so the customer never gets the same email twice.
alter table public.orders add column if not exists emails_sent_at timestamptz;
