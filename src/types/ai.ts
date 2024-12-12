import { Json } from './auth'

export interface AIAgent {
  agent_id: number
  name: string
  description: string | null
  active: boolean | null
  created_at: string
}

export interface AIAgentQuery {
  query_id: number
  agent_id: number
  user_id: string | null
  query_text: string
  query_result: Json | null
  executed_at: string
}