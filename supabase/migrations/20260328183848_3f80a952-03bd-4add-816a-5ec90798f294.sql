DROP POLICY IF EXISTS "Allow public update on tables" ON public.tables;

CREATE POLICY "Authenticated users can update tables"
ON public.tables
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);