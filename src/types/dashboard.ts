import { Json } from './auth'

export interface DashboardSettings {
  setting_id: number
  user_id: string
  layout: Json | null
  widgets: Json | null
  theme: string | null
}