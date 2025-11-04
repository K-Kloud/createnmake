-- Maker Payout Settings Table
CREATE TABLE IF NOT EXISTS maker_payout_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 85.00,
  payout_frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (payout_frequency IN ('weekly', 'bi-weekly', 'monthly')),
  minimum_payout_amount NUMERIC(10,2) DEFAULT 50.00,
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_name TEXT,
  bank_routing_number TEXT,
  payment_method TEXT DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'paypal', 'stripe')),
  paypal_email TEXT,
  stripe_account_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(maker_id)
);

-- Maker Earnings Table
CREATE TABLE IF NOT EXISTS maker_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id BIGINT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('artisan', 'manufacturer')),
  order_amount NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL,
  referral_bonus NUMERIC(10,2) DEFAULT 0.00,
  total_earnings NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'on_hold', 'cancelled')),
  payout_transaction_id UUID,
  order_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payout Transactions Table
CREATE TABLE IF NOT EXISTS payout_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_reference TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  scheduled_date TIMESTAMPTZ NOT NULL,
  processed_date TIMESTAMPTZ,
  failure_reason TEXT,
  earnings_included JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payout Schedules Table
CREATE TABLE IF NOT EXISTS payout_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly')),
  day_of_week INTEGER,
  day_of_month INTEGER,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral Bonuses Table
CREATE TABLE IF NOT EXISTS referral_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id BIGINT,
  bonus_type TEXT NOT NULL CHECK (bonus_type IN ('signup', 'first_order', 'recurring')),
  bonus_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  earnings_id UUID REFERENCES maker_earnings(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_maker_earnings_maker_status ON maker_earnings(maker_id, status);
CREATE INDEX idx_maker_earnings_order ON maker_earnings(order_type, order_id);
CREATE INDEX idx_payout_transactions_maker ON payout_transactions(maker_id, status);
CREATE INDEX idx_payout_transactions_scheduled ON payout_transactions(scheduled_date, status);
CREATE INDEX idx_referral_bonuses_referrer ON referral_bonuses(referrer_id, status);

-- Enable RLS
ALTER TABLE maker_payout_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maker_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_bonuses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for maker_payout_settings
CREATE POLICY "Makers can view their own payout settings"
  ON maker_payout_settings FOR SELECT
  USING (auth.uid() = maker_id);

CREATE POLICY "Makers can update their own payout settings"
  ON maker_payout_settings FOR UPDATE
  USING (auth.uid() = maker_id);

CREATE POLICY "Makers can insert their own payout settings"
  ON maker_payout_settings FOR INSERT
  WITH CHECK (auth.uid() = maker_id);

CREATE POLICY "Admins can view all payout settings"
  ON maker_payout_settings FOR SELECT
  USING (public.is_admin_user());

CREATE POLICY "Admins can update all payout settings"
  ON maker_payout_settings FOR UPDATE
  USING (public.is_admin_user());

-- RLS Policies for maker_earnings
CREATE POLICY "Makers can view their own earnings"
  ON maker_earnings FOR SELECT
  USING (auth.uid() = maker_id);

CREATE POLICY "Admins can view all earnings"
  ON maker_earnings FOR SELECT
  USING (public.is_admin_user());

CREATE POLICY "System can insert earnings"
  ON maker_earnings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update earnings"
  ON maker_earnings FOR UPDATE
  USING (public.is_admin_user());

-- RLS Policies for payout_transactions
CREATE POLICY "Makers can view their own payout transactions"
  ON payout_transactions FOR SELECT
  USING (auth.uid() = maker_id);

CREATE POLICY "Admins can view all payout transactions"
  ON payout_transactions FOR SELECT
  USING (public.is_admin_user());

CREATE POLICY "System can insert payout transactions"
  ON payout_transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update payout transactions"
  ON payout_transactions FOR UPDATE
  USING (public.is_admin_user());

-- RLS Policies for payout_schedules
CREATE POLICY "Admins can manage payout schedules"
  ON payout_schedules FOR ALL
  USING (public.is_admin_user());

-- RLS Policies for referral_bonuses
CREATE POLICY "Users can view their own referral bonuses"
  ON referral_bonuses FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Admins can view all referral bonuses"
  ON referral_bonuses FOR SELECT
  USING (public.is_admin_user());

CREATE POLICY "System can insert referral bonuses"
  ON referral_bonuses FOR INSERT
  WITH CHECK (true);

-- Function to calculate maker earnings from order
CREATE OR REPLACE FUNCTION calculate_maker_earnings(
  p_maker_id UUID,
  p_order_id BIGINT,
  p_order_type TEXT,
  p_order_amount NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_commission_rate NUMERIC;
  v_commission_amount NUMERIC;
  v_platform_fee NUMERIC;
  v_referral_bonus NUMERIC := 0;
  v_total_earnings NUMERIC;
  v_earnings_id UUID;
BEGIN
  SELECT commission_rate INTO v_commission_rate
  FROM maker_payout_settings
  WHERE maker_id = p_maker_id;
  
  IF v_commission_rate IS NULL THEN
    v_commission_rate := 85.00;
  END IF;
  
  v_commission_amount := (p_order_amount * v_commission_rate / 100);
  v_platform_fee := p_order_amount - v_commission_amount;
  
  SELECT COALESCE(SUM(bonus_amount), 0) INTO v_referral_bonus
  FROM referral_bonuses
  WHERE referred_id = p_maker_id 
    AND order_id = p_order_id
    AND status = 'pending';
  
  v_total_earnings := v_commission_amount + v_referral_bonus;
  
  INSERT INTO maker_earnings (
    maker_id, order_id, order_type, order_amount,
    commission_rate, commission_amount, platform_fee,
    referral_bonus, total_earnings, status, order_date
  ) VALUES (
    p_maker_id, p_order_id, p_order_type, p_order_amount,
    v_commission_rate, v_commission_amount, v_platform_fee,
    v_referral_bonus, v_total_earnings, 'pending', NOW()
  )
  RETURNING id INTO v_earnings_id;
  
  UPDATE referral_bonuses
  SET earnings_id = v_earnings_id
  WHERE referred_id = p_maker_id 
    AND order_id = p_order_id
    AND status = 'pending';
  
  RETURN v_earnings_id;
END;
$$;

-- Function to process pending payouts for a maker
CREATE OR REPLACE FUNCTION process_maker_payout(p_maker_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_amount NUMERIC;
  v_min_amount NUMERIC;
  v_payment_method TEXT;
  v_payout_id UUID;
  v_earning_ids JSONB;
BEGIN
  SELECT minimum_payout_amount, payment_method
  INTO v_min_amount, v_payment_method
  FROM maker_payout_settings
  WHERE maker_id = p_maker_id AND is_active = true;
  
  SELECT COALESCE(SUM(total_earnings), 0), jsonb_agg(id)
  INTO v_total_amount, v_earning_ids
  FROM maker_earnings
  WHERE maker_id = p_maker_id AND status = 'pending';
  
  IF v_total_amount < COALESCE(v_min_amount, 50) THEN
    RETURN NULL;
  END IF;
  
  INSERT INTO payout_transactions (
    maker_id, amount, payment_method, status,
    scheduled_date, earnings_included
  ) VALUES (
    p_maker_id, v_total_amount,
    COALESCE(v_payment_method, 'bank_transfer'),
    'pending', NOW() + INTERVAL '3 days',
    COALESCE(v_earning_ids, '[]'::jsonb)
  )
  RETURNING id INTO v_payout_id;
  
  UPDATE maker_earnings
  SET status = 'processing', payout_transaction_id = v_payout_id
  WHERE maker_id = p_maker_id AND status = 'pending';
  
  RETURN v_payout_id;
END;
$$;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_payout_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_maker_payout_settings_updated_at
  BEFORE UPDATE ON maker_payout_settings
  FOR EACH ROW EXECUTE FUNCTION update_payout_updated_at();

CREATE TRIGGER update_maker_earnings_updated_at
  BEFORE UPDATE ON maker_earnings
  FOR EACH ROW EXECUTE FUNCTION update_payout_updated_at();

CREATE TRIGGER update_payout_transactions_updated_at
  BEFORE UPDATE ON payout_transactions
  FOR EACH ROW EXECUTE FUNCTION update_payout_updated_at();

-- Insert default payout schedule
INSERT INTO payout_schedules (name, frequency, day_of_week, is_active, next_run_at)
VALUES 
  ('Weekly Payouts - Monday', 'weekly', 1, true, date_trunc('week', NOW()) + INTERVAL '1 week' + INTERVAL '1 day'),
  ('Bi-weekly Payouts', 'bi-weekly', 5, false, date_trunc('week', NOW()) + INTERVAL '2 weeks' + INTERVAL '5 days');