# Auditoria Completa da Aplicação "Lendas do Flu"

Análise abrangente em 6 eixos: Engenharia de Software, SEO, Design, UX, Performance e Dados.

---

## 1. ENGENHARIA DE SOFTWARE

### Problemas Estruturais

**1.1 Proliferação de hooks (68+ arquivos em /hooks)**
O diretório possui 68+ hooks, muitos com responsabilidades sobrepostas. Exemplo: `use-analytics.ts`, `use-enhanced-analytics.ts`, `use-funnel-analytics.ts`, `use-business-intelligence.ts`, `use-executive-analytics.ts` — 5 hooks de analytics com overlapping. Isso dificulta manutenção e aumenta bundle.

- **Ação**: Consolidar em no máximo 2 hooks de analytics (`useAnalytics` + `useAdminAnalytics`). Eliminar camadas intermediárias.

**1.2 Bug no useAnalytics — eventQueue fora do estado React**
`use-analytics.ts` declara `eventQueue` e `batchTimer` como variáveis locais no corpo do hook, não como `useRef`. Cada re-render cria novas variáveis, perdendo eventos em fila. Isso é um bug silencioso.

- **Ação**: Migrar `eventQueue` e `batchTimer` para `useRef`.

**1.3 console.log em produção (services)**
`gameHistoryService.ts` possui 7+ `console.log` diretos que não passam pelo `logger.ts`. Em produção com `esbuild.drop: ['console']`, são removidos, mas indicam falta de disciplina — podem mascarar problemas em dev.

- **Ação**: Substituir todos os `console.log` por `logger.info/debug` nos services.

**1.4 Tipos duplicados de Player**
`Player` está definido em: `src/types/guess-game.ts`, `src/services/playerDataService.ts`, `src/components/seo/DynamicSEO.tsx` (interface local). Fonte única de verdade inexistente.

- **Ação**: Usar apenas `src/types/guess-game.ts` como fonte canônica. Remover interfaces locais.

**1.5 Excesso de componentes no guess-game (26 arquivos)**
O diretório `src/components/guess-game/` tem 26 componentes. Muitos são variações (GameContainer vs AdaptiveGameContainer vs BaseGameContainer). Complexidade alta para manutenção.

- **Ação**: Unificar GameContainer/AdaptiveGameContainer usando composição, não duplicação.

**1.6 Falta de testes unitários**
Diretório `__tests__` existe mas cobertura é mínima. Meta declarada de 70% em 90 dias (memória do projeto) não está sendo atingida.

- **Ação**: Priorizar testes nos hooks críticos de game state.

---

## 2. SEO

### Problemas Encontrados

**2.1 Structured Data duplicado — SEOHead + DynamicSEO + StructuredData**
Três componentes geram JSON-LD independentemente:

- `SEOHead.tsx` cria `script[type="application/ld+json"]` sem data-attribute
- `DynamicSEO.tsx` cria `script[data-dynamic]`
- `StructuredData.tsx` cria `script[data-structured]`

Resultado: múltiplos JSON-LD na mesma página, potencialmente conflitantes.

- **Ação**: Unificar em um único componente `SEOManager` que receba tipo e dados, eliminando duplicação.

**2.2 Canonical dinâmico aponta para rota SPA, não slug**
`DynamicSEO.tsx` gera canonical como `https://lendasdoflu.com/quiz-adaptativo`, o que é correto, mas a URL `/jogar` referenciada no StructuredData (Game type) não existe — 404.

- **Ação**: Corrigir URL no StructuredData Game para `/selecionar-modo-jogo`.

**2.3 SearchAction no StructuredData aponta para /search que não existe**
`StructuredData.tsx` WebSite type define `potentialAction.target` como `/search?q=...` — essa rota não existe. Google pode marcar como erro.

- **Ação**: Remover SearchAction ou implementar a rota de busca.

**2.4 Meta tags article:published_time no index.html**
O `index.html` inclui `article:published_time` e `article:section` que são para artigos, não para a home de um jogo. Isso confunde crawlers.

- **Ação**: Remover meta tags de article do index.html.

**2.5 Sem sitemap.xml e robots.txt configurados**
Não encontrei evidência de sitemap.xml ou robots.txt no projeto.

- **Ação**: Criar `public/sitemap.xml` e `public/robots.txt` estáticos.

---

## 3. DESIGN

### Problemas Encontrados

**3.1 Falta de design tokens consistentes**
CSS crítico inline no `index.html` define `.flu-grena` e `.flu-verde`, mas o app usa `bg-primary`, `bg-secondary` via Tailwind. Duas fontes de verdade para cores.

- **Ação**: Garantir que os tokens CSS (`--flu-grena`, etc.) sejam os mesmos que `--primary` no Tailwind config.

**3.2 Hero section sem imagem visual**
A hero section é apenas texto + botão. Para um quiz de futebol, falta impacto visual (escudo, foto de jogador, ilustração). O `og-image` existe mas não é usado na UI.

- **Ação**: Adicionar elemento visual (logo ou ilustração) na hero section.

**3.3 Excesso de sections com content-visibility na home**
4 sections usam `content-visibility: auto` com `containIntrinsicSize` fixo. Se o tamanho real divergir, causa "jump" ao scrollar.

- **Ação**: Revisar valores de `containIntrinsicSize` para refletir tamanhos reais ou usar apenas em seções longe do viewport.

---

## 4. UX (HEURISTICAS DE NIELSEN)

### Avaliação por Heurística


| Heurística                        | Nota | Problema                                                                           |
| --------------------------------- | ---- | ---------------------------------------------------------------------------------- |
| 1. Visibilidade do status         | 6/10 | Timer existe, mas falta feedback de progresso geral (ex: "Pergunta 3 de 10") claro |
| 2. Correspondência com mundo real | 8/10 | Linguagem tricolor adequada                                                        |
| 3. Controle do usuário            | 5/10 | Não há "Desfazer" no guess; X do GameOver não fecha o dialo                        |
| 4. Consistência                   | 6/10 | 3 game containers diferentes com UX ligeiramente distinta                          |
| 5. Prevenção de erros             | 7/10 | GuessConfirmDialog existe, bom                                                     |
| 6. Reconhecimento > lembrança     | 7/10 | &nbsp;                                                                             |
| 7. Flexibilidade                  | 4/10 | Sem atalhos de teclado funcionais (hook existe mas não é evidente)                 |
| 8. Estética minimalista           | 7/10 | Clean, mas home muito textual                                                      |
| 9. Ajudar recuperação de erros    | 7/10 | Error boundaries em todos os jogos                                                 |
| 10. Ajuda e documentação          | 6/10 | Tutorial existe, FAQ existe, mas CoachMarks são descartados rápido                 |


**Ações prioritárias**:

- Unificar experiência dos 3 modos de jogo (GameContainer, AdaptiveGameContainer, JerseyGameContainer)
- Tornar atalhos de teclado visíveis (hint no rodapé do jogo)
- Adicionar indicador claro de progresso ("Acerto 3 de N")

---

## 5. PERFORMANCE

### Problemas Remanescentes

**5.1 Third-party scripts no** &nbsp; **bloqueiam render**
GTM, Hotjar e AdSense estão no `<head>` do `index.html`. Mesmo com `async`, cada um dispara DNS lookups e conexões TCP que competem com recursos críticos.

- **Ação**: Mover GTM/Hotjar/AdSense para após o `<body>`, ou carregar via `requestIdleCallback` no `main.tsx`.

**5.2 framer-motion (82KB) carregado eagerly**
Usado em componentes lazy, mas importado estaticamente dentro deles. Sem dynamic import.

- **Ação**: (Baixa prioridade) Considerar substituir por CSS transitions onde possível.

**5.3 AdvancedServiceWorker registra e faz polling a cada 60s**
`setInterval(() => registration.update(), 60000)` — polling agressivo desnecessário. Também solicita permissão de notificação no primeiro clique, o que é UX ruim.

- **Ação**: Remover polling de 60s (updates são detectados naturalmente). Remover auto-request de notificação.

**5.4 Preload de hero image (580KB PNG) no index.html**
Linha 11: `<link rel="preload" href="...png" fetchpriority="high">` — mas a imagem foi convertida para WebP e o caminho mudou. Preload está apontando para imagem inexistente ou desatualizada.

- **Ação**: Atualizar o preload para o novo `.webp` ou remover se não é mais a LCP image.

---

## 6. DADOS

### Problemas Encontrados

**6.1 Queries não paginadas no admin**
`useOptimizedQueries.ts` → `getPlayerAttempts()` faz `select('target_player_name, is_correct')` sem `.limit()`. Em tabelas grandes, isso puxa TODOS os registros. Risco de timeout e memória.

- **Ação**: Implementar aggregation via SQL/RPC no Supabase em vez de buscar todos os registros e contar no client.

**6.2 Rankings limitados a 50 sem paginação**
`getRankings(limit = 50)` — adequado para agora, mas sem opção de paginação para o futuro.

**6.3 Analytics duplicado — GA4 + Hotjar + Supabase custom events + Sentry**
4 ferramentas de tracking rodando simultaneamente:

- Google Analytics (GA4) via gtag
- Hotjar via script
- Funnel analytics custom no Supabase
- Sentry para erros

Cada uma adiciona JS e latência. Os eventos custom no Supabase (`use-funnel-analytics.ts` escreve na tabela `funnel_events`) duplicam o que o GA4 já trackeia.

- **Ação**: Decidir fonte única de verdade para funil. Manter GA4 para funil de marketing + Supabase apenas para métricas de jogo. Eliminar tracking duplicado.

**6.4 Contagens na home fazem queries individuais**
`Index.tsx` faz 3 queries separadas (`player-count`, `jersey-count`, `today-players`). Poderiam ser uma única RPC.

- **Ação**: Criar uma RPC `get_home_stats()` que retorne as 3 contagens em uma chamada.

---

## RESUMO PRIORIZADO

### P0 — Bugs e Incorreções

1. Fix `useAnalytics` eventQueue (bug de perda de eventos)
2. Atualizar preload de imagem no index.html (aponta para PNG antigo)
3. Remover SearchAction do StructuredData (URL inexistente)
4. Remover meta tags `article:*` do index.html

### P1 — Engenharia e Performance

5. Unificar JSON-LD em componente único (SEOHead + DynamicSEO + StructuredData → SEOManager)
6. Consolidar hooks de analytics (5 → 2)
7. Mover third-party scripts para lazy load
8. Remover polling de 60s do ServiceWorker e auto-request de push notification
9. Criar RPC `get_home_stats()` para unificar queries da home

### P2 — UX e Design

10. Unificar GameContainers (3 → 1 com composição)
11. Adicionar indicador de progresso claro nos jogos
12. Adicionar visual na hero section
13. Criar sitemap.xml e robots.txt

### P3 — Dívida Técnica

14. Consolidar tipo Player (3 definições → 1)
15. Substituir console.log por logger nos services
16. Migrar aggregation de dados admin para server-side (RPC)
17. Aumentar cobertura de testes