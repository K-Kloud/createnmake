export interface MakerPayoutSettings {
  id: string;
  maker_id: string;
  commission_rate: number;
  payout_frequency: 'weekly' | 'bi-weekly' | 'monthly';
  minimum_payout_amount: number;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_name?: string;
  bank_routing_number?: string;
  payment_method: 'bank_transfer' | 'paypal' | 'stripe';
  paypal_email?: string;
  stripe_account_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MakerEarning {
  id: string;
  maker_id: string;
  order_id: number;
  order_type: 'artisan' | 'manufacturer';
  order_amount: number;
  commission_rate: number;
  commission_amount: number;
  platform_fee: number;
  referral_bonus: number;
  total_earnings: number;
  status: 'pending' | 'processing' | 'paid' | 'on_hold' | 'cancelled';
  payout_transaction_id?: string;
  order_date: string;
  created_at: string;
  updated_at: string;
}

export interface PayoutTransaction {
  id: string;
  maker_id: string;
  amount: number;
  payment_method: string;
  transaction_reference?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  scheduled_date: string;
  processed_date?: string;
  failure_reason?: string;
  earnings_included: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PayoutSchedule {
  id: string;
  name: string;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  day_of_week?: number;
  day_of_month?: number;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReferralBonus {
  id: string;
  referrer_id: string;
  referred_id: string;
  order_id?: number;
  bonus_type: 'signup' | 'first_order' | 'recurring';
  bonus_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  earnings_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EarningsSummary {
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  total_orders: number;
  average_order_value: number;
  commission_rate: number;
  next_payout_date?: string;
  next_payout_amount?: number;
}
