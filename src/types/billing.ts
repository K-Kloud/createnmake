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