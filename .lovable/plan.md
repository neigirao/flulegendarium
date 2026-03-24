# Retrofit Visual — Páginas de Jogo + Espaçamentos Globais

## Diagnóstico

### Problemas Identificados como Torcedor / Designer / UX

**1. Páginas de Jogo — Falta de identidade visual warm**

- `GameHeader`: Score e Combo usam `bg-card/10 backdrop-blur-sm` — estilo glassmorphism que flutua sobre o fundo claro warm sem propósito. Em fundo claro, glass fica invisível.
- `AdaptiveDifficultyIndicator`: Mesma questão — `bg-card/10 border-border/20 backdrop-blur-sm` fica invisível sobre `page-warm`.
- `JerseyYearOptions`: Botões usam `bg-card text-card-foreground border-border` — funcional, mas sem warmth. Parecem genéricos, não "tricolores".
- `JerseyImage`: Container com `bg-card` funciona, mas o texto helper "De que ano é essa camisa?" e "Digite o ano exato para mais pontos!" é redundante (o quiz de camisas usa múltipla escolha, não digitação).

**2. DecadeSelectionPage — Não foi migrada**

- Ainda usa `bg-gradient-to-br from-secondary/10 via-background to-primary/10` em vez de `page-warm`.
- Cards usam `hover:scale-105` que é agressivo demais em mobile.

**3. Espaçamentos inconsistentes entre páginas**

- Game pages: `pt-24` no wrapper + padding do `ResponsiveContainer` (`p-6 sm:p-8`) = excesso vertical.
- Home: `pt-16 pb-8` no hero, `mb-12` entre seções — bem espaçado.
- GameModeSelection: `pt-8 pb-8` — mais compacto.
- Donations: `py-8 pt-24` — correto.
- Resultado: cada página tem ritmo vertical diferente.

**4. GameHeader — Micro UI issues**

- Debug button (ícone `Info`) não deveria aparecer em produção para usuários comuns.
- Score card com `bg-card/10` sobre fundo claro = quase invisível.

**5. Game controls — Espaçamento entre elementos**

- Imagem → opções → skip → feedback: `space-y-3` é apertado demais no Jersey quiz.
- O `pt-1` no skip button cria espaçamento inconsistente com `space-y-3` do parent.
- `mt-4` no history panel e keyboard hints empilham margem sobre `space-y-4` do parent.

**6. JerseyImage helper text errado**

- Diz "Digite o ano exato para mais pontos!" mas o quiz de camisas é múltipla escolha, não digitação.

---

## Mudanças Planejadas

### 1. GameHeader — Cards visíveis sobre fundo claro

- Score: trocar `bg-card/10 border-border/20 backdrop-blur-sm` → `bg-card border border-border shadow-sm`
- Debug button: mesma troca — `bg-card/10` → `bg-card border border-border`
- Manter cores de texto (já usam tokens semânticos)

### 2. AdaptiveDifficultyIndicator — Horizontal variant fix

- Trocar `bg-card/10 border-border/20 backdrop-blur-sm` → `bg-card border border-border shadow-sm`

### 3. JerseyYearOptions — Cards warm com identidade tricolor

- Botões antes do resultado: adicionar `shadow-sm` e `hover:shadow-md` para feedback visual sobre fundo claro
- Aumentar levemente o tamanho: `w-24 sm:w-28 h-16 sm:h-18` (melhor touch target)
- Manter as cores de resultado (correto/errado) que já estão ótimas

### 4. JerseyImage — Fix helper text

- Remover "Digite o ano exato para mais pontos!" — é múltipla escolha
- Simplificar para apenas "De que ano é essa camisa?"

### 5. DecadeSelectionPage — Migrar para page-warm

- Trocar `bg-gradient-to-br from-secondary/10 via-background to-primary/10` → `page-warm bg-tricolor-vertical-border`
- Reduzir hover scale de `hover:scale-105` → `hover:scale-[1.02]`

### 6. Padronizar espaçamentos das game pages

- Container interno dos jogos (`div.mt-4.space-y-4`): aumentar para `mt-6 space-y-6` para respirar mais
- Remover `pt-1` avulso no skip button wrapper — usar o `space-y` do parent
- History panel e keyboard hints: remover `mt-4` extra (já dentro do `space-y`)

### 7. BaseGameContainer — Ajustes finos

- Subtitle text: aumentar de `text-xs` para `text-sm` para melhor legibilidade
- Manter `maxWidth="xl"` que já é adequado

### 8. Padronizar wrapper das game pages (Adaptive, Decade, Jersey)

- Todos já usam `pt-24 safe-area-top safe-area-bottom` — OK, manter
- Adicionar `pb-8` para bottom breathing room (hoje vai até o edge)

---

## Arquivos Afetados


| Arquivo                                                     | Mudança                                    |
| ----------------------------------------------------------- | ------------------------------------------ |
| `src/components/guess-game/GameHeader.tsx`                  | Cards com bg-card + shadow em vez de glass |
| `src/components/guess-game/AdaptiveDifficultyIndicator.tsx` | Idem para variant horizontal               |
| `src/components/jersey-game/JerseyYearOptions.tsx`          | Shadow + tamanho dos botões                |
| `src/components/jersey-game/JerseyImage.tsx`                | Fix helper text                            |
| `src/components/jersey-game/JerseyGameContainer.tsx`        | Espaçamentos                               |
| `src/components/guess-game/AdaptiveGameContainer.tsx`       | Espaçamentos                               |
| `src/components/decade-game/DecadeGameContainer.tsx`        | Espaçamentos                               |
| `src/components/decade-game/DecadeSelectionPage.tsx`        | page-warm + hover fix                      |
| `src/components/guess-game/BaseGameContainer.tsx`           | Subtitle size                              |
| `src/pages/AdaptiveGuessPlayerSimple.tsx`                   | pb-8                                       |
| `src/pages/DecadeGuessPlayerSimple.tsx`                     | pb-8                                       |
| `src/pages/JerseyQuizPage.tsx`                              | pb-8                                       |


## O que NÃO muda

- Lógica de jogo — zero alterações
- TopNavigation — mantida