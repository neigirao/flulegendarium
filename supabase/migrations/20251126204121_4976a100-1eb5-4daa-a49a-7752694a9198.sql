-- Remove duplicate ranking entries
-- Keep only the first entry of each duplicate pair (based on player_name, score, and close timestamps)

DELETE FROM rankings a
USING rankings b
WHERE a.id > b.id 
  AND a.player_name = b.player_name 
  AND a.score = b.score
  AND ABS(EXTRACT(EPOCH FROM (a.created_at - b.created_at))) < 5;