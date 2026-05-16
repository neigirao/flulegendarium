# Índice do Código para IA (Fonte Rápida)

> Objetivo: permitir que uma IA encontre **onde mexer** sem percorrer o repositório inteiro no escuro.

## 1) Entrada da aplicação (ordem real de boot)

1. `src/main.tsx` monta o React e inicializa Sentry de forma lazy.
2. `src/App.tsx` registra providers globais (QueryClient, Router, Auth, UX, Error Boundaries).
3. Rotas são definidas em `src/App.tsx` com páginas core e módulos lazy.

## 2) Rotas principais e ownership

| Rota | Página/container principal | Área funcional | Guard |
|---|---|---|---|
| `/` | `src/pages/Index.tsx` | Home e entrada do produto | — |
| `/auth` | `src/pages/Auth.tsx` (lazy) | Login / cadastro | — |
| `/selecionar-modo-jogo` | `src/pages/GameModeSelection.tsx` (lazy) | Seleção de modo | ProtectedRoute |
| `/quiz-adaptativo` | `src/pages/AdaptiveGuessPlayerSimple.tsx` | Jogo adaptativo | ProtectedRoute |
| `/quiz-decada` | `src/pages/DecadeGuessPlayerSimple.tsx` | Jogo por década | ProtectedRoute |
| `/quiz-camisas` | `src/pages/JerseyQuizPage.tsx` (lazy) | Quiz de camisas | ProtectedRoute |
| `/estatisticas` | `src/pages/EstatisticasPublicas.tsx` (lazy) | Ranking público | — |
| `/admin` e `/admin/dashboard` | `src/pages/Admin.tsx` (lazy) | Painel administrativo | AdminRouteGuard |
| `/noticias` e `/noticias/:slug` | `src/pages/NewsPortal.tsx`, `src/pages/NewsArticle.tsx` (lazy) | Portal de notícias | — |

## 3) Mapa por responsabilidade (para diagnóstico rápido)

| Se você precisa... | Primeiro olhar | Depois olhar |
|---|---|---|
| Corrigir fluxo visual/UX | `src/components/**` | `src/pages/**` |
| Corrigir regra de jogo | `src/hooks/game/**` e hooks de modo | `src/services/**` |
| Corrigir persistência/supabase | `src/services/**` | `src/integrations/supabase/**` e `supabase/functions/**` |
| Corrigir contrato/validação | `src/schemas/**`, `src/types/**` | chamadas de service/hook |
| Corrigir erros de imagem | `src/utils/player-image/**`, `src/utils/jersey-image/**` | componentes de imagem e guards |
| Corrigir estado global | `src/stores/**` | hooks consumidores |

## 4) Estrutura atual (contagem aproximada de arquivos TS/TSX)

- `src/components`: ~252 (inclui JerseyHudBar, JerseyEducationalReveal, QuizFeedbackZone, ProgressDots, ProtectedRoute)
- `src/hooks`: 94
- `src/utils`: 55
- `src/pages`: 22
- `src/services`: 16
- `src/schemas`: 8
- `src/types`: 8
- `src/stores`: 4
- `src/integrations`: 2

Novos componentes de jogo relevantes:
- `src/components/jersey-game/JerseyHudBar.tsx` — HUD horizontal do quiz de camisas
- `src/components/jersey-game/JerseyEducationalReveal.tsx` — card de revelação pós-resposta
- `src/components/guess-game/QuizFeedbackZone.tsx` — feedback inline (idle/correct/wrong)
- `src/components/guess-game/ProgressDots.tsx` — 10 pontos de progresso
- `src/components/guards/ProtectedRoute.tsx` — guard de autenticação para rotas de jogo

> Use essa proporção para estimar esforço. Mudanças em `components/` podem ter alto impacto visual; mudanças em `hooks/services` tendem a impactar regras.

## 5) Procedimento padrão para IA (checklist curto)

1. Identificar rota/fluxo impactado.
2. Localizar camada primária (`components`, `hooks`, `services`, etc.).
3. Confirmar contrato (`types/schemas`) antes de editar lógica.
4. Aplicar menor alteração possível.
5. Executar validação mínima (`npm run lint` + testes afetados).
6. Atualizar docs tocados (README + docs específicos).

## 6) Limites para evitar regressão

- Não duplicar regra de negócio em componente visual.
- Não acessar Supabase direto em componente, preferir service/hook.
- Não alterar pontuação/dificuldade sem revisar hooks de jogo e testes.
- Não mudar fallback de imagem sem revisar `utils/player-image` e `utils/jersey-image`.

## 7) Arquivos de documentação que devem ser lidos antes de mudanças maiores

1. `docs/ARCHITECTURE.md`
2. `docs/AI_GUIDE.md`
3. `docs/ERROR_TRIAGE.md`
4. `docs/IMAGE_ERROR_PREVENTION.md`
5. `docs/CONTRIBUTING.md`

## 8) Convenção de resposta recomendada para agentes

Sempre responder com:

- **Hipótese** (por que o problema acontece)
- **Plano mínimo** (o que será alterado)
- **Arquivos tocados**
- **Validação executada**
- **Riscos e rollback**

Esse formato reduz ambiguidades e facilita auditoria humana.
