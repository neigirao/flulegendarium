

# Plano: Corrigir 5 problemas de layout e UX nos jogos

## Problemas identificados

1. **Tooltip quebrando layout** — `GameRulesTooltip` no `GameHeader.tsx` (linha 139)
2. **Anos da camisa desalinhados** — `JerseyYearOptions.tsx` botões não centralizados no container
3. **Dois botões de feedback no game over** — `QuickFeedbackButton` no `GameOverDialog.tsx` (linha 403) + `ImageFeedbackButton` visível no container por trás
4. **X de fechar não funciona** — Provavelmente o `GameOverDialog` com `onClose={() => {}}` (no-op) conflita com interação
5. **Campo de nome do jogador desalinhado** — `GuessForm` no `AdaptiveGameContainer.tsx` precisa centralização
6. **Build error** — `weekly-image-audit/index.ts` linha 3: `@deno-types="npm:resend@4.0.0"` causa erro de resolução

## Correções

### 1. Remover `GameRulesTooltip` do `GameHeader.tsx`
- Remover import e uso na linha 139

### 2. Centralizar `JerseyYearOptions.tsx`
- O container `div` com `flex justify-center gap-3` já está ok, mas os botões têm `w-20 sm:w-24` fixo. Adicionar `items-center` e garantir que o wrapper pai tenha `text-center` e `flex flex-col items-center`

### 3. Remover `QuickFeedbackButton` do `GameOverDialog.tsx`
- Remover linhas 402-409 (o `QuickFeedbackButton`) — manter apenas o `ImageFeedbackButton` que está nos containers de jogo
- Também esconder o `ImageFeedbackButton` quando `gameOver` é true nos containers, pois o jogo já acabou

### 4. Corrigir X de fechar no `GameOverDialog`
- O `onOpenChange` chama `handleGoHome` que navega para home — isso funciona. Mas se o problema é que o X não fecha, pode ser que `onPointerDownOutside={(e) => e.preventDefault()}` junto com `onClose={() => {}}` cria conflito. Garantir que o Dialog permita fechar via X

### 5. Centralizar `GuessForm` no `AdaptiveGameContainer.tsx`
- Envolver o `GuessForm` e botões em `div` com `flex flex-col items-center` para centralizar

### 6. Corrigir build error
- Remover a linha `// @deno-types="npm:resend@4.0.0"` do `weekly-image-audit/index.ts` (o import via esm.sh já resolve os tipos)

## Arquivos

| Ação | Arquivo |
|------|---------|
| Editar | `src/components/guess-game/GameHeader.tsx` — remover GameRulesTooltip |
| Editar | `src/components/jersey-game/JerseyYearOptions.tsx` — melhorar centralização |
| Editar | `src/components/guess-game/GameOverDialog.tsx` — remover QuickFeedbackButton |
| Editar | `src/components/guess-game/AdaptiveGameContainer.tsx` — centralizar form, esconder feedback quando gameOver |
| Editar | `src/components/jersey-game/JerseyGameContainer.tsx` — esconder feedback quando gameOver |
| Editar | `supabase/functions/weekly-image-audit/index.ts` — remover @deno-types |

