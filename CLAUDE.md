# Lendas do Flu — Contexto para Claude

Quiz interativo de jogadores e camisas históricas do Fluminense FC.
**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Supabase + React Query.

---

## Modos de jogo

| Modo | Rota | Arquivo principal |
|------|------|-------------------|
| Quiz Adaptativo | `/quiz-adaptativo` | `src/pages/AdaptiveGuessPlayerSimple.tsx` → `src/components/guess-game/AdaptiveGameContainer.tsx` |
| Quiz Por Década | `/quiz-decada` | `src/pages/DecadeGuessPlayerSimple.tsx` |
| Quiz das Camisas | `/quiz-camisas` | `src/pages/JerseyQuizPage.tsx` → `src/components/jersey-game/JerseyGameContainer.tsx` |

---

## Mecânicas do jogo adaptativo

- **Timer:** 60 segundos fixos por rodada.
- **Vidas:** 1 erro = game over imediato.
- **Progressão de dificuldade:** fixa, proporcional ao pool no banco (`floor(pool/10)`):
  - 0-7 acertos: `muito_facil` (pool=84)
  - 8-16: `facil` (pool=96)
  - 17: `medio` (pool=5)
  - 18-19: `dificil` (pool=23)
  - 20+: `muito_dificil` (pool=11)
- **Nunca retrocede.** Ao errar o jogo encerra; ao reiniciar começa do zero.
- **Seleção de jogador:** respeita `difficulty_level` do banco. Fallback: repete do mesmo pool ignorando usedPlayerIds. Nunca seleciona jogador de outro nível.
- **Pontuação:** `5 × multiplier` (0.5× muito_fácil ... 2.0× muito_difícil).

---

## Arquitetura

```
src/
  pages/          # Rotas — cada página monta um container ou componente de jogo
  components/     # UI — subpastas por domínio (guess-game, jersey-game, home, guards...)
  hooks/
    game/         # Lógica de jogo (use-adaptive-guess-game, use-game-orchestration...)
    data/         # Dados (use-players-data, use-jerseys-data...)
    analytics/    # Tracking
  services/       # Acesso ao Supabase (playerService, jerseyService, challengeService...)
  types/          # Interfaces TypeScript
  config/         # difficulty-levels.ts, feature-flags.ts, game-config.ts
  utils/          # player-image/, jersey-image/, name-processor, logger
```

---

## Padrões importantes

### Cor dourada de marca
`#C4944A` — usar sempre este literal. **Não usar** `text-accent`/`bg-accent` (o CSS var `--accent` é branco `0 0% 98%`).

### Feedback de palpite
`feedbackState: 'idle' | 'correct' | 'wrong'` — estado local no container, derivado comparando `score` antes/depois. Componentes `QuizFeedbackZone` e `AdaptivePlayerImage` recebem este estado.

### Autenticação
- Rotas de jogo protegidas por `src/components/guards/ProtectedRoute.tsx`.
- Login: apenas Google OAuth (`src/pages/Auth.tsx`).
- Não autenticado → redireciona para `/auth` com `state.from` preservado.

### TypeScript
`strict: false` e `noImplicitAny: false` no tsconfig — TypeScript **não detecta** referências a variáveis não declaradas. Sempre testar em runtime ao remover estados/funções.

### Supabase
- Client: `src/integrations/supabase/client.ts`
- Projeto: `hafxruwnggitvtyngedy`
- Tabelas relevantes: `players`, `rankings`, `jersey_game_rankings`, `profiles` (streak diário), `daily_challenges`

---

## Hooks principais do jogo adaptativo

| Hook | Responsabilidade |
|------|-----------------|
| `useAdaptiveGuessGame` | Orquestra tudo: timer, pontuação, seleção, progressão |
| `useAdaptivePlayerSelection` | Seleciona jogador por `difficulty_level` |
| `useGameOrchestration` | Skip, history, guest name, achievements, share |
| `useCleanTimer` | Timer de 60s com callback de expiração |
| `useAdaptiveGameMetrics` | Salva partidas, ranking, recordes |
| `usePlayStreak` | Streak diário de jogo (dias consecutivos) |

---

## Gotchas conhecidos

1. **`adjustDifficulty` não existe mais** — foi substituída por `advanceDifficulty`. Se aparecer em código antigo, remover.
2. **`correctSequence`/`incorrectSequence` não existem mais** — removidos junto com o sistema adaptativo.
3. **Pool `medio` tem apenas 5 jogadores** — o threshold de 1 acerto é consequência; não é bug.
4. **`onOpenChange={() => {}}` no Dialog** bloqueia o X — sempre conectar ao `onClose`.
5. **Não chamar `adjustDifficulty(false)` em pulos** — pular não muda a dificuldade.

---

## Git — Configuração de remotes

```
origin  → proxy local do Lovable (porta dinâmica) — fetch funciona, push retorna 403
lovable → https://neigirao:<PAT>@github.com/neigirao/flulegendarium.git — push funciona
```

**Para push:** sempre usar `git push lovable <branch>`

**Após o push, sincronizar o ref do origin** (evita o stop hook reclamar):
```bash
git fetch lovable
git update-ref refs/remotes/origin/<branch> refs/remotes/lovable/<branch>
```

**Para deploy no Lovable (merge em main):**
```bash
git checkout main && git reset --hard lovable/main
git merge <feature-branch> --no-edit
git push lovable main
git update-ref refs/remotes/origin/main refs/remotes/lovable/main
```

**Conflitos em supabase.ts:** manter sempre o cliente tipado do Lovable (`src/integrations/supabase/client.ts`).
Erros de build com `@lovable.dev/cloud-auth-js` são esperados — pacote só existe no ambiente Lovable.

---



- `docs/ARCHITECTURE.md` — arquitetura em camadas
- `docs/GAME_FLOW.md` — fluxo completo do jogo
- `docs/COMPONENTS_MAP.md` — mapa de componentes
- `docs/DESIGN_SYSTEM.md` — tokens visuais
- `docs/AI_GUIDE.md` — contrato de trabalho para IAs
- `docs/CHANGELOG.md` — histórico de mudanças
- `ROADMAP.md` — próximas prioridades
