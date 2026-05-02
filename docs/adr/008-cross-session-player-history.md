# ADR 008: Histórico Cross-Sessão de Jogadores com localStorage

## Status
Aceito — 2026-05-02

## Contexto

O sistema de seleção de jogadores já evitava repetições dentro de uma única partida (via `usedPlayerIds` ref). Porém, ao iniciar uma nova partida, todos os jogadores voltavam ao pool — causando aparições frequentes dos mesmos jogadores em sessões consecutivas, especialmente para usuários que jogam muito.

## Decisão

Criamos `usePlayerSessionHistory` (`src/hooks/use-player-session-history.ts`), que mantém um histórico rolante de até **30 IDs** no `localStorage` sob a chave `flu_recent_player_ids`.

A seleção em `useAdaptiveGuessGame` passou a usar **duas etapas**:

1. **1ª tentativa:** exclui jogadores usados na sessão atual + histórico cross-sessão.
2. **2ª tentativa (fallback):** exclui apenas jogadores da sessão atual (comportamento original).

Isso garante que o histórico **deprioritiza** sem nunca **bloquear** — quando todos os candidatos estão no histórico, o fallback funciona normalmente.

O histórico é limpo quando o usuário clica em "resetar jogo", evitando que jogadores populares fiquem permanentemente penalizados.

## Alternativas consideradas

- **Histórico no banco de dados (Supabase):** Mais preciso por usuário logado, mas requer round-trip e não funciona para usuários anônimos. Complexidade desproporcional ao benefício.
- **Excluir definitivamente jogadores vistos:** Criaria pools vazios em sessões longas. Descartado.
- **Aumentar pool de fallback para dificuldades adjacentes:** Já existe no `buildFallbackOrder`. Não resolve o problema de repetição entre sessões.

## Consequências

### Positivas
- ✅ Experiência de jogo mais variada sem custo de infra
- ✅ Funciona para usuários anônimos e autenticados
- ✅ Fallback automático — nunca bloqueia o jogo
- ✅ Coberto por 8 testes unitários

### Negativas / Riscos
- ⚠️ Histórico é por dispositivo, não por conta — múltiplos dispositivos não compartilham histórico
- ⚠️ Usuário que limpa localStorage perde o histórico (comportamento esperado)
- ⚠️ Cap de 30 IDs é arbitrário — pode precisar de ajuste se o pool de jogadores crescer muito

## Arquivos afetados

- `src/hooks/use-player-session-history.ts` (novo)
- `src/hooks/use-adaptive-guess-game.ts` (integração)
- `src/hooks/__tests__/use-player-session-history.test.ts` (testes)
