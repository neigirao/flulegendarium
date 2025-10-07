# 📚 API dos Hooks Customizados

Documentação completa dos hooks customizados do projeto "Lendas do Flu".

---

## 🎮 Hooks de Jogo

### useBaseGameState

**⭐ NOVO** - Hook base unificado para gerenciamento de estado do jogo.

**Localização**: `src/hooks/game/use-base-game-state.ts`

#### Parâmetros

```typescript
useBaseGameState(config?: Partial<BaseGameConfig>)
```

```typescript
interface BaseGameConfig {
  maxAttempts: number;                  // Número máximo de tentativas (default: 1)
  useAdaptiveDifficulty: boolean;       // Se usa dificuldade adaptativa (default: true)
  basePoints: number;                   // Pontos base por acerto (default: 5)
  correctSequenceThreshold?: number;    // Sequência para aumentar dificuldade (default: 3)
  incorrectSequenceThreshold?: number;  // Sequência para diminuir dificuldade (default: 2)
}
```

#### Retorno

```typescript
interface BaseGameState {
  // Score
  score: number;
  addScore: (points: number) => void;
  
  // Game Status
  gameOver: boolean;
  endGame: () => void;
  resetGame: () => void;
  
  // Attempts
  attempts: number;
  incrementAttempts: () => void;
  maxAttempts: number;
  
  // Streaks
  currentStreak: number;
  maxStreak: number;
  resetStreak: () => void;
  
  // Statistics
  gamesPlayed: number;
  
  // Adaptive Difficulty
  currentDifficulty: DifficultyLevelConfig;
  difficultyProgress: number;
  adjustDifficulty: (wasCorrect: boolean) => void;
}
```

#### Exemplo de Uso

```typescript
const gameState = useBaseGameState({
  maxAttempts: 3,
  useAdaptiveDifficulty: true,
  basePoints: 5
});

// Adicionar pontos (com multiplicador de dificuldade)
gameState.addScore(5);

// Incrementar tentativas
gameState.incrementAttempts();

// Ajustar dificuldade baseado em acerto/erro
gameState.adjustDifficulty(true);
```

---

### useUIGameState

**⭐ NOVO** - Hook para gerenciamento de estado de UI do jogo.

**Localização**: `src/hooks/game/use-ui-game-state.ts`

#### Parâmetros

```typescript
useUIGameState({ hasLost: boolean })
```

#### Retorno

```typescript
interface UIGameState {
  // Game Over Dialog
  showGameOverDialog: boolean;
  setShowGameOverDialog: (show: boolean) => void;
  handleGameOverClose: (selectRandomPlayer: () => void) => void;
  
  // Tutorial
  showTutorial: boolean;
  handleTutorialComplete: (user: any) => void;
  handleSkipTutorial: (user: any) => void;
  
  // Game Status
  gameStarted: boolean;
  setGameStarted: (started: boolean) => void;
  
  // Auth Status
  isAuthenticatedGame: boolean;
  setIsAuthenticatedGame: (authenticated: boolean) => void;
  
  // Guest Name Form
  showGuestNameForm: boolean;
  guestPlayerName: string;
  handleGuestNameSubmitted: (name: string) => void;
  handleGuestNameCancel: () => void;
}
```

#### Exemplo de Uso

```typescript
const uiState = useUIGameState({ hasLost: gameOver });

if (uiState.showTutorial) {
  return <Tutorial onComplete={uiState.handleTutorialComplete} />;
}

if (uiState.showGuestNameForm) {
  return <GuestForm onSubmit={uiState.handleGuestNameSubmitted} />;
}

return (
  <>
    <Game />
    {uiState.showGameOverDialog && (
      <GameOverDialog onClose={uiState.handleGameOverClose} />
    )}
  </>
);
```

---

### useAdaptiveGuessGame

Hook principal do jogo adaptativo que gerencia todo o fluxo do quiz.

**Localização**: `src/hooks/use-adaptive-guess-game.ts`

#### Parâmetros

```typescript
useAdaptiveGuessGame(players: Player[])
```

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `players` | `Player[]` | Lista completa de jogadores disponíveis |

#### Retorno

```typescript
{
  // Estado do jogo
  currentPlayer: Player | null;          // Jogador atual
  gameKey: number;                       // Chave para re-render
  score: number;                         // Pontuação total
  gameOver: boolean;                     // Se o jogo terminou
  timeRemaining: number;                 // Segundos restantes
  currentStreak: number;                 // Sequência de acertos
  maxStreak: number;                     // Maior sequência
  gamesPlayed: number;                   // Jogos completados
  
  // Dificuldade adaptativa
  currentDifficulty: DifficultyLevelConfig;  // Configuração atual
  difficultyProgress: number;                 // Progresso (0-100)
  difficultyChangeInfo: DifficultyChangeInfo | null;
  
  // Ações
  handleGuess: (guess: string) => Promise<void>;
  startGameForPlayer: () => void;
  resetScore: () => void;
  selectRandomPlayer: () => void;
  clearDifficultyChange: () => void;
  saveToRanking: (playerName: string) => Promise<void>;
}
```

#### Exemplo de Uso

```tsx
function AdaptiveGamePage() {
  const { data: players } = usePlayers();
  const {
    currentPlayer,
    score,
    handleGuess,
    currentDifficulty,
    startGameForPlayer
  } = useAdaptiveGuessGame(players || []);
  
  useEffect(() => {
    if (currentPlayer && imageLoaded) {
      startGameForPlayer();
    }
  }, [currentPlayer, imageLoaded]);
  
  return (
    <div>
      <p>Pontuação: {score}</p>
      <p>Dificuldade: {currentDifficulty.label}</p>
      <GuessForm onSubmit={handleGuess} />
    </div>
  );
}
```

#### Sistema de Dificuldade

- **Aumento**: 3 acertos consecutivos → sobe 1 nível
- **Diminuição**: 2 erros consecutivos → desce 1 nível
- **Níveis**: Muito Fácil (0.5x) → Fácil (0.75x) → Médio (1x) → Difícil (1.5x) → Muito Difícil (2x)
- **Impacto**: Multiplica pontos ganhos por acerto

---

### useAdaptivePlayerSelection

Hook para seleção inteligente de jogadores baseada em dificuldade.

**Localização**: `src/hooks/use-adaptive-player-selection.ts`

#### Retorno

```typescript
{
  selectPlayerByDifficulty: (
    players: Player[],
    difficultyLevel: DifficultyLevel,
    usedPlayerIds?: Set<string>
  ) => Player | null;
  
  currentDifficultyLevel: DifficultyLevel;
  setCurrentDifficultyLevel: (level: DifficultyLevel) => void;
}
```

#### Exemplo de Uso

```typescript
const { selectPlayerByDifficulty } = useAdaptivePlayerSelection();
const usedIds = useRef(new Set<string>());

const getNextPlayer = () => {
  const player = selectPlayerByDifficulty(
    allPlayers,
    'medio',
    usedIds.current
  );
  
  if (player) {
    usedIds.current.add(player.id);
    setCurrentPlayer(player);
  }
};
```

#### Estratégia de Seleção

1. **Prioridade 1**: Jogadores não usados no nível especificado
2. **Prioridade 2**: Jogadores não usados de qualquer nível
3. **Prioridade 3**: Qualquer jogador disponível
4. **Sem jogadores**: Retorna `null`

---

### useDecadePlayerSelection

Hook para seleção de jogadores no modo Quiz por Década.

**Localização**: `src/hooks/use-decade-player-selection.ts`

#### Parâmetros

```typescript
useDecadePlayerSelection(selectedDecade: Decade | null)
```

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `selectedDecade` | `Decade \| null` | Década selecionada (ex: '1990s') |

#### Retorno

```typescript
{
  availablePlayers: DecadePlayer[];      // Todos da década
  currentPlayer: DecadePlayer | null;    // Jogador atual
  isLoading: boolean;                    // Carregando dados
  playerChangeCount: number;             // Contador de trocas
  selectRandomPlayer: () => void;        // Próximo jogador
  handlePlayerImageFixed: () => void;    // Callback imagem
}
```

#### Exemplo de Uso

```tsx
function DecadeGame() {
  const [selectedDecade, setSelectedDecade] = useState<Decade>('1990s');
  
  const {
    currentPlayer,
    isLoading,
    selectRandomPlayer,
    availablePlayers
  } = useDecadePlayerSelection(selectedDecade);
  
  const handleCorrectGuess = () => {
    selectRandomPlayer(); // Próximo jogador
  };
  
  if (isLoading) return <Loader />;
  
  return (
    <div>
      <p>Década: {selectedDecade}</p>
      <p>Jogadores disponíveis: {availablePlayers.length}</p>
      <PlayerImage player={currentPlayer} />
    </div>
  );
}
```

---

### useDecadeGameState

**⚠️ DEPRECATED** - Use `useBaseGameState` para novos componentes.

Hook de gerenciamento de estado do jogo por década. Agora é uma especialização do `useBaseGameState`.

**Localização**: `src/hooks/use-decade-game-state.ts`

**Migração recomendada:**

```typescript
// ❌ Código antigo
const state = useDecadeGameState();

// ✅ Código novo
const state = useBaseGameState({
  maxAttempts: 1,
  useAdaptiveDifficulty: true,
  basePoints: 5
});

#### Retorno

```typescript
{
  score: number;
  gameOver: boolean;
  attempts: number;
  currentStreak: number;
  maxStreak: number;
  gamesPlayed: number;
  
  // Dificuldade adaptativa
  currentDifficulty: DifficultyLevelConfig;
  difficultyProgress: number;
  
  // Ações
  addScore: (points: number) => void;
  endGame: () => void;
  resetGame: () => void;
  incrementAttempts: () => void;
  resetStreak: () => void;
  adjustDifficulty: (wasCorrect: boolean) => void;
  
  // Constantes
  MAX_ATTEMPTS: number;
  DIFFICULTY_LEVELS: DifficultyLevelConfig[];
}
```

#### Exemplo de Uso

```typescript
const {
  score,
  gameOver,
  addScore,
  resetGame,
  currentDifficulty,
  incrementAttempts
} = useDecadeGameState();

const handleGuess = (isCorrect: boolean) => {
  if (isCorrect) {
    addScore(5); // Aplica multiplicador automaticamente
  } else {
    incrementAttempts(); // Pode causar game over
  }
};
```

---

## 🛠️ Hooks Utilitários

### useCleanTimer

Hook de timer limpo e preciso para o jogo.

**Localização**: `src/hooks/use-clean-timer.ts`

#### Parâmetros

```typescript
useCleanTimer(gameOver: boolean, onTimeUp: () => void)
```

#### Retorno

```typescript
{
  timeRemaining: number;     // Segundos restantes
  startTimer: () => void;    // Iniciar contagem
  stopTimer: () => void;     // Parar contagem
  isRunning: boolean;        // Se está rodando
}
```

---

### useTabVisibility

Detecta quando o usuário troca de aba (para pausar/parar jogo).

**Localização**: `src/hooks/use-tab-visibility.ts`

#### Retorno

```typescript
{
  isVisible: boolean;  // Se a aba está visível
}
```

#### Exemplo de Uso

```typescript
const { isVisible } = useTabVisibility();

useEffect(() => {
  if (!isVisible && isGameRunning) {
    pauseGame(); // Pausa quando usuário sai da aba
  }
}, [isVisible, isGameRunning]);
```

---

## 📊 Hooks de Métricas

### useAdaptiveGameMetrics

Hook para rastreamento de métricas do jogo adaptativo.

**Localização**: `src/hooks/use-adaptive-game-metrics.ts`

#### Retorno

```typescript
{
  startMetricsTracking: () => void;
  recordCorrectGuess: (playerId: string, playerName: string, difficulty: string, time: number) => void;
  recordIncorrectGuess: (playerId: string, playerName: string, difficulty: string, time: number) => void;
  saveGameData: (score: number, difficulty: string, multiplier: number) => Promise<void>;
  saveToRanking: (playerName: string) => Promise<void>;
  resetMetrics: () => void;
  getCurrentStats: () => GameStats;
}
```

#### Exemplo de Uso

```typescript
const {
  startMetricsTracking,
  recordCorrectGuess,
  saveGameData
} = useAdaptiveGameMetrics();

// Início do jogo
useEffect(() => {
  if (gamesPlayed === 0) {
    startMetricsTracking();
  }
}, [gamesPlayed]);

// Ao acertar
const handleCorrect = () => {
  recordCorrectGuess(
    player.id,
    player.name,
    currentDifficulty.level,
    guessTime
  );
};

// Fim do jogo
const handleGameOver = async () => {
  await saveGameData(score, difficulty, multiplier);
};
```

---

## 🔍 Utilitários de Validação

### processPlayerName

Função para processar e validar palpites de nomes.

**Localização**: `src/utils/name-processor.ts`

#### Assinatura

```typescript
async function processPlayerName(
  guess: string,
  targetPlayerName: string,
  targetPlayerId: string
): Promise<NameProcessingResult>
```

#### Retorno

```typescript
interface NameProcessingResult {
  processedName: string | null;  // Nome do jogador ou null
  confidence: number;            // 0 a 1 (0.7+ = correto)
  matchType?: 'name' | 'nickname';  // Tipo de match
}
```

#### Exemplo de Uso

```typescript
const result = await processPlayerName(
  "fred",
  "Fred Chaves Guedes",
  "player-uuid-123"
);

if (result.confidence > 0.7) {
  console.log("Correto!");
  console.log("Match:", result.matchType); // "name" ou "nickname"
}
```

#### Estratégia de Validação

1. Busca nome + apelidos do jogador no banco
2. Normaliza ambos (sem acentos, minúsculas)
3. Verifica match com nome principal (confidence: 0.9)
4. Verifica match com apelidos (confidence: 0.85)
5. Suporta match parcial de palavras

---

## 🎨 Padrões de Uso

### Inicialização de Jogo Completo

```tsx
function GameContainer() {
  const { data: players } = usePlayers();
  const { isAuthenticated, user } = useAuth();
  const [guestName, setGuestName] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const {
    currentPlayer,
    score,
    gameOver,
    handleGuess,
    startGameForPlayer,
    currentDifficulty,
    timeRemaining
  } = useAdaptiveGuessGame(players || []);
  
  // Iniciar timer quando tudo estiver pronto
  useEffect(() => {
    const canStart = currentPlayer && 
                     imageLoaded && 
                     (isAuthenticated || guestName);
                     
    if (canStart && !gameOver) {
      startGameForPlayer();
    }
  }, [currentPlayer, imageLoaded, guestName, gameOver]);
  
  return (
    <GameLayout>
      <GameHeader score={score} time={timeRemaining} />
      <DifficultyIndicator level={currentDifficulty} />
      <PlayerImage 
        player={currentPlayer} 
        onLoad={() => setImageLoaded(true)}
      />
      <GuessForm onSubmit={handleGuess} />
      {gameOver && <GameOverDialog score={score} />}
    </GameLayout>
  );
}
```

---

## 📖 Convenções

### Nomenclatura

- **use*** - Hooks do React
- **handle*** - Handlers de eventos
- **on*** - Callbacks de eventos
- ***State - Hooks de estado
- ***Service - Serviços/utilitários

### Tipos

- Sempre exportar tipos usados pelos hooks
- Usar `interface` para objetos complexos
- Usar `type` para uniões e aliases

### Documentação

- JSDoc completo em todos os hooks públicos
- Exemplos de uso sempre que possível
- Documentar edge cases e limitações

---

---

## 🎯 Serviços

### PlayerSelectionService

Serviço centralizado para toda lógica de seleção de jogadores.

**Localização**: `src/services/playerSelectionService.ts`

#### Métodos Estáticos

##### `selectRandomPlayer<T>(players, options)`

Seleciona um jogador aleatório com filtragem avançada.

```typescript
const result = PlayerSelectionService.selectRandomPlayer(players, {
  usedPlayerIds: new Set(['player-1']),
  difficultyLevel: 'medio',
  decade: '1990s',
  avoidLastPlayer: true
});

if (result.player) {
  console.log('Selecionado:', result.player.name);
  console.log('Disponíveis:', result.availablePlayers.length);
  console.log('Reset:', result.didReset);
}
```

**Parâmetros:**
- `players: T[]` - Lista de jogadores
- `options: PlayerSelectionOptions` - Opções de seleção
  - `usedPlayerIds?: Set<string>` - IDs já usados
  - `difficultyLevel?: DifficultyLevel` - Dificuldade
  - `decade?: Decade` - Década específica
  - `avoidLastPlayer?: boolean` - Evitar repetir último
  - `lastPlayerId?: string` - ID do último jogador

**Retorna:** `PlayerSelectionResult<T>`

##### `filterByDifficulty<T>(players, difficulty)`

Filtra jogadores por nível de dificuldade.

```typescript
const mediumPlayers = PlayerSelectionService.filterByDifficulty(
  allPlayers,
  'medio'
);
```

##### `filterByDecade(players, decade)`

Filtra jogadores por década.

```typescript
const players90s = PlayerSelectionService.filterByDecade(
  allPlayers,
  '1990s'
);
```

##### `selectMultiplePlayers<T>(players, count, options)`

Seleciona múltiplos jogadores únicos.

```typescript
const selectedPlayers = PlayerSelectionService.selectMultiplePlayers(
  allPlayers,
  5,
  { difficultyLevel: 'medio' }
);
```

##### `isPlayerAvailable<T>(player, options)`

Verifica se jogador está disponível.

```typescript
const available = PlayerSelectionService.isPlayerAvailable(player, {
  usedPlayerIds: usedIds,
  difficultyLevel: 'medio'
});
```

##### `getAvailabilityStats<T>(players, options)`

Retorna estatísticas de disponibilidade.

```typescript
const stats = PlayerSelectionService.getAvailabilityStats(players, {
  usedPlayerIds: usedIds
});

console.log(`Disponíveis: ${stats.available}/${stats.total}`);
console.log('Por dificuldade:', stats.byDifficulty);
```

#### Wrappers de Conveniência

```typescript
import { selectRandomPlayer, filterByDifficulty } from '@/services/playerSelectionService';

// Uso direto
const result = selectRandomPlayer(players, options);
const filtered = filterByDifficulty(players, 'medio');
```

---

## Validation System

Sistema de validação runtime com **Zod**.

### Schemas Disponíveis

`src/schemas/`: `PlayerSchema`, `GameStateSchema`, `GameSessionSchema`, `RankingEntrySchema`

### Utils

```typescript
import { validate, validateSupabaseResponse } from '@/utils/validation';
import { PlayerSchema } from '@/schemas';

// Validar dados
const result = validate(PlayerSchema, data);
if (result.success) {
  console.log(result.data); // Tipado
}

// Validar Supabase
const validation = validateSupabaseResponse(PlayerListSchema, response);
```

---

## 🔗 Referências

- [React Hooks](https://react.dev/reference/react)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Zod](https://zod.dev)
- [Projeto no GitHub](link-do-projeto)
