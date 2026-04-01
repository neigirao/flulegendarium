# Validação Admin — funções replicadas e dados reais vs mock (2026-03-28)

## Resposta direta
- **Existem funções/lógicas replicadas** na camada Admin.
- **Nem todos os dados são 100% reais**: ainda há pontos com aproximação/placeholder e havia uso explícito de random na UI operacional (corrigido neste PR).

---

## 1) Funções/lógicas replicadas identificadas

### 1.1 Relatórios com múltiplas fontes e lógica repetida
- `NPSReport`, `FeedbackReport`, `SupportTicketsReport` e `ErrorMetricsReport` agora usam a mesma camada `useReports`/`reportsService`.
- A duplicação de query direta nos componentes de Feedback/Support foi removida nesta etapa.

Impacto:
- risco de divergência de números entre telas;
- maior custo de manutenção e de validação de métricas.

Arquivos:
- `src/components/admin/reports/NPSReport.tsx`
- `src/components/admin/reports/FeedbackReport.tsx`
- `src/components/admin/reports/SupportTicketsReport.tsx`
- `src/components/admin/reports/ErrorMetricsReport.tsx`
- `src/hooks/use-reports.ts`
- `src/services/reportsService.ts`

### 1.2 Helpers visuais repetidos em múltiplos componentes
Há padrões repetidos de mapeamento (`getStatusColor`, `getTrendIcon`, `getCategoryColor`, `getPriorityColor`) em componentes de Admin/BI/Reports.

Impacto:
- inconsistência visual/semântica potencial;
- esforço duplicado em alterações de design system.

Sugestão:
- extrair para util compartilhado de apresentação (`admin-ui-mappers.ts`) e tipar enum/status central.

---

## 2) Dados reais vs mock/sintético

## 2.1 Dados reais (fonte Supabase)
- `FeedbackReport` e `SupportTicketsReport` consomem `useReports`, com origem no `reportsService`.
- `useReports` + `reportsService` lê tabelas reais (`user_game_history`, `user_feedback`, `bugs`, `support_tickets`, `profiles`).
- `adminBusinessIntelligence` lê tabelas reais para métricas operacionais e de negócio.

## 2.2 Pontos não 100% reais (estimativas/heurística/placeholders)
1. **Escala NPS adaptada de rating 1-5** com regra de conversão interna (heurística).
2. **Classificação de erros por palavra-chave** em descrição (`carregamento`, `imagem`, etc.), sem taxonomia de erro consolidada.
3. **Métricas operacionais com `previous_value: 0` em alguns indicadores**, o que vira baseline artificial.
4. **Sessão administrativa ainda client-side (`localStorage`)**, apesar de agora usar payload real retornado do RPC (`id`, `username`) sem fabricar usuário fake.

## 2.3 Correção aplicada nesta entrega
- `OperationalDashboard` usava `Math.random()` para “Atualizado há X min”.
- Agora calcula o tempo com base em `last_updated` real das métricas.
- `FeedbackReport` e `SupportTicketsReport` deixaram de fazer query direta e passaram a usar `useReports`/`reportsService` (fonte única no frontend).
- `getErrorMetricsReport` passou a calcular `top_errors` por dia e `error_rate` com base real de sessões do dia (`user_game_history`).
- Criado RPC backend `get_error_metrics_daily(p_days)` para centralizar semântica de erro no banco e reduzir lógica analítica no frontend.

Arquivo alterado:
- `src/components/admin/bi/OperationalDashboard.tsx`

---

## 3) Recomendação objetiva (próximos passos)
1. **Unificar relatórios** em uma única camada (`useReports` + `reportsService`) ou 100% RPC/view no backend.
2. **Criar dicionário de métricas** (definição, fórmula, owner, tabela fonte).
3. **Eliminar baselines artificiais** e comparar sempre contra janela anterior real.
4. **Evoluir sessão admin para server-driven** (token curto + renovação), reduzindo dependência de estado client-side.
5. **Extrair mapeadores visuais** para util compartilhado para reduzir duplicação.

---

## 4) Conclusão
- **Não**, hoje ainda não está no estado “melhor forma possível”.
- Evoluiu bem, mas ainda existe dívida técnica em governança de métricas e duplicação de lógica.
- Com os 5 passos acima, o Admin chega em um nível bem mais confiável para operação e tomada de decisão.
