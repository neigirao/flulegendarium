-- Fix insecure RLS policy on public.check_ins that exposed all rows to anonymous users.
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all on check_ins" ON public.check_ins;

CREATE POLICY "Users can read own check-ins"
ON public.check_ins
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-ins"
ON public.check_ins
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-ins"
ON public.check_ins
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own check-ins"
ON public.check_ins
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
