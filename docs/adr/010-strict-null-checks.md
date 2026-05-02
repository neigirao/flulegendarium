# ADR 010: Ativação de `strictNullChecks`

## Status
Aceito — 2026-05-02

## Contexto

O projeto usava `"strict": false` no `tsconfig.app.json`, o que desativava `strictNullChecks`. Isso permitia que valores `null` e `undefined` fossem atribuídos a qualquer tipo sem erro de compilação — uma fonte comum de runtime errors em TypeScript.

Com o crescimento do codebase (hooks complexos, queries Supabase que retornam `null`, seleção de jogadores com possíveis valores ausentes), o risco de bugs silenciosos aumentou.

## Decisão

Ativamos `"strictNullChecks": true` explicitamente em `tsconfig.json` e `tsconfig.app.json`, mantendo `"strict": false` para não ativar outras checagens do bundle strict (como `noImplicitAny` em massa).

A ativação foi feita de forma isolada e resultou em **zero erros de compilação** — o codebase já tratava nulls corretamente em todos os pontos críticos:

- Queries Supabase com optional chaining (`?.`) e nullish coalescing (`??`)
- Seleção de jogadores com retorno `null` explícito quando pool vazio
- Componentes com props opcionais corretamente tipadas

## Alternativas consideradas

- **Ativar `"strict": true` completo:** Incluiria `noImplicitAny`, `strictFunctionTypes`, etc. — geraria centenas de erros e exigiria refatoração massiva. Postergado para o futuro.
- **Manter sem strictNullChecks:** Deixaria o risco latente de runtime crashes por null dereference em operações de jogo críticas.

## Consequências

### Positivas
- ✅ Null dereferences detectados em tempo de compilação
- ✅ Zero erros gerados na ativação — sem custo de migração
- ✅ Abre caminho para ativar `strict: true` completo no futuro
- ✅ IDEs passam a mostrar alertas de null safety em tempo real

### Negativas / Riscos
- ⚠️ Código novo precisa tratar `null`/`undefined` explicitamente — pequeno overhead cognitivo
- ⚠️ Não cobre outros flags do `strict` bundle — revisão futura recomendada

## Arquivos afetados

- `tsconfig.json`
- `tsconfig.app.json`
