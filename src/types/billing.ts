
export interface Subscription {
  subscription_id: number
  user_id: string
  plan_name: string
  status: string
  start_date: string
  end_date: string | null
  auto_renew: boolean | null
  created_at: string
}

export interface Payment {
  payment_id: number
  user_id: string
  amount: number
  currency: string | null
  payment_date: string
  payment_status: string
}

export interface CreatorSubscription {
  id: string
  user_id: string
  plan_id: number
  stripe_customer_id?: string
  stripe_subscription_id?: string
  status: string
  current_period_start?: string
  current_period_end?: string
  cancel_at_period_end?: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionPlan {
  id: number
  name: string
  price: number
  currency: string
  monthly_image_limit: number
  description?: string
  features?: string[]
  is_active?: boolean
}

export interface SubscriptionStatus {
  tier: string
  is_active: boolean
  monthly_image_limit: number
  images_generated: number
  current_period_end?: string
  cancel_at_period_end?: boolean
}
