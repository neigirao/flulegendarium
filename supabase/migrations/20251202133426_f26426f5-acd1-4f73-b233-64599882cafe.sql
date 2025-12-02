-- Adicionar política para permitir update na tabela players (para admin ou service role)
CREATE POLICY "Permitir atualização pública" 
ON public.players 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Adicionar políticas de storage para o bucket players
CREATE POLICY "Permitir upload público no bucket players" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'players');

CREATE POLICY "Permitir update público no bucket players" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'players');