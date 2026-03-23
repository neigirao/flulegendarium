

# Unificar GameContainers via Hook de Orquestração

## Problema
Os 3 containers de página (AdaptiveGameContainer 500L, DecadeGameContainer 630L, JerseyGameContainer 520L) compartilham ~80% de lógica duplicada: analytics, achievements, guest name, devtools detection, onboarding, timer coordination, guess history, difficulty notifications.

## Estratégia
Extrair toda a lógica compartilhada para um hook `useGameOrchestration`, manter `BaseGameContainer` como shell de layout, deletar `GameContainer` (presentacional), e reduzir cada container de página para ~100-150 linhas.

## Mudanças

### 1. Criar `src/hooks/game/use-game-orchestration.ts` (~200 linhas)

Hook que encapsula toda a lógica repetida nos 3 containers:

- **Estado compartilhado**: `guestName`, `showGuestNameForm`, `canStartTimer`, `imageLoaded`, `showDebug`, `difficultyChangeInfo`
- **Analytics tracking**: page view, first guess, game start, game completion, guess results (parametrizado por `gameMode`)
- **Achievement tracking**: detecção de novos desbloqueios, fila de notificações
- **DevTools detection**: encerra jogo se detectado
- **Onboarding coordination**: steps de name-input, timer-explanation, first-guess
- **Timer start coordination**: só inicia quando nome + imagem + tutorial OK
- **Guest name form**: submit + cancel handlers
- **Guess history**: addEntry para correto/incorreto
- **Skip player**: wrapper do useSkipPlayer
- **Keyboard shortcuts**: wrapper do useGameKeyboardShortcuts
- **Reset tracking**: limpa refs quando jogo reseta

Recebe config:
```typescript
interface GameOrchestrationConfig {
  gameMode: string;                    // 'adaptive' | 'decade_1990s' | 'jersey'
  pagePath: string;                    // '/quiz-adaptativo'
  currentItem: { id: string; name: string; image_url: string } | null;
  gameOver: boolean;
  score: number;
  gamesPlayed: number;
  currentStreak: number;
  currentDifficulty: { level: string; label: string; multiplier: number };
  difficultyProgress: number;
  isTimerRunning: boolean;
  isProcessingGuess: boolean;
  timeRemaining: number;
  startGame: () => void;
  resetGame: () => void;
  selectNext: () => void;
  onImageFixed?: () => void;
  dataReady: boolean;                  // players/jerseys loaded
  dataCount: number;
  clearImageCache: () => void;
  preloadNext?: () => void;
}
```

Retorna:
```typescript
interface GameOrchestration {
  // State
  guestName: string;
  showGuestNameForm: boolean;
  showDebug: boolean;
  imageLoaded: boolean;
  difficultyChangeInfo: DifficultyChangeInfo | null;
  // Handlers
  handleGuestNameSubmit: (name: string) => void;
  handleImageLoaded: () => void;
  handleSkipPlayer: () => void;
  handleClearDifficultyNotification: () => void;
  wrapGuess: (originalGuess: (g: string) => void) => (g: string) => void;
  setShowDebug: (v: boolean) => void;
  // Skip state
  skipsUsed: number; maxSkips: number; canSkip: boolean; skipPenalty: number;
  // Keyboard
  shortcuts: any[];
  // Achievements
  currentNotification: any; dismissNotification: () => void;
  unlockedAchievementIds: string[];
  // Guest form cancel
  onGuestCancel: () => void;
}
```

### 2. Simplificar `AdaptiveGameContainer.tsx` (~150 linhas)
- Usar `useGameOrchestration` para toda a lógica compartilhada
- Manter apenas: `useAdaptiveGuessGame`, UI específica (AdaptivePlayerImage, GuessForm, AdaptiveDifficultyIndicator)

### 3. Simplificar `DecadeGameContainer.tsx` (~200 linhas)
- Usar `useGameOrchestration` para toda a lógica compartilhada
- Manter apenas: hooks de década, seleção de década, UI inline (sem `GameContainer`)
- **Deletar** importação de `GameContainer`, inline o `UnifiedPlayerImage` + `GuessForm` direto

### 4. Simplificar `JerseyGameContainer.tsx` (~150 linhas)
- Usar `useGameOrchestration` para toda a lógica compartilhada
- Manter apenas: `useJerseyGuessGame`, UI específica (JerseyImage, JerseyYearOptions)

### 5. Deletar `src/components/guess-game/GameContainer.tsx`
- Componente presentacional usado só pelo DecadeGameContainer, será substituído por UI inline

### 6. Atualizar `src/components/guess-game/index.ts`
- Remover export de `GameContainer`

### 7. Atualizar `.lovable/plan.md`
- Marcar unificação dos GameContainers como concluída

## Impacto
- **~1100 linhas duplicadas eliminadas** entre os 3 containers
- Um único ponto de manutenção para analytics, achievements, devtools, onboarding
- `BaseGameContainer` permanece intacto como shell de layout
- Nenhuma mudança visual ou funcional para o usuário

