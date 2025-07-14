-- Register missing AI agents in the ai_agent table
INSERT INTO ai_agent (agent_id, name, description, active) VALUES 
(1, 'AI Content Generation Agent', 'Generates personalized content recommendations, enhances prompts, and analyzes user patterns for better design suggestions', true),
(3, 'AI Customer Support Agent', 'Handles automated customer inquiries, ticket routing, and sentiment analysis for support optimization', true),
(4, 'AI Fraud Detection Agent', 'Monitors transactions and user behavior for suspicious activity, prevents fraudulent actions', true)
ON CONFLICT (agent_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active;