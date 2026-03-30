# Auditoria Completa — Achados Residuais e Novos

## Status do Plano Anterior

O Sprint 1 (build fix + dead code) e Sprints 2/3 foram parcialmente executados. Restam itens pendentes e novos problemas identificados.

---

## Achados Organizados por Prioridade

### CRÍTICO — Dado Mockado em Produção

1. `**src/components/admin/bi/OperationalDashboard.tsx` linha 154** — `Math.floor(Math.random() * 5 + 1)min` como badge de "Atualizado há Xmin". Isso é dado fake visível ao admin. Substituir por timestamp real da última query ou remover o badge.
2. `**src/hooks/useAdminAuth.ts` linhas 93-100** — Variável chamada `mockUser` cria um objeto User fabricado com email fake `admin@admin.local`. Renomear para `adminUser` e remover o email fabricado (usar apenas o username retornado do RPC).

### ALTO — Dead Code Restante (não deletado no sprint anterior)

3. `**src/utils/performance/imageOptimizer.ts**` — Classe `ImageOptimizer` com 6 `console.log`. Zero imports em todo o projeto. Deletar.
4. `**src/utils/performance/databaseOptimization.ts**` — Utilitários `optimizedQueries`, `dbPerformance`, `realtimeOptimization` com `console.log`. Zero imports. Deletar.
5. `**src/utils/performance/cacheOptimization.ts**` e `**cacheStrategy.ts**` — Verificar se possuem imports; se não, deletar.
6. `**src/utils/errorReporting.ts**` — Usado apenas em 1 arquivo (`problemTracking.ts`). Contém `console.log` na linha 86 e registra global error handlers que duplicam o Sentry. Avaliar se `problemTracking` pode usar `logger` diretamente e deletar `errorReporting.ts`.

### ALTO — console.log Remanescentes (11 arquivos, ~30 ocorrências)

Arquivos que ainda usam `console.log` ao invés de `logger`:


| Arquivo                                         | Ocorrências                | Ação                          |
| ----------------------------------------------- | -------------------------- | ----------------------------- |
| `src/utils/performance/imageOptimizer.ts`       | 5                          | Deletar arquivo (dead code)   |
| `src/utils/performance/databaseOptimization.ts` | 4                          | Deletar arquivo (dead code)   |
| `src/utils/errorReporting.ts`                   | 1                          | Migrar para logger ou deletar |
| `src/utils/player-image/preloadUtils.ts`        | 4                          | Migrar para `logger.debug`    |
| `src/utils/sentry.ts`                           | 2 (linhas 111, 119)        | Migrar para `logger.info`     |
| `src/hooks/use-devtools-detection.ts`           | 1 (intencional anti-cheat) | Manter (propósito específico) |


### MÉDIO — Cores Hardcoded (Migração Semântica Incompleta)

A migração para tokens semânticos foi feita em `decades.ts`, mas **49 arquivos** ainda usam cores hardcoded (`text-green-600`, `text-purple-600`, `bg-yellow-500`, `text-flu-grena`, `bg-gray-200`, etc.). Principais:


| Arquivo                      | Exemplos                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| `OperationalDashboard.tsx`   | `text-flu-grena`, `text-yellow-500`, `bg-yellow-100`, `text-purple-600`, `border-red-200`, `bg-red-50` |
| `RetentionMetricsCard.tsx`   | `text-green-600`, `bg-green-50`, `text-purple-600`, `bg-purple-50`                                     |
| `ScoreDistributionChart.tsx` | `text-green-600`, `text-yellow-600`                                                                    |
| `DifficultySection.tsx`      | `text-green-600`, `text-blue-600`, `text-yellow-600`, `text-orange-600`, `text-red-600`                |
| `NPSReport.tsx`              | `text-green-600`, `text-red-600`, `text-gray-600`, `bg-gray-200`                                       |
| `SkeletonLoader.tsx`         | `bg-gray-200` (8 ocorrências)                                                                          |


**Ação**: Migrar os componentes admin para tokens semânticos (`text-success`, `text-warning`, `text-destructive`, `bg-muted`, `text-muted-foreground`).

### MÉDIO — placeholder.svg como Fallback (9 arquivos)

`/placeholder.svg` é um SVG genérico do Vite. Componentes admin usam isso como fallback de imagem em `onError`. Deveria usar a imagem padrão do projeto (`defaultImage` de `src/utils/player-image/constants.ts`) ou uma imagem de fallback específica.

### BAIXO — Sentry com console.log

`src/utils/sentry.ts` linhas 111 e 119 usam `console.log` para confirmar inicialização. Migrar para `logger.info`.

---

## Plano de Execução

### Sprint 1 — Dados Mockados + Dead Code (Crítico)

1. Remover `Math.random()` do badge em `OperationalDashboard.tsx` — usar timestamp real ou texto estático "Tempo real"
2. Renomear `mockUser` para `adminUser` em `useAdminAuth.ts`
3. Deletar `src/utils/performance/imageOptimizer.ts` (zero imports)
4. Deletar `src/utils/performance/databaseOptimization.ts` (zero imports)
5. Verificar e deletar `cacheOptimization.ts` e `cacheStrategy.ts` se não usados

### Sprint 2 — Segurança + Logging

6. Criar RPC `verify_admin_session(p_admin_id uuid)` para re-validação real
7. Atualizar `useAdminAuth.ts` para usar a nova RPC no `checkAuth`
8. Migrar `console.log` restantes para `logger` em `preloadUtils.ts` e `sentry.ts`
9. Avaliar e limpar `errorReporting.ts` (duplica Sentry)

### Sprint 3 — Tokens Semânticos no Admin

10. Migrar cores hardcoded nos 6 componentes admin prioritários para tokens semânticos
11. Substituir `/placeholder.svg` por imagem de fallback do projeto nos componentes admin