
-- Create table for user achievements/badges
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress INTEGER DEFAULT 0,
  max_progress INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for user achievements
CREATE POLICY "Users can view their own achievements" 
  ON public.user_achievements 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
  ON public.user_achievements 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" 
  ON public.user_achievements 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add streak tracking to user profiles
ALTER TABLE public.user_game_history 
ADD COLUMN current_streak INTEGER DEFAULT 0,
ADD COLUMN max_streak INTEGER DEFAULT 0,
ADD COLUMN time_taken INTEGER DEFAULT NULL; -- seconds taken to complete the game

-- Create an index for better performance
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_game_history_user_id ON public.user_game_history(user_id);
