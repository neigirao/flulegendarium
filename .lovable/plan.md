

# Auto-save ranking com nome obrigatório

## Situação atual
- O `use-game-orchestration.ts` **já garante** que jogadores não-logados vejam o `GuestNameForm` antes de jogar (linha 213-217). Jogadores logados têm nome via `user_metadata`.
- Portanto, **todo jogador já tem nome** quando chega ao game over — via `guestName` (convidado) ou `user` (logado).
- O problema: `resolvedRankingName` ainda pode cair para `''` (linha 163), e o botão "Salvar no Ranking" manual ainda existe (linhas 378-458).

## Alterações

### 1. `GameOverDialog.tsx` — Fallback nunca vazio + remover UI manual

**Linha 163**: Trocar `|| ''` por `|| 'Tricolor Anônimo'` como safety net (nunca deveria ser atingido, mas garante que o auto-save sempre dispara).

**Linhas 378-458**: Remover o bloco `showInitialState` (botão "Salvar no Ranking") e o bloco `showRankingForm` (`RankingForm`). Após auto-save, mostrar diretamente os botões "Jogar Novamente" e "Voltar ao Início" junto com share options.

**Remover**: `import { RankingForm }`, state `showRankingForm`, handlers `handleSaveToRanking`, `handleSkipRanking`.

### 2. Garantia de nome — já existe, sem mudança necessária

O fluxo atual no `use-game-orchestration.ts` já impede o jogo sem nome:
- Não-logado → `showGuestNameForm = true` (bloqueia a UI até inserir nome)
- Logado → `user` presente, nome vem de `user_metadata`

Nenhuma alteração necessária nos game containers ou no orchestration hook.

