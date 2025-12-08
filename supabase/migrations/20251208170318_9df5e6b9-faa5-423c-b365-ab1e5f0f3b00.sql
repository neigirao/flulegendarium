-- Create challenges table to track sent/received challenges
CREATE TABLE public.user_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenger_name TEXT NOT NULL,
  challenged_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  challenged_name TEXT,
  challenger_score INTEGER NOT NULL,
  challenged_score INTEGER,
  game_mode TEXT NOT NULL DEFAULT 'adaptive',
  difficulty_level TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, expired
  challenge_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days')
);

-- Enable RLS
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- Users can view challenges where they are challenger or challenged
CREATE POLICY "Users can view their own challenges"
ON public.user_challenges
FOR SELECT
USING (
  auth.uid() = challenger_id OR 
  auth.uid() = challenged_id
);

-- Users can create challenges
CREATE POLICY "Authenticated users can create challenges"
ON public.user_challenges
FOR INSERT
WITH CHECK (auth.uid() = challenger_id);

-- Users can update challenges they received (to complete them)
CREATE POLICY "Users can update challenges they received"
ON public.user_challenges
FOR UPDATE
USING (auth.uid() = challenged_id OR auth.uid() = challenger_id);

-- Create index for faster queries
CREATE INDEX idx_user_challenges_challenger ON public.user_challenges(challenger_id);
CREATE INDEX idx_user_challenges_challenged ON public.user_challenges(challenged_id);
CREATE INDEX idx_user_challenges_status ON public.user_challenges(status);