

# Fixar Timer em 60 Segundos para Todos os Jogos

## Problema Atual

Existem **3 regras de timer diferentes** no código:

1. **Década**: Usa `useDecadeGameTimer` com `initialTime: 60` — **correto**
2. **Adaptativo**: Usa `useCleanTimer` que lê do `localStorage` via `getStoredTimerDuration()` — retorna 20, 30 ou 45
3. **Camisas**: Usa `useCleanTimer` — mesmo problema, 20/30/45

Além disso, existe um **TimerSelector** na tela de seleção de modo que permite o jogador alterar o tempo. A regra do usuário é clara: **sempre 60 segundos, sem opção de mudança**.

## Plano de Execução

### 1. `use-clean-timer.ts` — Fixar em 60 segundos
- Remover a dependência de `getStoredTimerDuration()` e `use-game-settings`
- Alterar `TIME_LIMIT_SECONDS` para `60`
- Usar `60` diretamente como valor inicial e em `startTimer`/`stopTimer`
- Remover `timerDuration` do retorno (não é mais configurável)

### 2. `use-game-settings.ts` — Remover sistema de timer configurável
- Remover `TimerDuration`, `TIMER_OPTIONS`, `setTimerDuration`, `getStoredTimerDuration`
- Manter o hook se houver outras configurações futuras, ou deletar se só servia para o timer

### 3. `TimerSelector.tsx` — Deletar componente
- Remover o arquivo inteiro

### 4. `GameModeSelection.tsx` — Remover referência ao TimerSelector
- Remover import e uso do `TimerSelector` da tela de seleção de modo

### 5. `GameTimer.tsx` — Fixar `maxTime` em 60
- Alterar default de `maxTime` de `45` para `60`

### 6. `DecadeGameContainer.tsx` — Já correto
- Nenhuma alteração (já usa `initialTime: 60`)

### 7. Containers Adaptativo e Camisas — Sem alteração
- Já usam `useCleanTimer`, que será corrigido no passo 1

### 8. `use-decade-game-timer.ts` — Forçar 60
- Remover parâmetro `initialTime` configurável, usar `60` fixo internamente

### 9. Build errors — Corrigir `.at(-1)` em `OperationalDashboard.tsx`
- Substituir `.at(-1)` por `[arr.length - 1]` para compatibilidade com target ES2021

### 10. Build errors — Edge Functions (Supabase)
- Os erros de tipo em `collect-players-data/index.ts` são de tipagem Supabase (não relacionados ao timer) — adicionar `// @ts-ignore` ou cast `as any` nos pontos de incompatibilidade de tipo para destravar o build

### 11. Atualizar documentação inline
- Adicionar JSDoc no `use-clean-timer.ts` documentando a regra: "Timer fixo de 60 segundos por rodada em todos os modos de jogo"

