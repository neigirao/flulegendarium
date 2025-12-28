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

## JerseyService 🆕

Serviço para gerenciamento do Quiz das Camisas.

### Métodos

#### `generateOptions(correctYears: number[])`

Gera 3 opções de ano para múltipla escolha.

**Parâmetros:**
- `correctYears: number[]` - Array de anos corretos da camisa

**Retorna:** 
```typescript
JerseyYearOption[] // Array com 3 opções: 1 correta, 2 incorretas
```

**Algoritmo:**
1. Escolhe um ano correto aleatório
2. Gera 2 anos incorretos com diferença de 1-3 anos
3. Garante range válido (1902-2025)
4. Embaralha posições

#### `checkOptionSelection(selectedYear, correctYears)`

Verifica se a opção selecionada é correta.

**Parâmetros:**
- `selectedYear: number` - Ano selecionado pelo usuário
- `correctYears: number[]` - Array de anos corretos

**Retorna:**
```typescript
{
  isCorrect: boolean,
  matchedYear?: number
}
```

#### `calculatePoints(difficulty, timeRemaining, isCorrect)`

Calcula pontos baseado em dificuldade e tempo.

**Parâmetros:**
- `difficulty: string` - Nível de dificuldade da camisa
- `timeRemaining: number` - Tempo restante em segundos
- `isCorrect: boolean` - Se acertou

**Retorna:** `number` - Pontos calculados

---

## Supabase Image Transforms 🆕

Utilitário para otimização de imagens do Supabase Storage.

**Localização:** `src/utils/image/supabaseTransforms.ts`

### Funções

#### `getTransformedImageUrl(url, options)`

Adiciona parâmetros de transformação à URL do Supabase.

**Parâmetros:**
```typescript
{
  url: string,
  options: {
    width?: number,
    height?: number,
    quality?: number,
    format?: 'webp' | 'avif' | 'origin'
  }
}
```

**Retorna:** `string` - URL transformada

#### `getResponsiveSrcSet(url, sizes)`

Gera srcset para imagens responsivas.

**Parâmetros:**
- `url: string` - URL base da imagem
- `sizes?: number[]` - Array de larguras (default: [320, 640, 1024])

**Retorna:** `string` - srcset para uso em `<img>`

**Exemplo:**
```typescript
const srcset = getResponsiveSrcSet(imageUrl);
// "url?width=320 320w, url?width=640 640w, url?width=1024 1024w"
```

#### `getOptimizedImageUrl(url, context)`

URL otimizada para contexto específico.

**Parâmetros:**
- `url: string` - URL da imagem
- `context: 'thumbnail' | 'card' | 'full' | 'hero'`

**Retorna:** `string` - URL otimizada para o contexto

**Contextos:**
| Context | Width | Quality |
|---------|-------|---------|
| thumbnail | 150 | 70 |
| card | 400 | 80 |
| full | 800 | 85 |
| hero | 1200 | 90 |
