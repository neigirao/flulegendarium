# Análise Estratégica Profunda — Lendas do Flu (2026-03-26)

## Escopo e premissas

Esta análise cobre os temas solicitados:
- Engenharia de software
- BI
- Trackeamento de dados e logs
- Fluminense (torcedor)
- Jogabilidade
- Performance da aplicação
- Evolução da aplicação e qualidade de código
- Analytics
- Estatísticas
- UX e Design
- Beleza
- Inovação

Sem suavização: foco em lacunas reais, riscos e plano de execução.

---

## Diagnóstico geral (brutal e direto)

### O que está bom
1. Base técnica moderna e adequada para escalar produto (React+TS+Vite, Query, Supabase).
2. Estrutura em camadas está documentada e em geral respeitada.
3. Existe preocupação explícita com observabilidade, qualidade e operação.
4. O produto tem variedade de modos (adaptativo, década, camisas), diferencial para retenção.

### O que está ruim (e trava evolução)
1. **Muitos módulos grandes e sobreposição de responsabilidade**: risco de regressão alto e custo de manutenção crescente.
2. **Métrica ainda heterogênea e com proxies** em parte dos relatórios: confiança analítica parcial.
3. **Logs ainda muito centrados em console/memória local**: ótimo para dev, insuficiente para operação madura.
4. **Falta de “modelo único de evento”** para produto+BI+performance: aumenta divergência entre dashboards.
5. **Qualidade visual e UX em crescimento, mas sem governança forte de consistência** (tokens, acessibilidade e microinterações ainda variáveis por tela).

---

## 1) Engenharia de software

### Achados
- Arquitetura em camadas está clara e bem direcionada para separação de responsabilidades.
- Porém, há arquivos muito grandes e com concentração de responsabilidade, incluindo serviços e hooks críticos.
- O pacote de scripts está minimalista (`dev`, `build`, `lint`, `preview`) e não explicita execução padronizada de testes unitários/e2e/cobertura.

### Melhorias recomendadas
1. **Modularizar “arquivos-monólito” por casos de uso**
   - Ex.: `reportsService.ts` em módulos por domínio (`engagement`, `nps`, `errors`, `support`, `feedback`).
   - Ex.: `use-analytics.ts` em pipeline (`ga`, `funnel`, `session`).
2. **Criar camada de “domain services” explícita**
   - Hoje parte do cálculo analítico está nos services de acesso; separar cálculo da coleta de dados melhora testabilidade.
3. **Criar scripts de qualidade obrigatórios**
   - `test`, `test:coverage`, `test:e2e`, `typecheck` e `ci:check`.
4. **Definir limites por tamanho/complexidade**
   - Regra de engenharia: arquivo > 300 linhas exige justificativa ou refactor.

---

## 2) BI

### Achados
- BI já cobre segmentos, coortes e operação, com esforço visível.
- Há lógica determinística em diversos pontos, mas ainda existem métricas com baseline fraco (ex.: alguns `previous_value` fixados em zero na operação), o que pode distorcer tendência.
- Segmentação é por regra heurística interna (funciona para v1), mas ainda sem calibração por experimento.

### Melhorias recomendadas
1. **Contratos de métrica com nível de confiança**
   - Cada KPI com `source_of_truth`, fórmula, latência, cobertura e qualidade (`real`, `estimado`, `proxy`).
2. **Data mart analítico no Supabase**
   - Materialized views para funil diário, retenção semanal, coortes mensais, qualidade técnica.
3. **Baseline consistente para tendências**
   - Evitar `previous_value=0`; usar janela comparável (D-1, W-1, M-1) com mesma granularidade.
4. **Segmentação v2 orientada por cluster real**
   - Passar de regras estáticas para clustering validado em dados históricos.

---

## 3) Trackeamento de dados e logs

### Achados
- Existe rastreamento de funil + GA + sessão, com persistência em `funnel_events`.
- Existe logger central com correlação por sessão e histórico in-memory (útil para debug).
- Ponto fraco: parte do logging ainda depende de console e memória local; para produção, isso limita investigação pós-incidente.

### Melhorias recomendadas
1. **Padrão único de evento (Event Envelope)**
   - `event_id`, `session_id`, `user_id`, `game_mode`, `screen`, `ts_client`, `ts_server`, `app_version`, `device`, `network`, `payload`.
2. **Telemetry pipeline de produção**
   - Encaminhar logs de erro/negócio para sink persistente (Sentry + tabela de eventos normalizada + alertas).
3. **Correlações ponta a ponta**
   - Mesma chave de correlação no front, edge function e banco.
4. **Catálogo de eventos versionado**
   - Evita quebra silenciosa de dashboards quando evento muda no front.

---

## 4) Fluminense (torcedor)

### Achados
- Branding e tom tricolor são fortes na home.
- Narrativa histórica existe, mas pode crescer para criar pertencimento contínuo (não só estética).

### Melhorias recomendadas
1. **Perfil de torcedor**
   - “DNA Tricolor”: décadas favoritas, jogadores mais acertados, estilo de jogo.
2. **Social proof torcedor**
   - Feed semanal de melhores streaks e desafios entre tricolores.

---

## 5) Jogabilidade

### Achados
- Modos de jogo e progressão já existem; isso é um ponto muito forte de produto.
- Há espaço para elevar profundidade sem aumentar fricção.

### Melhorias recomendadas
1. **Dificuldade adaptativa mais transparente**
   - Mostrar ao usuário por que subiu/baixou dificuldade.
2. **Modo rivalidade saudável**
   - Desafio assíncrono entre amigos com comparação por modo.

---

## 6) Performance da aplicação

### Achados
- Existem iniciativas de Core Web Vitals e otimização de imagem.
- Medição de vitals ocorre no cliente com envio para analytics.
- Risco: sem orçamento de performance obrigatório por rota, há tendência de degradação contínua.

### Melhorias recomendadas
1. **Performance budget por rota crítica**
   - Home, seleção de modo, gameplay e ranking com limites de JS/CSS/LCP/CLS.
2. **Guardrails de CI para bundle**
   - Falhar pipeline quando bundle exceder limite.
3. **Pré-carregamento inteligente por probabilidade**
   - Prefetch condicionado por comportamento real (não só hover).
4. **Revisão de queries analíticas pesadas**
   - Mover agregações custosas para views/materialized views.

---

## 7) Evolução da aplicação e qualidade de código

### Achados
- Há documentação operacional e arquitetural madura para guiar evolução.
- Há volume alto de testes no repositório, mas sem script formal de execução no `package.json`, o que prejudica padronização de rotina de qualidade.

### Melhorias recomendadas
1. **Esteira de qualidade explícita**
   - `npm run typecheck && npm run lint && npm run test && npm run test:e2e-smoke`.
2. **Matriz de criticidade por módulo**
   - Gameplay e ranking com exigência maior de cobertura e revisão.
3. **Refatoração guiada por hotspots**
   - Priorizar módulos com maior churn + maior tamanho + maior incidência de bug.
4. **Arquitetura evolutiva com ADR vivo**
   - Toda mudança estrutural relevante vira ADR curta.

---

## 8) Analytics

### Achados
- Hook analítico já cobre eventos de funil, gameplay, social e auth.
- Existe fila/batching para GA e funil, o que é positivo.
- Falta formalização de taxonomia global (nomenclatura, cardinalidade, ciclo de vida do evento).

### Melhorias recomendadas
1. **Taxonomia única de eventos**
   - Convenção `domain_action_object` e payload versionado.
2. **Camada anti-ruído**
   - Deduplicação e throttle para eventos de alta frequência.
3. **Experimentos A/B com telemetria nativa**
   - `experiment_id`, `variant`, `exposed_at`, `conversion_event`.
4. **Atribuição de impacto por release**
   - Comparar KPIs por versão de app para saber se melhoria funcionou.

---

## 9) Estatísticas

### Achados
- Páginas e componentes estatísticos estão amplos e variados.
- Risco atual é confiança/consistência entre fontes e períodos.

### Melhorias recomendadas
1. **Camada “Single Source of Truth” para stats públicas e admin**
   - Mesmo cálculo, múltiplas visualizações.
2. **Timezone unificado para agregação diária**
   - Evitar distorção por UTC/local.
3. **Intervalos de confiança e amostra mínima**
   - Exibir quando a métrica é estatisticamente fraca.
4. **Explicabilidade da métrica na UI**
   - Tooltip com fórmula e período.

---

## 10) UX e Design

### Achados
- Home está forte em proposta de valor e identidade.
- Produto tem boa direção de componentes, mas ainda sofre risco de inconsistência por escala.

### Melhorias recomendadas
1. **Sistema de design com governança operacional**
   - Tokens semânticos + lint de classes proibidas + checklist visual.
2. **Acessibilidade como critério de merge**
   - Contraste, foco visível, navegação teclado, labels de ícones.
3. **Jornada de onboarding segmentada**
   - Novato vs retornante vs competitivo.
4. **UX de erro e recuperação**
   - Mensagens orientadas à ação (o que aconteceu + o que fazer agora).

---

## 11) Beleza (direção visual)

### Achados
- Identidade tricolor é forte e reconhecível.
- Falta elevar refinamento em microdetalhes para percepção premium consistente.

### Melhorias recomendadas
1. **Motion system unificado**
   - Curvas, durações e hierarquia de animação por contexto.
2. **Tipografia orientada à legibilidade competitiva**
   - Regras para títulos emocionais vs leitura rápida de jogo.
3. **Hierarquia cromática com acessibilidade**
   - Verde/grená/dourado com contraste validado em estados críticos.
4. **Polimento de estados vazios/carregamento/erro**
   - Não deixar nenhum estado “genérico”.

---

## 12) Inovação

### Oportunidades de alto impacto
1. **Assistente de análise de erros de conteúdo**
   - Detectar padrões de falha por jogador/camisa e sugerir ajustes editoriais automaticamente.
2. **Laboratório de UX com feature flags**
   - Experimentação contínua de onboarding, CTAs e fluxo de conclusão com medição automática.
3. **Recomendador de trilha de aprendizado**
   - Ordenar próximas rodadas por lacunas individuais para aumentar progressão e retenção.
4. **Detecção preditiva de regressão de funil**
   - Alertar quedas de conversão por versão antes do impacto virar incidente de produto.

---

## Roadmap recomendado (90 dias)

### Fase 1 (0-30 dias): confiabilidade e verdade de dados
- Unificar catálogo de eventos.
- Fechar lacunas de métricas proxy.
- Definir performance budgets por rota.
- Adicionar scripts de qualidade e check de CI.

### Fase 2 (31-60 dias): qualidade de produto e retenção
- Refator dos hotspots (analytics/reports/hooks de jogo).
- Onboarding segmentado.
- Melhorias de progressão guiada por dados de uso.
- BI com qualidade de métrica explícita.

### Fase 3 (61-90 dias): diferenciação competitiva
- Personalização de jornada por perfil de torcedor.
- Experimentos A/B contínuos.
- Recursos de inovação analítica para antecipar queda de conversão e fricção.

---

## Priorização final (sem rodeio)

Se for para escolher só 5 coisas agora:
1. **Unificar eventos/analytics + catálogo versionado.**
2. **Eliminar métricas fracas/proxy nos dashboards críticos.**
3. **Refatorar módulos grandes com maior risco operacional.**
4. **Instituir performance budget e gate de CI.**
5. **Implementar experimentação contínua com feature flags e métricas por versão.**

Isso melhora previsibilidade técnica, confiança de decisão e valor percebido pelo torcedor ao mesmo tempo.
