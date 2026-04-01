# Análise 360° da Área Admin (2026-03-28)

## Escopo revisado
- Página principal do admin e navegação por abas.
- Fluxo de autenticação de administrador.
- Dashboards de BI, relatórios e dados operacionais.
- Camada de serviços/hook para relatórios e inteligência de negócio.

Arquivos-base avaliados:
- `src/pages/Admin.tsx`
- `src/pages/AdminLogin.tsx`
- `src/hooks/useAdminAuth.ts`
- `src/hooks/use-reports.ts`
- `src/services/reportsService.ts`
- `src/services/adminBusinessIntelligence.ts`
- `src/components/admin/bi/OperationalDashboard.tsx`

---

## 1) Design (UI)

### Achados
1. **Boa base visual**, com hierarquia clara no topo, cartões e tabs organizadas.
2. **Densidade de navegação alta** na tela principal: 8 abas de primeiro nível + sub-abas dentro de Dashboard/BI, o que pode aumentar carga cognitiva.
3. **Risco de inconsistência visual** por uso de estilos inline/strings locais (classes definidas no componente) em vez de tokens/componentes de layout semânticos por domínio.

### Melhorias sugeridas
- Reorganizar IA (information architecture) em macrogrupos:
  - **Operação**: Dashboard, Usuários, Gerenciar, Adicionar.
  - **Qualidade**: Imagens, Erros, Tickets, Feedback.
  - **Estratégia**: BI (Executivo/Coorte/Segmentação).
- Adotar um **`AdminShell`** com slots (`header`, `sidebar`, `content`) para reduzir repetição de estilos.
- Definir **guidelines de componentes de métricas** (cards, badges de status, skeletons, empty states) para consistência.

---

## 2) UX

### Achados
1. **Redirecionamento com `window.location.href`** no login e na página admin causa recarga completa e piora a experiência percebida.
2. Falta de **controle de acesso por rota com guard declarativo** (há validação no componente, mas não há rota protegida dedicada).
3. A interface mostra muitas funcionalidades simultâneas; para admin recorrente isso é bom, para admin eventual pode ser confuso.

### Melhorias sugeridas
- Trocar redirects imperativos por `navigate`/`<Navigate />` dentro de guard de rota.
- Implementar **`AdminRouteGuard`** com estados explícitos: loading, não autenticado, autenticado.
- Persistir **última aba visitada** do admin (ex.: query string `?tab=...`) para continuidade de contexto.
- Criar **empty states orientados a ação** em cada aba (ex.: “sem tickets hoje”, “sem erros críticos”).

---

## 3) Performance

### Achados
1. O admin é lazy-load no roteamento, porém a página principal importa muitos módulos pesados de uma vez.
2. `useReports(days)` dispara 5 queries em paralelo; bom para throughput, mas pode gerar picos e competição por rede.
3. Há consultas de BI com `select('*')` em tabelas com potencial de crescimento alto, o que degrada custo e latência.

### Melhorias sugeridas
- **Code splitting por aba do admin** (import dinâmico por `TabsContent`) para reduzir JS inicial.
- Em BI/reports, substituir `select('*')` por projeção mínima de colunas.
- Adicionar limites de janela e agregação server-side (views/materialized views/RPC).
- Definir budgets de performance do admin:
  - TTI p95 admin < 2.5s em desktop.
  - Query p95 por widget < 800ms.

---

## 4) Engenharia de software

### Achados
1. `useAdminAuth` mantém sessão de admin em `localStorage` com mock de usuário; funcional, mas frágil como modelo de segurança e auditoria.
2. Existem aliases de compatibilidade (`isAdmin`, `loading`) que aumentam ambiguidade sem contrato explícito.
3. Ainda há pontos com `console.error` em componentes administrativos, misturando padrões de observabilidade.

### Melhorias sugeridas
- Criar **BFF/RPC de sessão admin** com token de curta duração e renovação controlada (evitar sessão “mock” no cliente).
- Evoluir `useAdminAuth` para máquina de estados (`unauthenticated | loading | authenticated | error`).
- Padronizar logs em um único `logger` com contexto (`feature=admin`, `tab=...`, `action=...`).
- Introduzir testes de integração para fluxo crítico:
  - login admin,
  - troca de abas,
  - operações de CRUD,
  - logout.

---

## 5) Engenharia de dados

### Achados
1. Métricas são computadas no front em múltiplos pontos, com regras de negócio embutidas no client.
2. Há sinais de cálculo por aproximação em alguns indicadores e status operacionais sem baseline anterior real (ex.: `previous_value: 0` em parte das métricas).
3. Risco de divergência semântica entre dashboards por ausência de camada semântica única de métricas.

### Melhorias sugeridas
- Criar **camada semântica de métricas** no banco (views `admin_kpi_daily`, `admin_support_daily`, etc.).
- Padronizar:
  - timezone de corte,
  - granularidade (dia/hora),
  - dicionário de métricas (fórmula, owner, fonte).
- Adotar trilha de qualidade de dados:
  - freshness,
  - completude,
  - consistência entre fontes.

---

## 6) Cientista de dados

### Achados
1. Segmentação e retenção são úteis, mas ainda com regras heurísticas fixas e pouca validação estatística contínua.
2. Algumas métricas compostas (engagement score) têm pesos arbitrários e podem induzir decisões sem calibragem.
3. Falta versionamento explícito de definições analíticas para comparabilidade histórica.

### Melhorias sugeridas
- Versionar métricas e modelos (`metric_version`, `segment_version`).
- Medir estabilidade de segmentos mês a mês (drift/population shift).
- Implantar avaliação contínua:
  - coortes por canal de aquisição,
  - uplift de campanhas de reativação,
  - precisão de alertas (falsos positivos).
- Publicar “fichas técnicas” das métricas críticas (interpretação + limitações).

---

## 7) Produto

### Achados
1. O admin já atende operação + analytics + conteúdo, porém sem priorização explícita por “modo de trabalho” (diário/semanal/mensal).
2. Há riqueza de dados, mas pouca orientação de “próxima ação” diretamente na UI.

### Melhorias sugeridas
- Estruturar o admin por **cadência operacional**:
  - Diário: alertas, erros, tickets, imagens.
  - Semanal: funil, engajamento, retenção curta.
  - Mensal: coortes, segmentação, impacto de releases.
- Cada card crítico deve responder: **“o que aconteceu?”, “por que?”, “o que fazer agora?”**.
- Criar backlog de melhorias orientado por impacto esperado (ICE/RICE).

---

## 8) Arquiteto

### Achados
1. Concentração de lógica analítica no frontend aumenta acoplamento UI+dado e custo de manutenção.
2. Fronteira entre “camada operacional” e “camada analítica” não está formalizada.
3. Segurança/admin auth ainda muito client-driven.

### Melhorias sugeridas
- Propor arquitetura alvo em 3 camadas:
  1. **Presentation** (React/Tabs/widgets).
  2. **Application** (hooks/use-cases com contratos estáveis).
  3. **Data/Analytics** (RPC/views/ETL leve + catálogos).
- Definir contratos tipados por domínio (`AdminAuthService`, `AdminMetricsService`, `AdminContentService`).
- Isolar cálculos críticos no backend para auditabilidade e reproducibilidade.

---

## 9) Torcedor tricolor 🟢🔴⚪

### Achados
1. O painel já tem boa identidade de clube e foco em conteúdo histórico.
2. Falta transformar dados em “energia de arquibancada”: insights que conectem operação com paixão.

### Sugestões com alma de arquibancada
- “**Termômetro Tricolor**” diário com status do jogo da comunidade (engajamento, moral, dificuldade).
- Alertas com linguagem mais humana: “A torcida esfriou hoje, bora puxar desafio novo?”.
- Destaque semanal: “**Lenda da Semana**” (jogador com maior curiosidade/engajamento).
- Modo campanha temática em datas-chave do clube (aniversário, títulos marcantes).

---

## Plano de execução sugerido

### Sprint 1 (quick wins)
1. Substituir redirects por guard de rota.
2. Code split por aba do admin.
3. Padronizar logs e remover `console.error` do fluxo admin.

### Sprint 2
4. Consolidar camada de métricas (views/RPC).
5. Dicionário de métricas + badges de confiabilidade (`Real`, `Estimado`, `Indisponível`).
6. Revisar KPIs com produto + dados.

### Sprint 3
7. Evoluir segmentação/coortes com versionamento analítico.
8. Implementar trilha de ações recomendadas no dashboard.
9. Introduzir “Termômetro Tricolor” como feature de engajamento.

---

## Prioridade geral (resumo)
1. **Segurança/autenticação admin**.
2. **Confiabilidade de métricas e camada semântica**.
3. **Performance e modularização por aba**.
4. **UX orientada a ação**.
5. **Narrativa de produto com identidade tricolor**.
