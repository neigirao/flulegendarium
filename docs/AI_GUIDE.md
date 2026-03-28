# Guia de Evolução com IA

Este guia define **como uma IA deve atuar no projeto** para acelerar entrega sem perder confiabilidade.

## 1. Objetivo

Usar IA para manutenção e evolução com:

- mudanças pequenas e auditáveis,
- diagnóstico rápido de incidentes,
- documentação sincronizada com o código,
- handoff fácil entre agentes e pessoas.

## 2. Contrato obrigatório de trabalho

Toda tarefa deve seguir este contrato:

1. **Entender o contexto funcional** (rota, modo de jogo e usuário afetado).
2. **Declarar hipótese técnica antes de editar** (causa provável + evidência).
3. **Aplicar alteração mínima** (evitar refactor amplo junto com bugfix).
4. **Validar com evidência** (comandos, resultados e limitações do ambiente).
5. **Atualizar documentação impactada** (fluxo, contrato, operação ou observabilidade).

## 3. Ordem recomendada para “revisitar todo o código”

Quando o objetivo for revisão ampla, seguir em etapas:

1. **Boot e rotas**: `src/main.tsx`, `src/App.tsx`.
2. **Fluxos de produto**: `src/pages/**` + containers de jogo.
3. **Orquestração**: `src/hooks/**` (especialmente `src/hooks/game/**`).
4. **Regras e dados**: `src/services/**`, `src/schemas/**`, `src/types/**`.
5. **Infra e persistência**: `src/integrations/supabase/**`, `supabase/functions/**`, `supabase/migrations/**`.
6. **Confiabilidade**: error boundaries, utils de validação, cache e imagens.

Para navegação rápida, usar também `docs/AI_CODEBASE_INDEX.md`.

## 4. Mapa por camadas

- **UI/rotas**: `src/pages`, `src/components`
- **Fluxo de jogo**: `src/hooks/game`, `src/components/*-game`
- **Regras de negócio**: `src/services`
- **Integridade de dados**: `src/schemas`, `src/types`
- **Integração externa**: `src/integrations/supabase`, `supabase/functions`
- **Resiliência/falhas**: error boundaries e `src/utils/*error*`

## 5. Padrão de saída para PRs e relatórios técnicos

Sempre incluir:

1. **Resumo funcional**: impacto para usuário.
2. **Resumo técnico**: arquivos alterados e motivo.
3. **Risco**: baixo/médio/alto com justificativa.
4. **Validação**: comandos e testes executados.
5. **Rollback**: como reverter com segurança.

## 6. Regras absolutas para assets visuais

- **NUNCA gerar imagens via IA** para jogadores ou camisas.
- Se imagem real estiver indisponível, usar **placeholder oficial**.
- Upload de imagem real deve ocorrer via **painel admin** ou Edge Functions de migração autorizadas.

## 7. Sinais de alerta (pausar e revisar)

- Mudança em pontuação/dificuldade sem teste.
- Mudança de seleção de jogadores com fallback oculto.
- Mudança de imagem sem validação de URL/fallback.
- Alteração grande sem hipótese clara.
- Proposta de “reescrever tudo” para bug localizado.

## 8. Prompt base recomendado

```txt
Contexto: projeto React + TS com Supabase.
Objetivo: corrigir <erro> no fluxo <x>.
Restrições: alteração mínima, sem quebrar modos de jogo existentes.
Exigir: hipótese, arquivos tocados, riscos, testes e rollback.
```

## 9. Definição de pronto para mudanças com IA

Uma proposta só está pronta quando:

- é explicável em linguagem de produto e técnica,
- tem validação objetiva,
- traz rollback explícito,
- deixa documentação mais clara que antes.
