

# Fase 2 — Jogabilidade + UX (5 itens)

## 1. Feedback de Urgência no Timer

**Estado atual**: O `GameTimer.tsx` JA tem shake nos ultimos 5s, cores (vermelho <5s, amarelo <10s) e glow no SVG. Isso foi implementado no redesign anterior.

**O que falta**: Pulso visual no numero central e som/vibração opcional.

**Mudanças**:
- `GameTimer.tsx`: Adicionar classe `animate-pulse` no numero quando `isCritical` + aumentar strokeWidth de 6 para 8 nos ultimos 5s para efeito de "engrossamento"
- Adicionar vibração via `navigator.vibrate(100)` nos ultimos 5s (mobile only, com fallback silencioso)

**Arquivo**: `src/components/guess-game/GameTimer.tsx`

---

## 2. Onboarding Visual para Novos Jogadores

**Estado atual**: Sistema completo existe (`OnboardingProvider`, `CoachMark`, `OnboardingTrigger`) com 7 steps definidos. O `OnboardingTrigger` mostra um card flutuante "Primeira vez aqui?". CoachMarks estão integrados nos game containers para `name-input` e `timer-explanation`.

**O que falta**: O step `welcome` nao tem UI dedicada — o trigger inicia o onboarding mas o step welcome nao renderiza nada visivel. Falta um overlay/modal de boas-vindas com 3 slides visuais explicando os modos de jogo.

**Mudanças**:
- Criar `src/components/onboarding/WelcomeOverlay.tsx` — modal fullscreen com 3 slides:
  1. "Bem-vindo ao Lendas do Flu!" — explicacao geral
  2. "3 Modos de Quiz" — icones dos 3 modos com descricao curta
  3. "Dicas" — timer, combos, pular
- Cada slide com botao "Proximo" e indicador de progresso (3 dots)
- Ultimo slide com "Começar a Jogar!"
- Integrar no `UXProvider.tsx` renderizando `<WelcomeOverlay />` quando step == 'welcome'
- Usar Framer Motion para transicoes entre slides

**Arquivos**: `src/components/onboarding/WelcomeOverlay.tsx` (novo), `src/components/ux/UXProvider.tsx`

---

## 3. Footer na Home

**Mudanças**:
- Criar `src/components/layout/Footer.tsx` com:
  - Logo "Lendas do Flu" + tagline
  - Links: Jogar, Estatísticas, Doações, FAQ
  - Link Instagram @lendasdoflu
  - Copyright "2024 Lendas do Flu — Feito por tricolores, para tricolores"
  - Borda superior tricolor sutil (grená-branco-verde)
- Adicionar `<Footer />` no `Index.tsx` antes do fechamento do container
- Estilo warm consistente: `bg-card border-t border-border`

**Arquivos**: `src/components/layout/Footer.tsx` (novo), `src/pages/Index.tsx`

---

## 4. Skeleton Loaders nos Games

**Estado atual**: `BaseGameContainer` mostra `<LoadingState>` generico (spinner + texto). Nao tem skeleton que represente o layout do jogo.

**Mudanças**:
- Criar `src/components/guess-game/GameSkeleton.tsx` — skeleton que imita o layout real:
  - Skeleton circular para timer + retangular para score (simula GameHeader)
  - Skeleton quadrado grande para imagem do jogador/camisa
  - Skeleton retangulares para botoes de opcoes/input
- Usar o `<Skeleton>` component existente (`src/components/ui/skeleton.tsx`)
- Substituir o `<LoadingState>` no `BaseGameContainer` pelo novo `<GameSkeleton />`

**Arquivos**: `src/components/guess-game/GameSkeleton.tsx` (novo), `src/components/guess-game/BaseGameContainer.tsx`

---

## 5. Rotação Automática de Daily Challenges via pg_cron

**Estado atual**: Edge Function `rotate-daily-challenges` existe e funciona quando invocada manualmente. Falta o agendamento automatico.

**Mudanças**:
- Habilitar extensoes `pg_cron` e `pg_net` via migration
- Criar cron job via SQL (executado com `supabase--read_query` pois contem dados especificos do projeto):
  - Schedule: `0 3 * * *` (3h UTC = meia-noite BRT)
  - Chama `https://hafxruwnggitvtyngedy.supabase.co/functions/v1/rotate-daily-challenges` com o anon key

**Execucao**: Migration SQL para extensoes + insert SQL para o cron job

---

##