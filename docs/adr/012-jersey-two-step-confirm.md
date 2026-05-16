# ADR 012 — Two-Step Confirm no Quiz de Camisas (pendingYear)

## Status: Accepted (2026-05-16)

## Contexto

O hook `useJerseyGuessGame` processa a resposta imediatamente ao receber o guess. Clicar em uma opção de ano chamava o hook diretamente.

Em mobile, cliques acidentais ou deslizes causavam respostas involuntárias. Além disso, o usuário não tinha chance de confirmar a escolha antes de ela ser processada.

## Decisão

Adicionar `pendingYear: number | null` como estado local no `JerseyGameContainer`.

**Fluxo:**
1. Click em opção → `setPendingYear(year)` — botão muda para estado "selecionado"
2. Botão "Confirmar" aparece — usuário confirma a escolha
3. Click em "Confirmar" → chama `orch.wrapGuess((g) => handleOptionSelect(Number(g)))(String(pendingYear))`
4. `useEffect` com dependência em `gameKey` reseta `pendingYear` para `null` ao iniciar nova rodada

## Consequências

**Positivo:**
- Elimina acertos acidentais em mobile
- Hook inalterado — sem breaking change no contrato existente
- UX consistente com padrão de confirmação explícita (comum em quizzes de múltipla escolha)
- `gameKey` como gate de reset garante limpeza mesmo se o componente remontar

**Negativo:**
- Uma interação extra por resposta (tradeoff deliberado para reduzir erros acidentais)
- Leve complexidade extra no container (estado `pendingYear` adicional)

## Alternativas Consideradas

- **Modificar o hook** para aceitar estado pendente — descartado por adicionar complexidade ao contrato do hook e criar risco de regressão em outros consumidores
- **Debounce no click** — descartado pois não dá feedback visual claro de "selecionado antes de confirmar"
