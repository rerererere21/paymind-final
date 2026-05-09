-- PayMind Full Schema Migration
-- Tables: user_profiles, bills, notifications
-- With RLS, triggers, and mock data

-- ============================================================
-- 1. DROP EXISTING TABLES (clean slate to avoid schema drift)
-- ============================================================
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.bills CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- ============================================================
-- 2. TYPES
-- ============================================================
DROP TYPE IF EXISTS public.bill_status CASCADE;
CREATE TYPE public.bill_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

DROP TYPE IF EXISTS public.bill_category CASCADE;
CREATE TYPE public.bill_category AS ENUM (
  'Housing', 'Utilities', 'Insurance', 'Subscriptions',
  'Healthcare', 'Transportation', 'Education', 'Entertainment',
  'Food', 'Finance', 'Other'
);

DROP TYPE IF EXISTS public.notification_type CASCADE;
CREATE TYPE public.notification_type AS ENUM ('due_soon', 'overdue', 'paid', 'reminder');

-- ============================================================
-- 3. CORE TABLES
-- ============================================================

-- user_profiles (intermediary for auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  renewal_alerts BOOLEAN NOT NULL DEFAULT true,
  weekly_digest BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- bills
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  bill_status public.bill_status NOT NULL DEFAULT 'pending',
  category public.bill_category NOT NULL DEFAULT 'Other',
  notes TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES public.bills(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type public.notification_type NOT NULL DEFAULT 'reminder',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON public.bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON public.bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_status ON public.bills(bill_status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================================
-- 5. FUNCTIONS
-- ============================================================

-- Auto-create user_profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 6. ENABLE RLS
-- ============================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. RLS POLICIES
-- ============================================================

-- user_profiles
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- bills
DROP POLICY IF EXISTS "users_manage_own_bills" ON public.bills;
CREATE POLICY "users_manage_own_bills"
ON public.bills
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- notifications
DROP POLICY IF EXISTS "users_manage_own_notifications" ON public.notifications;
CREATE POLICY "users_manage_own_notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 8. TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bills_updated_at ON public.bills;
CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 9. MOCK DATA
-- ============================================================
DO $$
DECLARE
  demo_uuid UUID := gen_random_uuid();
  bill1_uuid UUID := gen_random_uuid();
  bill2_uuid UUID := gen_random_uuid();
  bill3_uuid UUID := gen_random_uuid();
  bill4_uuid UUID := gen_random_uuid();
  bill5_uuid UUID := gen_random_uuid();
BEGIN
  -- Create demo auth user
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES (
    demo_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'demo@paymind.app', crypt('Demo2026!', gen_salt('bf', 10)), now(), now(), now(),
    jsonb_build_object('full_name', 'Alex Rivera'),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
    false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
  ) ON CONFLICT (id) DO NOTHING;

  -- Create demo bills
  INSERT INTO public.bills (id, user_id, title, amount, due_date, bill_status, category, notes, is_recurring)
  VALUES
    (bill1_uuid, demo_uuid, 'Electricity Bill', 120.00, CURRENT_DATE + INTERVAL '3 days', 'pending', 'Utilities', 'Monthly electricity', true),
    (bill2_uuid, demo_uuid, 'Internet Service', 59.99, CURRENT_DATE + INTERVAL '7 days', 'pending', 'Utilities', 'Fiber broadband', true),
    (bill3_uuid, demo_uuid, 'Rent', 1200.00, CURRENT_DATE + INTERVAL '1 day', 'overdue', 'Housing', 'Monthly rent payment', true),
    (bill4_uuid, demo_uuid, 'Netflix', 15.99, CURRENT_DATE + INTERVAL '14 days', 'pending', 'Subscriptions', null, true),
    (bill5_uuid, demo_uuid, 'Health Insurance', 250.00, CURRENT_DATE - INTERVAL '2 days', 'overdue', 'Insurance', 'Monthly premium', true)
  ON CONFLICT (id) DO NOTHING;

  -- Create demo notifications
  INSERT INTO public.notifications (user_id, bill_id, title, message, notification_type, is_read)
  VALUES
    (demo_uuid, bill3_uuid, 'Bill Overdue', 'Your Rent bill of $1,200.00 is overdue!', 'overdue', false),
    (demo_uuid, bill1_uuid, 'Bill Due Soon', 'Electricity Bill of $120.00 is due in 3 days', 'due_soon', false),
    (demo_uuid, bill5_uuid, 'Bill Overdue', 'Health Insurance of $250.00 is overdue!', 'overdue', false)
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;
