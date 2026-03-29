

# Auditoria Multi-Disciplinar Completa

## Erro de Build Imediato (Bloqueante)

**`src/main.tsx` linhas 43 e 48** — TypeScript infere `window` como `never` dentro do bloco `if ('requestAnimationFrame' in window)`. O narrowing elimina `setTimeout` do tipo.

**Correção**: Substituir `window.setTimeout` por `globalThis.setTimeout` ou `setTimeout` (função global) nas linhas 43 e 48.

---

## 1. Dead Code Confirmado (Remover)

| Arquivo | Motivo |
|---|---|
| `src/components/GameModeCard.tsx` | Zero imports externos |
| `src/components/LazyComponents.tsx` (`LazyAdminDashboard`, `LazyPlayerRanking`) | Nunca importados fora do próprio arquivo (exceto `LazyWrapper` usada em 1 lugar) |
| `src/components/guards/DataGuard.tsx` + `PlayerDataGuard` | Zero imports externos |
| `src/components/seo/EnhancedSEORouter.tsx` | Zero imports externos |
| `src/hooks/use-critical-image-preload.ts` | Zero imports externos |
| `src/components/performance/CriticalImage.tsx` | Zero imports externos |
| `src/components/performance/CoreWebVitalsOptimizer.tsx` | Zero imports externos |
| `src/components/performance/EnhancedImageOptimizer.tsx` | Zero imports externos |
| `src/components/performance/IntelligentImageLoader.tsx` | Zero imports externos |
| `src/components/performance/LCPOptimizedImage.tsx` | Zero imports externos |
| `src/components/performance/LazyImageOptimizer.tsx` | Zero imports externos |
| `src/components/performance/PerformanceBudgetMonitor.tsx` | Zero imports externos |
| `src/components/performance/PerformanceMetricsReporter.tsx` | Zero imports externos |
| `src/assets/players/` (6 imagens .jpg) | Zero imports; diretório deveria ter sido deletado (regra anti-IA) |

**Impacto**: Reduz bundle size, melhora tree-shaking, elimina confusão para IA e devs.

---

## 2. Segurança — Admin Auth via localStorage (Crítico)

**`src/hooks/useAdminAuth.ts`** armazena sessão admin em `localStorage` e verifica autenticação apenas pelo lado do cliente. Isso viola diretamente as diretrizes de segurança do projeto.

**Correção**: Embora o RPC `verify_admin_credentials` já valide no servidor, a sessão persistida no `localStorage` pode ser manipulada. Adicionar re-validação server-side no `checkAuth` (chamar o RPC novamente ou criar um RPC `verify_admin_session`) em vez de confiar apenas no timestamp local.

---

## 3. console.log em Produção (20 arquivos, 216 ocorrências)

Arquivos críticos com `console.log` que deveriam usar `logger`:

| Arquivo | Ocorrências |
|---|---|
| `src/utils/name-processor.ts` | 7 |
| `src/components/performance/CriticalImage.tsx` | 6 |
| `src/utils/jersey-image/preloadUtils.ts` | 4 |
| `src/components/guess-game/RankingForm.tsx` | 2 |
| `src/components/achievements/AchievementSystemProvider.tsx` | 1 |
| `src/components/social/SocialShare.tsx` | 1 |

**Correção**: Substituir todos os `console.log` por `logger.debug/info` e `console.error` por `logger.error`.

---

## 4. `checkAndUnlockAchievements` Não Utilizado

Em `AchievementSystemProvider.tsx` linha 27, o hook `useAchievements()` é desestruturado mas `checkAndUnlockAchievements` nunca é chamado. O provider usa sua própria lógica local duplicada.

**Correção**: Remover a importação não utilizada ou integrar a lógica do hook substituindo a implementação local.

---

## 5. Cores Hardcoded (Tokens Semânticos Incompletos)

`src/data/decades.ts` usa classes hardcoded: `bg-amber-500`, `bg-orange-500`, `bg-red-500`, `bg-blue-500`, `bg-purple-500`.

**Correção**: Migrar para tokens semânticos conforme a diretriz do design system.

---

## 6. `as any` em Produção (3 arquivos)

- `src/hooks/useAdminAuth.ts:64` — `supabase.rpc as any`
- `src/utils/lazy-load-utils.tsx:26,47` — props casting
- `src/components/animations/GameAnimations.tsx:78-82` — animation types

**Correção**: Criar tipos adequados para o RPC `verify_admin_credentials` e resolver os castings.

---

## 7. SEO — Typos nos Títulos

`EnhancedSEORouter.tsx` (dead code, mas se for reintegrado):
- "Advinhe o Jogador" → "Adivinhe o Jogador" (linhas 18, 24, 37)

---

## 8. Performance — PageSpeed Optimization

- **Excesso de componentes de imagem**: 8 componentes de otimização de imagem em `performance/`, nenhum usado. Adiciona complexidade sem valor.
- **Deferred CSS**: A lógica de `scheduleDeferredStyles` em `main.tsx` adia o CSS principal, o que pode causar FOUC (Flash of Unstyled Content) e prejudicar LCP.
- **`willChange: 'transform'`** em `CriticalImage.tsx` pode criar compositing layers desnecessárias.

---

## Plano de Execução (Priorizado)

### Sprint 1 — Build Fix + Limpeza (Imediato)
1. Fix `main.tsx` build error (linhas 43, 48): `setTimeout` → `globalThis.setTimeout`
2. Deletar 14 arquivos/componentes dead code confirmados
3. Deletar `src/assets/players/` (6 imagens órfãs)
4. Remover `checkAndUnlockAchievements` não utilizado do `AchievementSystemProvider`

### Sprint 2 — Qualidade + Segurança
5. Migrar 216 `console.log` → `logger` (20 arquivos)
6. Reforçar `useAdminAuth` com re-validação server-side
7. Resolver `as any` (3 arquivos)
8. Migrar cores hardcoded em `decades.ts` para tokens semânticos

### Sprint 3 — Performance + PageSpeed
9. Consolidar estratégia de imagem (manter apenas `OptimizedImage` em `ui/`)
10. Avaliar se deferred CSS em `main.tsx` prejudica LCP e simplificar se necessário
11. Corrigir typos SEO se `EnhancedSEORouter` for reintegrado

