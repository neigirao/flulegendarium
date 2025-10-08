# Guia de Testes - Flu Legendarium

## Índice
- [Configuração](#configuração)
- [Tipos de Testes](#tipos-de-testes)
- [Convenções](#convenções)
- [Data Test IDs](#data-test-ids)
- [Mocks](#mocks)
- [Exemplos](#exemplos)

## Configuração

### Testes Unitários (Vitest)
```bash
# Executar em modo watch
npm test

# Executar uma vez
npm run test:run

# Com cobertura
npm run test:coverage

# Interface visual
npm run test:ui
```

### Testes E2E (Playwright)
```bash
# Executar testes E2E
npm run test:e2e

# Interface visual
npm run test:e2e:ui

# Debug
npm run test:e2e:debug
```

## Tipos de Testes

### 1. Testes Unitários
Testam componentes, hooks e funções isoladamente.

**Localização:** `src/**/__tests__/`

**Exemplo:**
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByTestId('my-component')).toBeInTheDocument();
  });
});
```

### 2. Testes de Integração
Testam a interação entre múltiplos componentes/serviços.

**Exemplo:**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Game Flow Integration', () => {
  it('should complete full game flow', async () => {
    const user = userEvent.setup();
    render(<GameContainer />);
    
    await user.click(screen.getByTestId('start-game-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('game-active')).toBeInTheDocument();
    });
  });
});
```

### 3. Testes E2E
Testam fluxos completos da aplicação no navegador.

**Localização:** `e2e/`

**Exemplo:**
```typescript
import { test, expect } from '@playwright/test';

test('should complete game successfully', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="play-button"]');
  await expect(page.locator('[data-testid="game-container"]')).toBeVisible();
});
```

## Convenções

### Estrutura de Arquivos
```
src/
├── components/
│   ├── MyComponent.tsx
│   └── __tests__/
│       └── MyComponent.test.tsx
├── hooks/
│   ├── use-my-hook.ts
│   └── __tests__/
│       └── use-my-hook.test.ts
└── utils/
    ├── my-util.ts
    └── __tests__/
        └── my-util.test.ts

e2e/
├── game-flow.spec.ts
├── auth-flow.spec.ts
└── admin-flow.spec.ts
```

### Nomenclatura
- Arquivos de teste: `*.test.tsx` ou `*.test.ts`
- Testes E2E: `*.spec.ts`
- Describe blocks: Nome do componente/função
- Test cases: "should [comportamento esperado]"

### AAA Pattern
```typescript
it('should update score on correct guess', () => {
  // Arrange (preparar)
  const initialScore = 0;
  
  // Act (executar)
  const newScore = calculateScore(initialScore, true);
  
  // Assert (verificar)
  expect(newScore).toBe(100);
});
```

## Data Test IDs

Use `data-testid` para facilitar seleção de elementos em testes.

### Convenção de Nomenclatura
```typescript
// Formato: [componente]-[elemento]-[ação/tipo]
data-testid="game-container"
data-testid="player-card-image"
data-testid="guess-form-submit-btn"
data-testid="score-display-value"
```

### Principais Data Test IDs

#### Game Components
- `game-container` - Container principal do jogo
- `game-status` - Status do jogo
- `game-score` - Pontuação
- `game-timer` - Temporizador
- `player-image` - Imagem do jogador
- `guess-form` - Formulário de palpite
- `guess-input` - Input de palpite
- `guess-submit-btn` - Botão de submeter
- `game-over-dialog` - Dialog de fim de jogo
- `ranking-display` - Exibição de ranking

#### Navigation
- `nav-home-link` - Link para home
- `nav-game-mode-link` - Link para seleção de modo
- `nav-admin-link` - Link para admin
- `play-button` - Botão principal de jogar

#### Admin
- `admin-dashboard` - Dashboard administrativo
- `admin-players-table` - Tabela de jogadores
- `admin-stats-card` - Cards de estatísticas

### Exemplo de Uso
```typescript
// Component
export const GameContainer = () => {
  return (
    <div data-testid="game-container">
      <div data-testid="game-score">{score}</div>
      <button data-testid="guess-submit-btn">
        Enviar
      </button>
    </div>
  );
};

// Test
it('should display score', () => {
  render(<GameContainer />);
  const score = screen.getByTestId('game-score');
  expect(score).toHaveTextContent('0');
});
```

## Mocks

### Mock de Supabase
```typescript
// Já configurado em src/test/setup.ts
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}));
```

### Mock de Hooks Customizados
```typescript
vi.mock('@/hooks/use-game-state', () => ({
  useGameState: () => ({
    score: 100,
    gameActive: true,
    currentPlayer: mockPlayer,
    handleGuess: vi.fn(),
  }),
}));
```

### Mock de Router
```typescript
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: '123' }),
}));
```

## Exemplos

### Teste de Componente
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlayerCard } from '../PlayerCard';

describe('PlayerCard', () => {
  const mockPlayer = {
    id: '1',
    name: 'Test Player',
    imageUrl: 'test.jpg',
  };

  it('should render player information', () => {
    render(<PlayerCard player={mockPlayer} />);
    
    expect(screen.getByTestId('player-card')).toBeInTheDocument();
    expect(screen.getByText('Test Player')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<PlayerCard player={mockPlayer} onClick={handleClick} />);
    
    await user.click(screen.getByTestId('player-card'));
    expect(handleClick).toHaveBeenCalledWith(mockPlayer);
  });
});
```

### Teste de Hook
```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useGameState } from '../use-game-state';

describe('useGameState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useGameState());
    
    expect(result.current.score).toBe(0);
    expect(result.current.gameActive).toBe(false);
  });

  it('should update score on correct guess', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.handleCorrectGuess();
    });
    
    expect(result.current.score).toBeGreaterThan(0);
  });
});
```

### Teste E2E
```typescript
import { test, expect } from '@playwright/test';

test.describe('Game Flow', () => {
  test('should complete full game session', async ({ page }) => {
    // Navigate to game
    await page.goto('/');
    await page.click('[data-testid="play-button"]');
    
    // Wait for game to load
    await expect(page.locator('[data-testid="game-container"]')).toBeVisible();
    
    // Make a guess
    await page.fill('[data-testid="guess-input"]', 'Test Player');
    await page.click('[data-testid="guess-submit-btn"]');
    
    // Verify feedback
    await expect(page.locator('[data-testid="game-status"]')).toBeVisible();
  });
});
```

## Boas Práticas

### ✅ Fazer
- Usar `data-testid` para elementos importantes
- Testar comportamento, não implementação
- Manter testes simples e focados
- Usar AAA pattern
- Mockar dependências externas
- Testar casos extremos e erros

### ❌ Evitar
- Testar detalhes de implementação
- Testes dependentes uns dos outros
- Testes que dependem de timing específico
- Selecionar elementos por classes CSS
- Duplicar lógica de produção nos testes

## Cobertura de Testes

### Metas
- Componentes críticos: 80%+
- Hooks de lógica de negócio: 90%+
- Utilidades: 95%+
- Fluxos principais E2E: 100%

### Verificar Cobertura
```bash
npm run test:coverage
```

### Ignorar Arquivos
Adicione comentário no topo do arquivo:
```typescript
/* istanbul ignore file */
```

## Debugging

### Vitest
```typescript
// Usar .only para rodar teste específico
it.only('should focus on this test', () => {
  // ...
});

// Usar .skip para pular teste
it.skip('should skip this test', () => {
  // ...
});

// Debug com screen.debug()
it('should debug component', () => {
  render(<MyComponent />);
  screen.debug(); // Imprime HTML atual
});
```

### Playwright
```bash
# Modo debug
npm run test:e2e:debug

# Inspector
npx playwright test --debug

# Headed mode (ver navegador)
npx playwright test --headed
```

## CI/CD

Testes são executados automaticamente no CI:
```yaml
# .github/workflows/test.yml
- name: Run unit tests
  run: npm run test:run

- name: Run E2E tests
  run: npm run test:e2e
```

## Recursos

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Docs](https://playwright.dev/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
