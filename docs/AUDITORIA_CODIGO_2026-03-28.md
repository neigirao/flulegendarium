# Auditoria de código — 2026-03-28

## Escopo
Revisão estática do repositório para identificar:
1. exports sem uso aparente;
2. trechos com sinais de implementação incompleta;
3. pontos para limpeza técnica.

> Observação: como não foi possível instalar dependências neste ambiente (bloqueio 403 no npm registry), esta auditoria foi feita por análise estática com `rg` e scripts locais em Python.

## Metodologia
- Busca por ocorrências de símbolos exportados no diretório `src`.
- Busca por marcadores comuns de dívida técnica e instrumentação (`TODO`, `FIXME`, `console.log`, `throw new Error`).
- Validação manual de amostras para reduzir falso positivo.

## Achados principais

### 1) Exports com forte indício de não utilização (dead code)

#### Componentes/guards
- `GameModeCard` parece não estar importado em nenhum outro arquivo.
  - Arquivo: `src/components/GameModeCard.tsx`
- `DataGuard` e `PlayerDataGuard` aparecem apenas no próprio módulo.
  - Arquivo: `src/components/guards/DataGuard.tsx`
- `EnhancedSEORouter` não apresenta consumo no restante de `src`.
  - Arquivo: `src/components/seo/EnhancedSEORouter.tsx`
- `LazyAdminDashboard` e `LazyPlayerRanking` (em `LazyComponents.tsx`) também não aparecem em outros imports.
  - Arquivo: `src/components/LazyComponents.tsx`

#### Hooks utilitários
- `useCriticalImagePreload`, `useGameImagePreload` e `preconnectCriticalOrigins` não têm referências fora do próprio módulo.
  - Arquivo: `src/hooks/use-critical-image-preload.ts`

### 2) Sinais de implementação incompleta / divergência de intenção

- Em `AchievementSystemProvider`, a função retornada por `useAchievements` (`checkAndUnlockAchievements`) é desestruturada, mas não utilizada.
  - Isso sugere migração incompleta entre lógica local e lógica do serviço/hook.
  - Arquivo: `src/components/achievements/AchievementSystemProvider.tsx`

- Ainda em `AchievementSystemProvider`, o parâmetro opcional `playerName` é recebido em `unlockAchievement`, porém não participa da lógica funcional (apenas logging).
  - Possível API não finalizada ou parâmetro legado.
  - Arquivo: `src/components/achievements/AchievementSystemProvider.tsx`

### 3) Excesso de logs em produção (não necessariamente erro, mas custo técnico)

- Há alto volume de `console.log` em funções edge e módulos de performance/imagem.
- Em ambiente de produção, isso pode poluir observabilidade e impactar ruído operacional.

## Plano de ação recomendado (item a item)

### A. Candidatos a dead code

| Item | O que fazer | Critério de decisão | Prioridade |
|---|---|---|---|
| `GameModeCard` | **Remover** se o componente não estiver no roadmap de curto prazo. Se estiver, **mover para pasta `experimental/`** ou adicionar uso real na tela de seleção de modo. | Se não houver referência funcional nem teste até a próxima sprint. | Alta |
| `DataGuard` / `PlayerDataGuard` | **Reintegrar** em telas que já fazem loading/error/empty manualmente, ou **remover** para evitar duplicidade de padrão. | Se reduzir repetição de código em pelo menos 2 telas, manter; senão, remover. | Alta |
| `EnhancedSEORouter` | **Avaliar substituir `SEOManager` atual** por ele ou **remover** para evitar drift entre estratégias de SEO. | Se as rotas/keywords dele estiverem mais completas que a implementação atual, integrar; caso contrário, excluir. | Média |
| `LazyAdminDashboard` / `LazyPlayerRanking` | **Usar** nas rotas/páginas equivalentes (code-splitting real) ou **remover exports**. | Se o bundle tiver ganho perceptível (LCP/TBT), manter; sem ganho, remover. | Média |
| `useCriticalImagePreload` / `useGameImagePreload` / `preconnectCriticalOrigins` | **Conectar no fluxo principal do jogo** (inicialização + pré-carga da próxima jogada) ou remover. | Se reduzir tempo de carregamento de imagem em cenários reais, manter. | Alta |

### B. Implementação possivelmente incompleta

| Item | O que fazer | Risco atual | Prioridade |
|---|---|---|---|
| `checkAndUnlockAchievements` não usado em `AchievementSystemProvider` | Escolher **uma única fonte de verdade**: (1) usar o hook `useAchievements` para a lógica de desbloqueio, ou (2) remover a dependência e manter lógica local. | Divergência funcional e manutenção duplicada. | Alta |
| `playerName` usado só em log | Ou **usar no payload/telemetria/notificação**, ou **remover da assinatura** para simplificar API. | API enganosa (parâmetro sem efeito de negócio). | Média |

### C. Logging

| Item | O que fazer | Critério | Prioridade |
|---|---|---|---|
| `console.log` em edge functions e client | Introduzir wrapper de logger (`debug/info/warn/error`) com gate por ambiente (`NODE_ENV`/feature flag). | Produção sem ruído de debug e com rastreabilidade mínima. | Média |

## Ordem sugerida de execução (prática)

1. **Sprint 1 (rápido e seguro)**
   - Remover/ajustar exports sem uso confirmado.
   - Corrigir assinatura de APIs enganosas (`playerName`).

2. **Sprint 2 (consistência de arquitetura)**
   - Definir fonte de verdade do sistema de conquistas.
   - Integrar ou remover `DataGuard`/`EnhancedSEORouter` conforme decisão arquitetural.

3. **Sprint 3 (performance/observabilidade)**
   - Integrar hooks de preloading crítico com medição objetiva.
   - Implantar política de logging por ambiente.

## Checklist de validação após cada ajuste

- [ ] Busca de referências com `rg` para confirmar remoção/integração.
- [ ] Verificação manual das rotas de jogo/admin impactadas.
- [ ] Build e lint locais (quando o bloqueio do registry for resolvido).
- [ ] Teste de regressão de UX (loading, erro, notificações de conquista).

## Comandos executados na auditoria
- `rg --files`
- `python` (script local para identificar exports sem referências externas)
- `rg -n "TODO|FIXME|HACK|XXX|NotImplemented|throw new Error\(|console\.log\(" src supabase/functions`
- `rg -n "\bGameModeCard\b" src`
- `rg -n "\bDataGuard\b|\bPlayerDataGuard\b" src`
- `rg -n "\bEnhancedSEORouter\b" src`
- `rg -n "\bLazyAdminDashboard\b|\bLazyPlayerRanking\b" src`
- `rg -n "\buseCriticalImagePreload\b|\buseGameImagePreload\b|\bpreconnectCriticalOrigins\b" src`
