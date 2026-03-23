

# Criar RPC `get_home_stats()` e Unificar Queries da Home

## Objetivo
Substituir as 3 queries individuais na página inicial (`player-count`, `jersey-count`, `today-players`) por uma única chamada RPC, reduzindo latência e número de conexões.

## Mudanças

### 1. Migration SQL — Nova função `get_home_stats()`

Criar migration `supabase/migrations/20260323180000_create_get_home_stats_rpc.sql`:

```sql
CREATE OR REPLACE FUNCTION public.get_home_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'player_count', (SELECT count(*) FROM public.players),
    'jersey_count', (SELECT count(*) FROM public.jerseys),
    'today_players', (
      SELECT count(*) FROM public.game_starts
      WHERE started_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
    )
  );
$$;
$$
```

A função retorna `{ player_count, jersey_count, today_players }` em uma única query.

### 2. Atualizar `src/pages/Index.tsx`

Substituir os 3 `useQuery` separados por um único:

```typescript
const { data: homeStats } = useQuery({
  queryKey: ['home-stats'],
  queryFn: async () => {
    const { data, error } = await supabase.rpc('get_home_stats');
    if (error) throw error;
    return data as { player_count: number; jersey_count: number; today_players: number };
  },
  staleTime: 5 * 60 * 1000,
});
```

Depois, atualizar as referências:
- `playerCount` → `homeStats?.player_count`
- `jerseyCount` → `homeStats?.jersey_count`
- `todayPlayers` → `homeStats?.today_players`

### 3. Atualizar `.lovable/plan.md`

Marcar item P1.9 (get_home_stats RPC) como concluído.

## Impacto
- **3 requests HTTP → 1** na carga inicial da home
- Sem breaking changes — mesmos dados exibidos
- `staleTime` de 5 minutos (usa o menor dos 3 anteriores)

