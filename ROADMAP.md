# Roadmap — Lendas do Flu

> Estado: **Maio 2026**. Atualizar após cada sprint.

---

## ✅ Concluído (neste branch)

| Item | Detalhe |
|------|---------|
| Redesign 4 páginas | Quiz adaptativo, Quiz camisas, Home, Seleção de modo |
| Auth obrigatória | `ProtectedRoute` em rotas de jogo; Google-only em `/auth` |
| Progressão fixa de dificuldade | `floor(pool/10)` por nível; nunca retrocede |
| 1 erro = game over | Revertido sistema de 3 tentativas |
| Seleção de dificuldade corrigida | Fallback repete pool correto em vez de qualquer jogador |
| X do GameOverDialog | Fecha e reseta o jogo corretamente |
| Streak diário | `use-play-streak.ts` + display em GameModeSelection |
| Emoji grid no resultado | 🟢🔴 com maxStreak conectado ao SocialShare |
| Cores douradas visíveis | `#C4944A` substituindo `text-accent`/`bg-accent` brancos |
| **Modo Por Década** | Progressão fixa aplicada via `useFixedProgression` em `use-base-game-state.ts` |
| **og:description** | Encurtado para 157 chars em `index.html` |

---

## 🔜 Próximas prioridades

### P1 — ✅ Concluído

### P2 — Alto impacto, esforço médio

| Item | Descrição | Arquivo(s) |
|------|-----------|------------|
| **Banco de jogadores — Médio** | Pool `medio` tem só 5 jogadores; adicionar ~25 jogadores neste nível para equilibrar a progressão | Admin / Supabase |
| **Daily Challenges proeminente** | Card "Desafio do Dia" na seleção de modo com timer até próximo desafio | `src/pages/GameModeSelection.tsx` |
| **Strict TypeScript** | Ativar `strict: true` no tsconfig — atualmente `noImplicitAny: false` deixa ReferenceErrors passarem silenciosamente | `tsconfig.app.json` |

### P3 — Médio impacto, esforço maior

| Item | Descrição |
|------|-----------|
| **Desafio de amigo** | Link com seed do jogador; amigo joga a mesma imagem e compara pontuação |
| **Ranking entre amigos** | Tabela semanal filtrada por seguidos |
| **Perfil público** | Página `/perfil/:id` com conquistas e histórico de streaks |
| **Modo Muito Difícil exclusivo** | Desbloquear apenas após completar o ciclo completo de dificuldades |

---

## 📊 Estado dos modos de jogo

| Modo | Status | Progressão dificuldade |
|------|--------|----------------------|
| Quiz Adaptativo | ✅ Produção | Fixa proporcional ao pool |
| Quiz Por Década | ✅ Produção | Fixa proporcional ao pool |
| Quiz das Camisas | ✅ Produção | Fixa (múltipla escolha) |

---

## 🗃️ Banco de dados — distribuição de jogadores

| Dificuldade | Jogadores | Threshold atual |
|-------------|-----------|-----------------|
| muito_facil | 84 | 8 acertos |
| facil | 96 | 9 acertos |
| medio | 5 ⚠️ | 1 acerto |
| dificil | 23 | 2 acertos |
| muito_dificil | 11 | ∞ |

> O nível `medio` tem pool muito pequeno — prioridade P2 para reclassificar jogadores.
