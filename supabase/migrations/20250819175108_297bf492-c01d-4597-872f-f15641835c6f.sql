-- Enable realtime for rankings table
ALTER TABLE public.rankings REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.rankings;