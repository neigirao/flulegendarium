# Auditoria Completa — 12 Dimensões

## 1. ENGENHARIA DE SOFTWARE

### Problemas Encontrados

**A. 560+ usos de `console.log`/`console.error` em 51 arquivos do `src/**`
O projeto tem um `logger.ts` centralizado (ADR-002 aceita), mas a migração está incompleta. Arquivos críticos como `executiveAnalyticsService.ts`, `adminBusinessIntelligence.ts`, `reportsService.ts`, `imageOptimizer.ts`, `databaseOptimization.ts` e `dataValidators.ts` usam `console.*` diretamente — contradizendo a política documentada.

**Ação**: Migrar todos os `console.log/error/warn` em `src/` para `logger.*`. Estimar ~51 arquivos afetados.

**B. Hooks excessivamente granulares — proliferação no `/hooks**`
Existem 60+ hooks na raiz de `/hooks`. Muitos são micro-hooks de 20-40 linhas (`use-tab-visibility`, `use-orientation`, `use-touch-gestures`, `use-layout-shift-prevention`, `use-lcp-optimization`) que poderiam ser consolidados em hooks utilitários maiores.

**Ação**: Agrupar hooks de performance (`use-core-web-vitals`, `use-lcp-optimization`, `use-layout-shift-prevention`) em um único `use-performance-monitoring`. Agrupar hooks mobile (`use-mobile-optimization`, `use-orientation`, `use-touch-gestures`, `use-device-detection`) em `use-mobile-capabilities`.

**C. Duplicação de barrel exports**
`src/hooks/admin-stats/index.ts` re-exporta `useOptimizedQueries`, e existe também `src/hooks/use-optimized-queries.ts` na raiz — potencial arquivo órfão ou import duplicado.

**Ação**: Auditar imports e remover arquivo duplicado na raiz.

**D. Ausência de testes**
O diretório `src/test/` e `__tests__/` existem mas sem cobertura significativa mencionada. A meta documentada é 70% de cobertura em hooks críticos.

**Ação**: Priorizar testes unitários para `use-adaptive-guess-game`, `use-jersey-guess-game`, `name-processor`, `reportsService`.

---

## 2. BI (BUSINESS INTELLIGENCE)

### Problemas Encontrados

**A. Aba "Avançado" em BI é placeholder**
Mencionado na auditoria anterior — cards de ML/A-B testing sem dados operacionais permanecem.

**B. Sobreposição de KPIs entre Executivo e BI**
`BusinessIntelligenceDashboard` tem resumo executivo + `ExecutiveAnalyticsDashboard` na aba "Executivo". Métricas como DAU, retenção, conversão aparecem em múltiplos lugares com fontes potencialmente diferentes.

**C. Período desalinhado entre abas**
Cada aba de BI/Relatórios usa `useReportPeriod` localmente — um admin pode ver 7 dias em uma aba e 30 dias em outra sem perceber.

**Ações**:

1. Remover aba "Avançado" ou substituir por dados reais (tendências de churn, impacto de mudanças)
2. Unificar período em estado global compartilhado entre todas as abas admin
3. Criar dicionário de métricas (definição, fórmula, tabela-fonte) em `docs/METRICS_DICTIONARY.md`

---

## 3. TRACKEAMENTO DE DADOS E LOGS

### Problemas Encontrados

**A. Dois caminhos de NPS/Feedback/Tickets/Erros**
`ReportsOverview` renderiza componentes que consultam Supabase diretamente, enquanto `useReports`/`reportsService` cobrem os mesmos domínios. Resultado: lógica duplicada, números potencialmente divergentes.

**B. `reportsService.getNPSReport` converte rating 1-5 para NPS 0-10 com fórmula arbitrária**
`Math.round((f.rating - 1) * 2.25)` — mapeia ratings de forma não-padrão. NPS real requer escala 0-10 nativa.

**C. `response_rate` calculado artificialmente**
`Math.max(10, total*2)` no denominador — não reflete taxa real de resposta.

**D. Funil de 7 etapas implementado mas com fallback legacy**
O sistema tem `funnel_events` mas faz fallback para tabelas legadas (`game_starts`, `game_attempts`, etc.) quando não há dados — isso é bom, mas o fallback legacy não cobre as mesmas 7 etapas, gerando inconsistência no dashboard.

**E. GA4 ID hardcoded**
`G-X2VE77MEYC` está hardcoded em `use-analytics.ts` — deveria ser variável de ambiente.

**Ações**:

1. Unificar em `reportsService` + `useReports` como fonte única (single source of truth)
2. Remover componentes que consultam Supabase diretamente para relatórios (ou migrar para usar o service)
3. Mover GA4 ID para variável de ambiente
4. Criar campo `nps_rating` (0-10) na tabela `user_feedback` ou documentar a conversão explicitamente
5. Remover `response_rate` artificial — exibir "N/D" quando não há dado real

---

---

## 5. JOGABILIDADE

### Problemas Encontrados

**A. Modo Camisas — texto helper incorreto (já corrigido na última sprint)**

**E. Timer customizável (20/30/45s) é ótimo, mas não há feedback visual de urgência**
Falta mudança de cor ou animação quando restam <5 segundos.

**F. Daily Challenges com datas hardcoded**
A tabela `daily_challenges` tem `start_date`/`end_date` fixos — sem rotação automática.

**Ações**:

1. Criar Edge Function para rotação automática de desafios diários
2. Adicionar feedback visual de urgência no timer (cor vermelha + shake nos últimos 5s)

---

## 6. PERFORMANCE DA APLICAÇÃO

### O que está bom

- Lazy loading de rotas com `React.lazy`
- `content-visibility: auto` em seções below-the-fold da home
- Resource hints (preconnect/dns-prefetch) no `index.html`
- `requestIdleCallback` para scripts third-party (GTM, Hotjar, AdSense)
- Image preloading sequencial com cache

### Problemas Encontrados

**A. `getOperationalMetrics` faz 8 queries paralelas ao Supabase**
Cada call busca `user_game_history` com filtros diferentes (hoje, ontem, última hora, 2h atrás) + `game_starts` + `bugs` + `support_tickets`. São 8 round-trips.

**Ação**: Criar uma RPC `get_operational_metrics()` no Supabase que retorne tudo em 1 call.

**B. `getCohortAnalysis` faz O(n*m) loops**
Para cada coorte, itera sobre todos os `gameHistory` para encontrar matches por semana. Com escala, isso será lento.

**Ação**: Mover para RPC com query SQL agregada.

**C. `getUserSegments` carrega TODOS os profiles e game_history**
`select('id, created_at')` sem filtro em `profiles` — carrega todos os usuários.

**Ação**: Paginação ou RPC agregada.

**D. Preload de imagens usa `console.log` em hot path**
`preloadUtils.ts` loga cada imagem precarregada — overhead em produção.

**E. `Math.random()` no `requestIdleCallback` fallback**
`setTimeout(cb, Math.random() * 200 + 100)` — timing não-determinístico.

---

## 7. EVOLUÇÃO DA APLICAÇÃO E QUALIDADE DE CÓDIGO

### O que está bom

- ADRs documentados (`docs/adr/`)
- Hooks de game unificados via `useGameOrchestration`
- Barrel exports organizados
- Logger centralizado (implementação boa, adoção incompleta)
- Feature parity entre 3 modos de jogo

### Problemas

**A. 51 arquivos ainda usando `console.*` direto**
A maior dívida técnica do projeto. Contradiz ADR-002 e a memória `logging-standard`.

**B. Ausência de testes automatizados significativos**
Meta de 70% de cobertura documentada, realidade provavelmente <10%.

**C. Tipagem com casts `as any`/`as unknown**`
Recém-adicionados para corrigir build (ex: `data as unknown as {...}` no Index.tsx, `(report.device_info as any)?.pageUrl`). São band-aids — o correto seria tipar o retorno das RPCs no schema do Supabase.

**D. Services com `console.error` silenciando erros**
`reportsService`, `executiveAnalyticsService`, `adminBusinessIntelligence` — todos fazem `catch → console.error → return []`. Erros desaparecem silenciosamente.

**Ação**: Propagar erros para React Query (que já tem `retry: 2`) e usar `logger.error` com Sentry integration.

---

## 8. ANALYTICS

### O que está bom

- Funil de 7 etapas persistido em `funnel_events` com session_id e device_type
- Dual tracking (GA4 + Supabase)
- Batching de eventos com flush on `beforeunload`
- Analytics hook unificado (`useAnalytics`)

### Problemas

**A. Eventos GA4 não têm `user_id` associado**
O GA4 recebe eventos anônimos — não há `user_id` no payload GA4, apenas no Supabase.

**B. Sem tracking de erros de UI (error boundaries)**
Os error boundaries logam no console mas não persistem em analytics.

**C. Sem tracking de scroll depth**  
Não há métrica de quanto o usuário scrollou na home ou estatísticas — importante para otimizar layout.

**Ações**:

1. Adicionar `user_id` nos eventos GA4 (se LGPD permitir, ou usar hash)
2. Persistir erros de error boundaries em `funnel_events` com `event_type: 'error'`
3. Implementar scroll depth tracking na home e estatísticas

---

## 9. ESTATÍSTICAS (Página Pública)

### O que está bom

- Data storytelling com narrativa emocional
- 14 componentes de stats cobrindo jogadores + camisas
- Dados reais do Supabase (sem mocks)
- JSON-LD BreadcrumbList para SEO
- `content-visibility: auto` para performance

### Problemas

**A. Sem filtro de período na página pública**
O torcedor vê "todos os tempos" — não consegue filtrar por "esta semana" ou "este mês".

**B. Sem comparação temporal**
Não há "crescimento vs mês passado" ou sparklines de tendência.

**C. Falta seção de "Recordes"**
Maior score, maior streak, partida mais rápida — dados que existem mas não são exibidos.

**D. Sem ranking por modo de jogo na página pública**
A home tem `GameTypeRankings` mas a página de stats não segmenta por modo.

**Ações**:

1. Adicionar filtro de período (7d, 30d, 90d, all-time)
2. Criar seção de Recordes com dados reais
3. Adicionar sparklines de tendência nos cards principais

---

## 10. UX E DESIGN

### Problemas Encontrados

**A. Onboarding incompleto**
`useOnboarding` e `CoachMark` existem no orchestration mas não há evidência de tutorial visual para novos jogadores.

**B. Sem feedback de loading nos games**
Quando o jogo está carregando jogadores, não há skeleton ou indicação clara.

**C. Skip button pouco visível**
O botão "Pular" é secundário e pequeno — em mobile pode ser difícil de encontrar.

**D. Sem confirmação antes de sair do jogo**
Se o torcedor está no meio de uma partida e clica na nav, perde tudo sem aviso.

**E. Formulário de ranking pós-jogo pode ser confuso para guest**
O flow guest name → ranking não está documentado como sendo claro.

**Ações**:

1. Implementar onboarding visual (3 steps overlay) na primeira visita
2. Adicionar skeleton loader nos game containers
3. Implementar `beforeunload` warning durante jogo ativo
4. Aumentar visibilidade do skip button em mobile

---

## 11. BELEZA

### O que está bom

- Tema warm implementado com identidade tricolor
- Tipografia com `font-display` e `font-body` separados
- Cards com `shadow-sm` e `border-border` consistentes
- Animações com Framer Motion nas estatísticas

### O que pode melhorar

**B. Sem micro-animações de feedback**
Acerto/erro no quiz não tem animação satisfatória (confetti existe mas poderia ter shake no erro, pulse no acerto).

**C. Footer inexistente**
A home termina abruptamente no Instagram. Falta um footer com links úteis (FAQ, Doações, Estatísticas, Instagram, Contato).

**D. Ícones genéricos**
Os ícones vêm do Lucide — funcionais mas sem personalidade. Ícones custom (bola, escudo, camisa) dariam mais identidade.

**E. Sem dark mode**
O tema warm é claro. Muitos torcedores jogam à noite — dark mode com tons grená/verde escuro seria desejável.

---

## 12. INOVAÇÃO

### Funcionalidades Inovadoras Sugeridas

**A. "Modo Narrador"**
Ao acertar um jogador, tocar um áudio de narração icônica (ex: "GOOOOL do Fred!" — com TTS ou clips licenciados). Diferencial emocional único.

**B. "Modo Multiplayer Assíncrono"**
Desafiar amigos via link (já existe `user_challenges` mas não está integrado ao flow principal). Tornar o link de desafio a experiência primária de compartilhamento.

**C. "Figurinhas Colecionáveis" (já parcial)**  
`element_cards` e `user_cards` existem — isso é um sistema de figurinhas/cards que parece não estar exposto na UI principal. Criar uma galeria de figurinhas colecionáveis de ídolos seria um diferencial massivo.

---

## RESUMO DE PRIORIDADES

### Fase 1 — Dívida Técnica (1-2 sprints)

1. Migrar 51 arquivos de `console.*` para `logger.*`
2. Unificar fonte de relatórios (eliminar duplicação service vs componente direto)
3. Remover placeholders/mocks (aba BI Avançado, response_rate artificial)
4. Mover GA4 ID para env var
5. Propagar erros nos services para React Query + Sentry

### Fase 2 — Jogabilidade + UX (2-3 sprints)

6. Feedback visual de urgência no timer
7. Onboarding visual para novos jogadores
8. Footer na home
9. Skeleton loaders nos games
10. Rotação automática de daily challenges

### Fase 3 — Performance + Analytics (1-2 sprints)

13. RPCs agregadas para `getOperationalMetrics` e `getCohortAnalysis`
14. Período global unificado no admin
15. Scroll depth tracking
16. Error boundary → analytics persistence

### Fase 4 — Inovação + Beleza (2-3 sprints)

17. Galeria de figurinhas colecionáveis (expor sistema de cards existente)
18. Multiplayer assíncrono (expor user_challenges)
19. Dark mode
20. Filtro de período nas stats públicas
21. Modo Quiz ao Vivo em dias de jogo