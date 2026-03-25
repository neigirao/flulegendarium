# Auditoria de Relatórios do Admin (2026-03-25)

## Escopo analisado
- Aba **Relatórios** do admin (NPS, Feedback, Support, Erros, Engagement).
- Aba **BI** (Executivo, Operacional, Segmentos, Coortes, Avançado).
- Fontes de dados (hooks e services) para identificar: dados reais vs sintéticos.

## 1) Relatórios necessários no admin (prioridade recomendada)

### Tier 1 — Essenciais para operação semanal
1. **Funil de conversão executivo** (home → início de jogo → conclusão → ranking/share): mede perdas por etapa e impacto de mudanças de UX.
2. **Engajamento de usuário (DAU, novos, retornantes, sessão, bounce)**: saúde de adoção/uso recorrente.
3. **Feedback/NPS unificados**: termômetro de satisfação + motivos qualitativos.
4. **Incidentes/Erros reais** (com severidade, tendência e SLA): visibilidade de risco técnico.

### Tier 2 — Essenciais para operação de suporte/conteúdo
5. **Tickets de suporte** (backlog, aging, SLA, prioridade).
6. **Imagens reportadas por usuários** (pendente/resolvido, reincidência por item).
7. **Dificuldade por jogador/conteúdo** (balanceamento de conteúdo e curadoria).

### Tier 3 — Estratégicos/mensais
8. **Coortes de retenção** (W1, W2, W4, W12).
9. **Segmentação comportamental** (campeões, fiéis, casuais, risco) — útil para CRM, mas precisa robustez metodológica.
10. **Distribuição de score** para calibrar dificuldade geral.

## 2) O que já está com dados reais vs sintéticos

## ✅ Com dados reais (consultando Supabase)
- **NPS (componente)** usa `user_feedback` diretamente.
- **Feedback qualitativo** usa `user_feedback`.
- **Support tickets (componente)** usa `support_tickets`.
- **Image feedback report** usa `image_error_reports` e permite resolver no admin.
- **Engagement (via hook useReports)** usa `reportsService.getUserEngagementReport` com `user_game_history` + `profiles`.
- **Funil executivo** usa `funnel_events` com fallback para tabelas legadas (`game_starts`, `game_attempts`, `game_sessions`, `rankings`).
- **Heatmap, retenção executiva, dificuldade por jogador, score distribution** também são calculados a partir de tabelas reais.

## ⚠️ Parcialmente reais (mistura com aproximações ou placeholders)
- **reportsService.getNPSReport** converte rating 1-5 para NPS 0-10 por regra interna e usa uma taxa de resposta artificial (`Math.max(10, total*2)`).
- **reportsService.getErrorMetricsReport** lê `bugs`, mas:
  - classifica tipos por palavra-chave simplificada;
  - calcula `resolved_errors` como 80% fixo;
  - gera `avg_resolution_time` com `Math.random`.
- **reportsService.getSupportTicketsReport** lê tickets reais, mas `avg_resolution_time` e `satisfaction_score` são aleatórios.
- **reportsService.getFeedbackReport** lê feedback real, mas `avg_rating` diário é aproximado por pesos fixos (4.5/3/1.5), não pela média real das notas.
- **BI segmentação** usa dados reais de jogo, porém gera `conversion_rate` e `growth_rate` com `Math.random`.
- **BI operacional** possui métricas técnicas hardcoded (`system-health=99`, `response-time=150ms`) e alguns comparativos simulados (`previous_value` e `change_percentage` fixos em parte).

## ❌ Sintético no front
- **ErrorMetricsReport (componente de UI)** ignora service e gera lista simulada no `queryFn` (Game Load Timeout, etc.) proporcional a `days`.

## 3) Redundâncias e inconsistências atuais

1. **Dois caminhos de NPS/Feedback/Tickets/Erros**
   - `ReportsOverview` renderiza componentes que consultam tabelas diretamente (NPS/Feedback/Support), enquanto existe `useReports/reportsService` cobrindo os mesmos domínios.
   - Resultado: lógica duplicada e números potencialmente divergentes.

2. **Duas fontes para “Erros”**
   - Componente `ErrorMetricsReport` é totalmente mockado;
   - Service `getErrorMetricsReport` tem dados parcialmente reais.
   - Resultado: confiança baixa no relatório.

3. **Duas camadas executivas no BI**
   - `BusinessIntelligenceDashboard` já tem resumo executivo e ainda embute `ExecutiveAnalyticsDashboard` na aba “Executivo”.
   - Pode haver sobreposição de KPIs (ex.: conversão, ativos e retenção em múltiplos lugares).

4. **Período potencialmente desalinhado entre dashboards**
   - BI e Executive usam `useReportPeriod` localmente; fácil gerar leituras em períodos diferentes na mesma sessão se cada área for alterada separadamente.

5. **Aba “Avançado” em BI é placeholder**
   - Cards de ML/A-B testing sem dados operacionais.

## 4) Melhorias recomendadas (ordem de execução)

## Fase 1 (rápida, alto impacto — 1 sprint)
1. **Unificar fonte de dados dos relatórios**
   - escolher: componente direto em Supabase **ou** `reportsService`; ideal: centralizar em `reportsService` + hooks.
2. **Eliminar mock de ErrorMetricsReport**
   - trocar para `useReports(...).errorMetrics`.
3. **Remover métricas aleatórias**
   - substituir todos os `Math.random` por cálculo determinístico com dados reais (ou exibir “N/D” quando não houver dado).
4. **Adicionar indicador de qualidade da métrica**
   - badge: `Real`, `Estimado`, `Placeholder` em cada card.

## Fase 2 (governança de métricas — 1 a 2 sprints)
5. **Criar dicionário de métricas no repositório**
   - definição, fórmula, granularidade, tabela-fonte, owner.
6. **Padronizar períodos e timezone no admin inteiro**
   - um único estado global de período para todas as abas de analytics.
7. **SLAs e aging reais em tickets/bugs**
   - tempo de resolução por status e prioridade, sem aproximações.

## Fase 3 (evolução analítica)
8. **BI Avançado com dados reais**
   - substituir placeholders por: cohorts de experimentos, impacto de feature flag, churn prediction score.
9. **Ações recomendadas orientadas por gatilhos**
   - ex.: “bounce > 40% por 3 dias” → ação sugerida e owner.

## 5) Proposta de racionalização da navegação (enxugar redundância)
- **Dashboard**: operação diária (ativos, sessões, conteúdo, saúde).
- **Relatórios**: satisfação + suporte + qualidade (NPS/Feedback/Tickets/Erros/Imagens).
- **BI**: análise estratégica (funil, coortes, segmentação, retenção avançada).

Com essa divisão, evita-se repetir os mesmos KPIs em múltiplas abas.

## 6) Resposta objetiva ao pedido
- **Necessários**: funil, engajamento, satisfação, erros reais, tickets, imagem report, coortes e segmentação (nesta ordem de prioridade).
- **Com dados reais hoje**: NPS/Feedback/Support (componentes), engagement, funil executivo e relatórios de imagem.
- **Redundantes**: dupla implementação de relatórios (componente direto vs service/hook) e possível sobreposição de KPIs entre BI e Executivo.
- **Para melhorar**: remover mocks/aleatoriedade, unificar camada de dados, explicitar qualidade da métrica e padronizar período.
