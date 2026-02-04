
# Plano Completo: Correção de 215 Erros ESLint (161 errors + 54 warnings)

## Visão Geral

Este plano corrige **todos os 215 problemas** identificados no log de lint do GitHub Actions. Os erros estão organizados em 6 categorias principais para implementação eficiente.

---

## Categoria 1: `@typescript-eslint/no-explicit-any` (123 erros)

### 1.1 Tipos Globais - `src/types/global.d.ts` (3 erros)
**Linhas**: 12, 14, 21

**Solução**: Substituir `any` por tipos específicos para Google Analytics
```typescript
// Tipo para config do gtag
type GtagConfig = Record<string, string | number | boolean | undefined>;

interface Window {
  gtag?: (
    command: 'config' | 'event' | ...,
    targetId: string,
    config?: GtagConfig
  ) => void;
  dataLayer?: GtagConfig[];
}
```

### 1.2 Logger Utility - `src/utils/logger.ts` (7 erros)
**Linhas**: 11, 18, 50, 54, 58, 62, 67

**Solução**: Usar `unknown` para dados de log
```typescript
interface LogEntry {
  data?: unknown;
}

debug(message: string, context?: string, data?: unknown) { ... }
info(message: string, context?: string, data?: unknown) { ... }
// etc.
```

### 1.3 Error Reporting - `src/utils/errorReporting.ts` (8 erros)
**Linhas**: 10, 29, 64, 65, 90, 100, 109, 118

**Solução**: Usar `Record<string, unknown>` e tipagem adequada para window.gtag
```typescript
context?: Record<string, unknown>;

// Para window.gtag - usar tipos globais já definidos
if (typeof window !== 'undefined' && window.gtag) {
  window.gtag('event', 'error_report', { ... });
}
```

### 1.4 Auth Hook - `src/hooks/useAuth.tsx` (3 erros)
**Linhas**: 9, 10, 12

**Solução**: Criar tipos específicos para retornos do Supabase
```typescript
import { AuthError, AuthResponse } from '@supabase/supabase-js';

interface AuthResult {
  data: AuthResponse['data'] | null;
  error: AuthError | null;
}

signIn: (email: string, password: string) => Promise<AuthResult>;
```

### 1.5 DataGuard Component - `src/components/guards/DataGuard.tsx` (4 erros)
**Linhas**: 8, 13, 100, 105

**Solução**: Usar genéricos para tipagem flexível
```typescript
interface DataGuardProps<T = unknown> {
  data: T;
  validator?: (data: T) => { isValid: boolean; error?: string };
}

interface PlayerDataGuardProps {
  players: Record<string, unknown>[];
}
```

### 1.6 Hooks com `any` (35+ erros)
Arquivos afetados:
- `use-ui-game-state.ts` (4 erros)
- `use-core-web-vitals.ts` (4 erros)
- `use-device-detection.ts` (3 erros)
- `use-error-handler.ts` (2 erros)
- `use-jersey-guess-game.ts` (2 erros)
- `use-jerseys-data.ts` (2 erros)
- `use-lcp-optimization.ts` (2 erros)
- `use-live-events.ts` (1 erro)
- `use-mobile-optimization.ts` (1 erro)
- `use-orientation.ts` (2 erros)
- `use-players-data.ts` (3 erros)
- `use-route-prefetch.ts` (1 erro)
- `use-touch-gestures.ts` (2 erros)
- `useAdminAuth.ts` (1 erro)
- `use-daily-challenges.ts` (1 erro)
- `use-adaptive-guess-game.ts` (1 erro)

**Solução padrão para eventos**:
```typescript
// Touch events
const startTouch = useCallback((e: TouchEvent | MouseEvent) => {
  const touch = 'touches' in e ? e.touches[0] : e;
  // ...
}, []);

// Core Web Vitals
interface PerformanceWithMemory extends Performance {
  memory?: { usedJSHeapSize: number; totalJSHeapSize: number; };
}
```

### 1.7 Components com `any` (25+ erros)
Arquivos afetados:
- `GameAnimations.tsx` (3 erros)
- `PersonalDashboard.tsx` (1 erro)
- `DecadeGameContainer.tsx` (1 erro)
- `EnhancedErrorBoundary.tsx` (2 erros)
- `GameErrorBoundary.tsx` (2 erros)
- `RootErrorBoundary.tsx` (2 erros)
- `SwipeGestureHandler.tsx` (2 erros)
- `AdaptiveGameContainer.tsx` (4 erros)
- `CoreWebVitalsOptimizer.tsx` (4 erros)
- `CriticalImage.tsx` (2 erros)
- `PerformanceBudgetMonitor.tsx` (1 erro)
- `PWAInstallPrompt.tsx` (1 erro)
- `PWAProvider.tsx` (2 erros)
- `DynamicSEO.tsx` (1 erro)
- `ShareSystem2.tsx` (1 erro)
- `NewsArticleForm.tsx` (1 erro)
- `NewsCategoriesManagement.tsx` (1 erro)
- `NPSReport.tsx` (1 erro)

**Solução para Error Boundaries**:
```typescript
interface PerformanceWithMemory extends Performance {
  memory?: { usedJSHeapSize: number; totalJSHeapSize: number; };
}

const perf = performance as PerformanceWithMemory;
const memoryUsed = perf.memory?.usedJSHeapSize;
```

### 1.8 Services com `any` (8 erros)
- `adminBusinessIntelligence.ts` (2 erros)
- `decadePlayerService.ts` (1 erro)
- `playerDataService.ts` (1 erro)

### 1.9 Utils com `any` (20+ erros)
- `cache/SWRCache.ts` (1 erro)
- `cache/UnifiedCacheManager.ts` (1 erro)
- `errorMessages.ts` (2 erros)
- `performance/cacheOptimization.ts` (3 erros)
- `performance/databaseOptimization.ts` (5 erros)
- `performance/imageOptimizer.ts` (1 erro)
- `secureErrorHandling.ts` (2 erros)

### 1.10 Arquivos de Teste com `any` (30+ erros)
Usar `as unknown as Type` para type assertions em testes:
```typescript
// Ao invés de:
expect(fn(value as any)).toBe(result);

// Usar:
expect(fn(value as unknown as ExpectedType)).toBe(result);
```

---

## Categoria 2: `react-refresh/only-export-components` (35 warnings)

### 2.1 Constantes exportadas com componentes
**Arquivos afetados**:
- `LazyComponents.tsx` (linha 39)
- `LazyLoad.tsx` (linhas 45, 45)
- `AchievementSystemProvider.tsx` (linhas 19, 177)
- `DifficultySection.tsx` (linhas 2, 8, 16)
- `OptimizedAnimations.tsx` (linha 341)
- `LCPOptimizedImage.tsx` (linhas 185, 216)
- `ChallengeSystem.tsx` (linhas 20, 30)
- Vários arquivos UI

**Solução**: Extrair constantes/hooks para arquivos separados ou usar comentários ESLint para casos onde a extração não faz sentido (componentes UI do shadcn/ui):
```typescript
// Para shadcn/ui components, suprimir warning:
// eslint-disable-next-line react-refresh/only-export-components
export const buttonVariants = cva(...)
```

### 2.2 Contextos exportados com Providers
**Arquivos**: `AchievementSystemProvider.tsx`, `UXProvider.tsx`, `OnboardingProvider.tsx`

**Solução**: Mover contextos para arquivos separados:
- Criar `src/contexts/AchievementContext.ts`
- Criar `src/contexts/UXContext.ts`
- Criar `src/contexts/OnboardingContext.ts`

---

## Categoria 3: `react-hooks/exhaustive-deps` (15 warnings)

### 3.1 Dependências faltantes
**Arquivos afetados**:
- `AchievementSystem.tsx` - falta `achievements`
- `NewsArticleForm.tsx` - falta `fetchArticle`
- `OptimizedAnimations.tsx` - falta `displayValue`
- `PWAInstallPrompt.tsx` - falta `isMobile`
- `DynamicSEO.tsx` - falta funções generate*
- `PlayerCommentsSection.tsx` - falta `fetchComments`
- `use-base-game-state.ts` - `finalConfig` deve ser useMemo
- `use-adaptive-game-metrics.ts` - falta dependências
- `use-adaptive-guess-game.ts` - falta dependências
- `use-analytics.ts` - falta dependências
- `use-decade-player-selection.ts` - dependência desnecessária
- `use-jersey-guess-game.ts` - falta dependências
- `use-news-articles.ts` - falta `fetchArticles`
- `OnboardingProvider.tsx` - falta `completeOnboarding`

**Solução padrão**:
```typescript
// Opção 1: Adicionar dependência
useEffect(() => { ... }, [dep1, dep2, missingDep]);

// Opção 2: Usar useCallback para funções
const fetchData = useCallback(() => { ... }, []);
useEffect(() => { fetchData(); }, [fetchData]);

// Opção 3: Suprimir com justificativa
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { ... }, [intentionallyOmittedDep]);
```

---

## Categoria 4: `@typescript-eslint/no-empty-object-type` (2 erros)

### 4.1 `src/components/ui/command.tsx` (linha 24)
```typescript
// De:
interface CommandDialogProps extends DialogProps {}

// Para:
type CommandDialogProps = DialogProps;
```

### 4.2 `src/components/ui/textarea.tsx` (linha 5)
```typescript
// De:
export interface TextareaProps 
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

// Para:
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
```

---

## Categoria 5: Outros Erros (8 erros)

### 5.1 `@typescript-eslint/no-require-imports` (1 erro)
**Arquivo**: `src/utils/fallback-images/index.ts` (linha 27)
```typescript
// De:
const { getFallbackSvg } = require('./fluminenseSvg');

// Para:
import { getFallbackSvg } from './fluminenseSvg';
```

### 5.2 `@typescript-eslint/ban-ts-comment` (3 erros)
**Arquivos**: Testes usando `@ts-ignore`
```typescript
// De:
// @ts-ignore

// Para:
// @ts-expect-error - [razão específica]
```

### 5.3 `@typescript-eslint/no-unused-expressions` (2 erros)
**Arquivo**: `src/hooks/use-touch-gestures.ts` (linhas 75, 77)
```typescript
// De:
deltaX > 0 ? onSwipeRight?.() : onSwipeLeft?.();

// Para:
if (deltaX > 0) {
  onSwipeRight?.();
} else {
  onSwipeLeft?.();
}
```

### 5.4 `no-async-promise-executor` (1 erro)
**Arquivo**: `src/utils/cache/UnifiedCacheManager.ts` (linha 108)
```typescript
// De:
return new Promise(async (resolve, reject) => { ... });

// Para:
async preload<T>(...): Promise<T> {
  const cached = this.get<T>(key);
  if (cached) return cached;
  const data = await dataLoader();
  this.set(key, data, ttl);
  return data;
}
```

### 5.5 `no-useless-escape` (1 erro)
**Arquivo**: `src/utils/htmlSanitizer.tsx` (linha 13)
```typescript
// Remover escape desnecessário de '-' na regex
```

---

## Categoria 6: Fast Refresh - Componentes em arquivos de utils

### 6.1 `src/utils/lazy-load-utils.tsx` (linha 8)
**Problema**: Componente `LazyLoadWrapper` definido em arquivo de utils

**Solução**: Mover para arquivo de componente separado ou inline no HOC

### 6.2 `src/utils/htmlSanitizer.tsx` (linhas 23, 34)
**Problema**: Componentes exportados em arquivo de utils

**Solução**: Mover componentes para `src/components/sanitizer/`

---

## Arquivos a Modificar (Total: ~70 arquivos)

| Categoria | Quantidade | Prioridade |
|-----------|------------|------------|
| Tipos globais e utils core | 15 | Alta |
| Hooks | 20 | Alta |
| Componentes | 25 | Média |
| Testes | 15 | Baixa |
| UI shadcn (suprimir) | 10 | Baixa |

---

## Novos Arquivos a Criar

1. `src/types/gtag.d.ts` - Tipos para Google Analytics
2. `src/types/performance.d.ts` - Extensões de Performance API  
3. `src/types/touch-events.d.ts` - Tipos para eventos touch simulados
4. `src/contexts/AchievementContext.ts` - Contexto extraído
5. `src/components/sanitizer/SafeHtml.tsx` - Componentes movidos

---

## Ordem de Implementação

1. **Fase 1**: Criar tipos globais auxiliares (`gtag.d.ts`, `performance.d.ts`)
2. **Fase 2**: Corrigir utils core (`logger.ts`, `errorReporting.ts`, `errorMessages.ts`)
3. **Fase 3**: Corrigir hooks principais (20 arquivos)
4. **Fase 4**: Corrigir componentes (25 arquivos)
5. **Fase 5**: Suprimir warnings de shadcn/ui com comentários ESLint
6. **Fase 6**: Corrigir testes com type assertions corretas
7. **Fase 7**: Extrair contextos e componentes de arquivos de utils

---

## Resultado Esperado

- **0 erros** de ESLint
- **~10 warnings** restantes (shadcn/ui - aceitáveis com supressão documentada)
- Código com tipagem forte em todo o projeto
- Conformidade total com React Fast Refresh
- Build e testes E2E passando no GitHub Actions
