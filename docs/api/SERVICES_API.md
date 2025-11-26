# Services API Documentation

Documentação dos serviços do projeto que encapsulam lógica de negócio complexa.

## PlayerSelectionService

Serviço centralizado para toda lógica de seleção de jogadores.

### Métodos

#### `selectRandomPlayer(players, options)`

Seleciona um jogador aleatório baseado em critérios.

**Parâmetros:**
```typescript
{
  players: Player[],              // Lista de jogadores disponíveis
  options?: {
    excludeIds?: string[],        // IDs para excluir
    difficulty?: string,          // Filtro de dificuldade
    usedPlayerIds?: Set<string>,  // Jogadores já usados
    maxRetries?: number           // Tentativas máximas (padrão: 3)
  }
}
```

**Retorna:** `Player | null`

**Exemplo:**
```typescript
const player = PlayerSelectionService.selectRandomPlayer(allPlayers, {
  difficulty: 'medium',
  excludeIds: ['id-1', 'id-2'],
  usedPlayerIds: new Set(['id-3'])
});
```

#### `filterByDifficulty(players, difficulty)`

Filtra jogadores por nível de dificuldade.

**Parâmetros:**
- `players: Player[]` - Lista de jogadores
- `difficulty: string` - Nível desejado

**Retorna:** `Player[]`

#### `filterByDecade(players, decade)`

Filtra jogadores por década.

**Parâmetros:**
- `players: Player[]` - Lista de jogadores
- `decade: Decade` - Objeto da década

**Retorna:** `Player[]`

## RankingService

Serviço para gerenciamento de rankings e pontuações.

### Métodos

#### `saveRanking(data)`

Salva ou atualiza ranking de um jogador.

**Parâmetros:**
```typescript
{
  playerName: string,
  score: number,
  userId?: string,
  gameMode?: string,
  difficultyLevel?: string
}
```

**Retorna:** `Promise<void>`

#### `getRankings(limit?)`

Busca rankings ordenados.

**Parâmetros:**
- `limit?: number` - Limite de resultados (padrão: 50)

**Retorna:** `Promise<Ranking[]>`

## GameHistoryService

Serviço para gerenciamento de histórico de partidas.

### Métodos

#### `saveGameSession(sessionData)`

Salva uma sessão de jogo.

**Parâmetros:**
```typescript
{
  userId: string,
  score: number,
  correctGuesses: number,
  totalAttempts: number,
  gameMode?: string,
  difficultyLevel?: string,
  maxStreak?: number,
  gameDuration?: number
}
```

**Retorna:** `Promise<void>`

#### `getUserHistory(userId, limit?)`

Busca histórico de um usuário.

**Parâmetros:**
- `userId: string` - ID do usuário
- `limit?: number` - Limite de resultados

**Retorna:** `Promise<GameSession[]>`

## AchievementsService

Serviço para gerenciamento de conquistas.

### Métodos

#### `checkAndUnlockAchievements(userId, gameData)`

Verifica e desbloqueia conquistas baseado em dados do jogo.

**Parâmetros:**
```typescript
{
  userId: string,
  gameData: {
    score: number,
    streak: number,
    totalGames: number,
    perfectGames: number
  }
}
```

**Retorna:** `Promise<Achievement[]>` - Conquistas desbloqueadas

#### `getUserAchievements(userId)`

Busca conquistas de um usuário.

**Parâmetros:**
- `userId: string` - ID do usuário

**Retorna:** `Promise<UserAchievement[]>`

## StatsService

Serviço para estatísticas do sistema.

### Métodos

#### `getGeneralStats()`

Busca estatísticas gerais do sistema.

**Retorna:**
```typescript
Promise<{
  totalAttempts: number,
  totalSessions: number,
  totalPlayers: number,
  correctAttempts: number,
  successRate: string
}>
```

#### `getPlayerStats(playerId)`

Busca estatísticas de um jogador específico.

**Parâmetros:**
- `playerId: string` - ID do jogador

**Retorna:**
```typescript
Promise<{
  totalAttempts: number,
  correctAttempts: number,
  missedAttempts: number,
  successRate: string,
  averageGuessTime?: number
}>
```

## Padrões de Uso

### Error Handling

Todos os serviços usam o logger centralizado:

```typescript
try {
  const result = await SomeService.method();
  logger.info('Operação bem-sucedida', { result });
} catch (error) {
  logger.error('Erro na operação', error);
  throw error; // Repropaga se necessário
}
```

### Validação de Dados

Serviços usam schemas Zod para validação:

```typescript
import { playerSchema } from '@/schemas';

const validatedPlayer = playerSchema.parse(rawData);
```

### Cache

Operações de leitura frequentes devem usar cache:

```typescript
const cachedData = await queryClient.fetchQuery({
  queryKey: ['players', filters],
  queryFn: () => PlayerService.getPlayers(filters),
  staleTime: 5 * 60 * 1000 // 5 minutos
});
```
