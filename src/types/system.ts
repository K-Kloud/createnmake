
import { Json } from './auth'

export interface AuditLog {
  log_id: number
  user_id: string | null
  action: string
  action_details: Json | null
  action_time: string
}

export interface APIKey {
  api_key_id: number
  user_id: string
  api_key: string
  created_at: string
  expires_at: string | null
  status: string | null
}

export interface ActivityMetric {
  metric_id: number
  user_id: string | null
  metric_type: string
  metric_value: number
  recorded_at: string
}
