

# Aplicar Tema Warm + Tokens Semânticos em Todas as Páginas Restantes

## Escopo

Duas frentes: (1) aplicar `page-warm` nas páginas de jogo que ainda usam o dark teal gradient, e (2) substituir cores hardcoded `flu-grena`/`flu-verde` por tokens semânticos em todos os componentes não-admin.

## 1. Páginas de Jogo — Aplicar `page-warm`

As 3 páginas de quiz ainda usam `style={{ background: 'linear-gradient(...)' }}` com `--game-bg-from/via/to`. Trocar para `page-warm`:

- `AdaptiveGuessPlayerSimple.tsx` — remover o style inline, adicionar `page-warm`
- `DecadeGuessPlayerSimple.tsx` — idem
- `JerseyQuizPage.tsx` — idem

**Nota**: Os componentes de gameplay internos (timer, cards, header) continuam com seus estilos escuros — isso cria contraste interessante sobre o fundo claro.

## 2. AdminLazy.tsx — Limpar cores hardcoded

- `bg-gradient-to-b from-flu-verde/50 to-white` → `page-warm`
- `text-flu-grena` → `text-primary`

## 3. Componentes com `flu-grena`/`flu-verde` hardcoded (não-admin)

~50 arquivos com estas cores. Os principais a migrar:

| Componente | Mudança |
|---|---|
| `GuestNameForm.tsx` | `bg-flu-verde` → `bg-secondary`, `text-flu-grena` → `text-primary` |
| `GameConfirmDialog.tsx` | `bg-flu-grena` → `bg-primary` |
| `AdaptiveTutorial.tsx` | `bg-flu-grena/10` → `bg-primary/10`, `text-flu-verde` → `text-secondary` |
| `NewsCard.tsx` | `text-flu-grena` → `text-primary`, `bg-flu-verde` → `bg-secondary` |
| `ShareSystem2.tsx` | `bg-flu-grena` → `bg-primary`, `bg-flu-verde/20` → `bg-secondary/20` |
| `IntelligentImageLoader.tsx` | `bg-flu-grena/20` → `bg-primary/20` |
| `flu-card.tsx` | `from-flu-grena` → `from-primary`, `from-flu-verde` → `from-secondary` |
| `ImageFeedbackButton` e relacionados | migrar todas as referências |
| Componentes de achievements | migrar referências |
| Componentes de onboarding | migrar referências |
| Componentes de social/feedback | migrar referências |
| Componentes de game (GuessForm, SkipPlayerButton, etc.) | migrar referências |

Será feito um search sistemático arquivo por arquivo, substituindo:
- `flu-grena` → `primary` (mesma cor no token system)
- `flu-verde` → `secondary` (mesma cor no token system)
- `text-flu-grena` → `text-primary`
- `bg-flu-grena` → `bg-primary`
- `text-flu-verde` → `text-secondary`
- `bg-flu-verde` → `bg-secondary`
- `from-flu-grena` → `from-primary`
- `from-flu-verde` → `from-secondary`
- `border-flu-grena` → `border-primary`
- `to-flu-verde` → `to-secondary`

## 4. Outras cores hardcoded restantes

- `bg-red-600 hover:bg-red-700` em `GameConfirmDialog` → `bg-destructive hover:bg-destructive/90`
- Quaisquer `bg-green-500`, `bg-red-500` restantes → `bg-success`, `bg-error`

## O que NÃO muda
- Componentes admin (`src/components/admin/*`) — painel interno, não precisa do retrofit
- TopNavigation — mantida conforme solicitado
- Lógica de jogo — zero mudanças

## Arquivos afetados
~55 arquivos (3 pages de jogo + AdminLazy + ~50 componentes com cores hardcoded)

