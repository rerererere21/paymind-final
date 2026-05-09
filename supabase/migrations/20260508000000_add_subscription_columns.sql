-- Add subscription-specific columns to bills table
-- These columns support the subscription management features

ALTER TABLE public.bills
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT NOT NULL DEFAULT 'Monthly',
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS start_date DATE;
