
# Plano: Corrigir Erros de ESLint do E2E

## Resumo
Este plano corrige **192 erros** e **52 warnings** identificados no log de lint. Os problemas principais são:
- Uso excessivo de `any` (26 ocorrências)
- HOCs/utilities em arquivos de componentes (3 warnings)
- Declaração léxica em case block (1 erro)
- useEffect com dependência faltante (1 warning)
- Uso de `require()` no tailwind.config (1 erro)
- Tipo `{}` ("empty object") problemático (1 erro)

---

## Fase 1: Tipos Fortes - Substituir `any` (26 correções)

### 1.1 CriticalMeta.tsx (linha 115)
**Problema**: `(window as any).scheduler`
**Solução**: Criar interface para Scheduler API
```typescript
interface SchedulerAPI {
  postTask: (callback: () => void, options?: { priority: 'background' | 'user-visible' | 'user-blocking' }) => void;
}

declare global {
  interface Window {
    scheduler?: SchedulerAPI;
  }
}

// Uso:
const scheduler = window.scheduler;
```

### 1.2 LazyComponents.tsx (linhas 39, 50)
**Problema**: `<P extends {}>` e `React.forwardRef<any, P>`
**Solução**: Usar `object` e `HTMLElement`
```typescript
export const withLazyPreload = <P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  preloadTrigger?: () => boolean
) => {
  const WrappedComponent = React.forwardRef<HTMLElement, P>((props, ref) => (
    // ...
  ));
  return WrappedComponent;
};
```

### 1.3 LazyLoad.tsx (linhas 61, 66)
**Problema**: `ComponentType<any>` e `props: any`
**Solução**: Usar tipos genéricos
```typescript
export const createLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = React.lazy(importFn);
  const WrappedComponent = (props: P) => (
    <LazyLoad fallback={fallback}>
      <LazyComponent {...props} />
    </LazyLoad>
  );
  WrappedComponent.displayName = 'LazyComponent';
  return WrappedComponent;
};
```

### 1.4 StructuredData.tsx (linhas 7, 12)
**Problema**: `data?: any` e `structuredData: any`
**Solução**: Criar interface para dados estruturados
```typescript
interface WebPageData {
  title?: string;
  description?: string;
  path?: string;
}

interface StructuredDataProps {
  type: 'Game' | 'WebSite' | 'Organization' | 'FAQ' | 'WebPage';
  data?: WebPageData;
}

// No useEffect:
let structuredData: Record<string, unknown> = {};
```

### 1.5 AchievementSystemProvider.tsx (linha 9)
**Problema**: `getPlayerAchievements: () => any[]`
**Solução**: Definir tipo de Achievement
```typescript
import { Achievement } from '@/types/achievements';

interface AchievementContextType {
  unlockAchievement: (achievementId: string, playerName?: string) => void;
  checkProgressAchievements: (score: number, streak: number, timeBonus: number) => void;
  getPlayerAchievements: () => Achievement[];
  getTotalPoints: () => number;
}
```

### 1.6 PlayerPerformanceAnalysis.tsx (linha 34)
**Problema**: `players: any[]`
**Solução**: Usar tipo Player existente
```typescript
import { Player } from '@/types/guess-game';

const PlayerTable = memo(({ players, title, icon }: { 
  players: Player[], 
  title: string, 
  icon: React.ReactNode 
}) => (
```

### 1.7 PlayersManagement.tsx (linha 74)
**Problema**: `difficulty_level: player.difficulty_level as any`
**Solução**: Usar tipo DifficultyLevel
```typescript
import { DifficultyLevel } from '@/types/guess-game';

difficulty_level: (player.difficulty_level as DifficultyLevel) || 'medio',
```

### 1.8 ScoreDistributionChart.tsx (linha 69)
**Problema**: `props: any` no formatter
**Solução**: Tipar props do Recharts
```typescript
interface TooltipPayload {
  payload: { percent: string };
}

formatter={(value: number, name: string, props: TooltipPayload) => [
  `${value} jogadores (${props.payload.percent}%)`,
  'Quantidade'
]}
```

### 1.9 sentry.ts (linhas 101, 176, 181)
**Problema**: `(performance as any).memory` e funções genéricas
**Solução**: Interfaces para Performance API e tipos genéricos corretos
```typescript
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
  };
}

// linha 101
const perfWithMemory = performance as PerformanceWithMemory;
if (perfWithMemory.memory) {
  const memoryInfo = perfWithMemory.memory;
  // ...
}

// linhas 176-181
measureFunction: <T extends (...args: unknown[]) => unknown>(
  fn: T, 
  name: string,
  op: string = 'function'
): T => {
  return ((...args: Parameters<T>): ReturnType<T> => {
    // ...
  }) as T;
}
```

### 1.10 statistics-converter.ts (linha 40)
**Problema**: `obj: any`
**Solução**: Usar tipo mais específico
```typescript
function validateStatisticsObject(obj: Record<string, unknown> | null, defaultStats: PlayerStatistics): PlayerStatistics {
```

### 1.11 validation.ts (linha 139)
**Problema**: `z.ZodObject<any>`
**Solução**: Usar ZodRawShape
```typescript
import { z, ZodRawShape } from 'zod';

export function validatePartial<T extends z.ZodObject<ZodRawShape>>(
```

### 1.12 dataValidators.ts (linhas 7, 54, 88, 150, 162)
**Problema**: Múltiplos `any` em interfaces e parâmetros
**Solução**: Tipos específicos
```typescript
export interface ValidationResult<T = unknown> {
  isValid: boolean;
  error?: string;
  sanitizedData?: T;
}

export const validatePlayerData = (player: Record<string, unknown>): ValidationResult => {

export const validateApiResponse = (data: unknown, expectedFields: string[] = []): ValidationResult => {

export const sanitizeString = (str: unknown): string => {

export const validateNumber = (value: unknown, min?: number, max?: number): ValidationResult<number> => {
```

### 1.13 dataValidators-expanded.test.ts (linhas 345, 346, 350)
**Problema**: Testes usando `as any`
**Solução**: Usar `as unknown as tipo` para type assertions em testes
```typescript
it('should handle boolean input', () => {
  expect(sanitizeString(true as unknown as string)).toBe('true');
  expect(sanitizeString(false as unknown as string)).toBe('false');
});

it('should handle object input', () => {
  expect(sanitizeString({} as unknown as string)).toBe('[object Object]');
});
```

### 1.14 Edge Functions (rotate-daily-challenges e weekly-image-audit)
**Problema**: `error: any` em catch blocks
**Solução**: Tipar erro
```typescript
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error("[rotate-daily-challenges] Error:", errorMessage);
  return new Response(
    JSON.stringify({ success: false, error: errorMessage }),
    // ...
  );
}
```

Para `weekly-image-audit` linha 42:
```typescript
const auditPlayerImages = async (supabase: SupabaseClient): Promise<{
```

---

## Fase 2: Warnings de Fast Refresh (3 correções)

### 2.1 LazyComponents.tsx (linha 39)
**Problema**: HOC `withLazyPreload` exportado junto com componentes
**Solução**: Mover HOC para arquivo separado
- Criar `src/utils/lazy-preload.ts`
- Mover `withLazyPreload` para o novo arquivo
- Manter apenas componentes lazy no arquivo original

### 2.2 LazyLoad.tsx (linhas 45, 60)
**Problema**: `withLazyLoad` e `createLazyComponent` misturados com componentes
**Solução**: Mover utilities para arquivo separado
- Criar `src/utils/lazy-load-utils.ts`
- Mover `withLazyLoad` e `createLazyComponent`
- Manter apenas `LazyLoad` componente no arquivo original

### 2.3 AchievementSystemProvider.tsx (linha 175)
**Problema**: Hook `useAchievementSystem` exportado com Provider
**Solução**: Mover hook para arquivo separado
- Criar `src/hooks/use-achievement-system.ts`
- Mover `useAchievementSystem` hook
- Importar no Provider para manter compatibilidade

---

## Fase 3: Outros Erros (3 correções)

### 3.1 AchievementsGrid.tsx (linha 73)
**Problema**: `Unexpected lexical declaration in case block`
**Solução**: Envolver case em bloco
```typescript
case 'speed_demon': {
  const fastGames = gameStats.avgTime < 5000 ? 10 : 0;
  return fastGames;
}
```

### 3.2 AchievementSystem.tsx (linha 150)
**Problema**: `useEffect has missing dependency: 'achievements'`
**Solução**: Adicionar dependência ou usar callback
```typescript
// Opção 1: Adicionar dependência
}, [currentScore, currentStreak, totalCorrectGuesses, toast, achievements]);

// Opção 2 (preferida): Usar functional update para evitar dependência
setAchievements(prev => prev.map(achievement => {
  // lógica usando prev ao invés de achievements externo
}));
```

### 3.3 tailwind.config.ts (linha 184)
**Problema**: `require()` proibido
**Solução**: Usar import ESM
```typescript
import tailwindcssAnimate from "tailwindcss-animate";

// No final:
plugins: [tailwindcssAnimate],
```

---

## Arquivos a Modificar

| Arquivo | Tipo de Mudança | Erros/Warnings |
|---------|-----------------|----------------|
| `src/components/CriticalMeta.tsx` | Tipar scheduler API | 1 erro |
| `src/components/LazyComponents.tsx` | Tipar genéricos + extrair HOC | 2 erros, 1 warning |
| `src/components/LazyLoad.tsx` | Tipar genéricos + extrair utils | 2 erros, 2 warnings |
| `src/components/StructuredData.tsx` | Interfaces específicas | 2 erros |
| `src/components/achievements/AchievementSystem.tsx` | Corrigir dependências | 1 warning |
| `src/components/achievements/AchievementSystemProvider.tsx` | Tipar + extrair hook | 1 erro, 1 warning |
| `src/components/achievements/AchievementsGrid.tsx` | Bloco no case | 1 erro |
| `src/components/admin/PlayerPerformanceAnalysis.tsx` | Tipar Player | 1 erro |
| `src/components/admin/PlayersManagement.tsx` | Tipar DifficultyLevel | 1 erro |
| `src/components/admin/analytics/ScoreDistributionChart.tsx` | Tipar props Recharts | 1 erro |
| `src/utils/sentry.ts` | Interfaces Performance + genéricos | 4 erros |
| `src/utils/statistics-converter.ts` | Tipar objeto | 1 erro |
| `src/utils/validation.ts` | ZodRawShape | 1 erro |
| `src/utils/validation/dataValidators.ts` | ValidationResult genérico | 5 erros |
| `src/utils/validation/__tests__/dataValidators-expanded.test.ts` | Type assertions corretas | 3 erros |
| `supabase/functions/rotate-daily-challenges/index.ts` | Tipar catch error | 1 erro |
| `supabase/functions/weekly-image-audit/index.ts` | Tipar supabase + catch | 2 erros |
| `tailwind.config.ts` | Import ESM | 1 erro |

**Novos arquivos a criar:**
- `src/utils/lazy-preload.ts` (extraído de LazyComponents)
- `src/utils/lazy-load-utils.ts` (extraído de LazyLoad)
- `src/hooks/use-achievement-system.ts` (extraído de Provider)
- `src/types/window.d.ts` (extensões globais de Window)

---

## Detalhes Técnicos

### Tipos Globais para Window Extensions
Criar `src/types/window.d.ts`:
```typescript
interface SchedulerAPI {
  postTask: (
    callback: () => void, 
    options?: { priority: 'background' | 'user-visible' | 'user-blocking' }
  ) => void;
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
  };
}

declare global {
  interface Window {
    scheduler?: SchedulerAPI;
    testSentry?: () => void;
  }
}

export {};
```

### ValidationResult Genérico
O tipo `ValidationResult<T>` permite tipagem específica para cada validator:
- `validateNumber` retorna `ValidationResult<number>`
- `validatePlayerData` retorna `ValidationResult<Player>`
- Mantém compatibilidade com código existente via default `T = unknown`

---

## Ordem de Implementação

1. **Primeiro**: Criar arquivos de tipos (`window.d.ts`)
2. **Segundo**: Corrigir validadores e utilities (base para outros)
3. **Terceiro**: Extrair HOCs/hooks para arquivos separados
4. **Quarto**: Corrigir componentes que dependem dos novos tipos
5. **Quinto**: Edge functions e tailwind config
6. **Último**: Rodar `npm run lint` para validar

---

## Resultado Esperado

- **0 erros** de ESLint
- **0 warnings** de Fast Refresh (componentes separados de utilities)
- Possíveis warnings restantes: `react-hooks/exhaustive-deps` se optar por suprimir
- Código mais seguro com tipagem forte
- Melhor experiência de desenvolvimento com autocomplete
