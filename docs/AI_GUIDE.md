# Guia de Evolução com IA

Este guia explica como agentes de IA devem operar no projeto para **entregar valor sem comprometer estabilidade**.

## 1. Objetivo

Usar IA para acelerar manutenção e evolução do produto com:

- mudanças pequenas e auditáveis,
- diagnóstico rápido de incidentes,
- documentação sempre sincronizada.

## 2. Contrato de trabalho para IA

Toda tarefa deve seguir este contrato:

1. **Entender contexto funcional**
   - modo de jogo impactado,
   - caminho do usuário,
   - serviços e hooks envolvidos.
2. **Declarar hipótese técnica antes de editar**
   - "Acredito que o erro está em X por causa de Y".
3. **Propor alteração mínima**
   - evitar refatorações amplas junto com bugfix.
4. **Validar evidências**
   - comandos executados,
   - resultado de lint/testes,
   - limitações do ambiente.
5. **Atualizar docs afetados**
   - se fluxo, arquitetura ou operação mudou.

## 3. Mapa para análise de impacto

Ao receber uma tarefa, use o mapa:

- **UI/rotas:** `src/pages`, `src/components`
- **Fluxo de jogo:** `src/hooks/game`, `src/components/*-game`
- **Regras de negócio:** `src/services`
- **Integridade de dados:** `src/schemas`, `src/types`
- **Integrações externas:** `src/integrations/supabase`
- **Resiliência e falhas:** `src/components/error-boundaries`, `src/utils/*error*`

## 4. Padrão de resposta para mudanças com IA

Em PR ou relatório técnico, incluir:

1. **Resumo funcional:** o que muda para o usuário.
2. **Resumo técnico:** quais arquivos e por quê.
3. **Risco:** baixo/médio/alto + justificativa.
4. **Validação:** quais comandos e testes.
5. **Rollback:** como reverter rapidamente.

## 5. Regras absolutas para assets visuais

- **NUNCA gerar imagens via IA** para substituir fotos de jogadores ou camisas. Imagens geradas por IA não representam fielmente os jogadores/uniformes reais e comprometem a credibilidade do projeto.
- Quando uma imagem de jogador ou camisa estiver indisponível, usar **placeholder genérico** (escudo do Fluminense ou silhueta) até que uma foto real seja obtida e enviada manualmente pelo administrador.
- Fotos reais devem ser carregadas via **painel admin** (upload manual) ou migradas de fontes externas confiáveis via Edge Function `migrate-player-image`.

## 6. Sinais de alerta (não prosseguir sem revisar)

- Mudança altera regra de pontuação/dificuldade sem teste.
- Mudança mexe em seleção de jogadores com fallback oculto.
- Mudança de imagem ignora validação de URL/fallback.
- Mudança grande sem hipótese clara.
- IA sugere "reescrever tudo" para corrigir bug localizado.

## 7. Prompt-base recomendado para manutenção

```txt
Contexto: projeto React + TS com Supabase.
Objetivo: corrigir <erro> no fluxo <x>.
Restrições: alteração mínima, sem quebrar modos de jogo existentes.
Exija: hipótese, arquivos tocados, riscos, testes e rollback.
```

## 8. Boas práticas para evolução contínua

- Abrir tarefas por problema real (erro/latência/usabilidade), não por "refatorar tudo".
- Preferir melhorias incrementais com métricas comparáveis.
- Converter correções recorrentes em runbooks (`docs/ERROR_TRIAGE.md`).
- Revisar documentação em toda mudança de contrato (service, hook, schema).

## 9. Definição de pronto para mudanças propostas por IA

Uma proposta de IA só está pronta quando:

- pode ser explicada em linguagem de produto e técnica,
- contém validação objetiva,
- possui rollback explícito,
- deixa a documentação mais clara que antes.
