-- Create table for onboarding completions leaderboard
CREATE TABLE IF NOT EXISTS public.onboarding_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completion_time_seconds INTEGER NOT NULL,
  tasks_completed INTEGER NOT NULL,
  total_tasks INTEGER NOT NULL,
  achievement_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.onboarding_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all completions"
  ON public.onboarding_completions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own completion"
  ON public.onboarding_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completion"
  ON public.onboarding_completions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster leaderboard queries
CREATE INDEX idx_onboarding_completions_role_time 
  ON public.onboarding_completions(user_role, completion_time_seconds);

CREATE INDEX idx_onboarding_completions_role_achievements 
  ON public.onboarding_completions(user_role, achievement_count DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_onboarding_completions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_onboarding_completions_updated_at
  BEFORE UPDATE ON public.onboarding_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_completions_updated_at();