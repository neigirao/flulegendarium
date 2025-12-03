# Services API Documentation

Documentação dos serviços do projeto que encapsulam lógica de negócio complexa.

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
