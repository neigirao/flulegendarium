# Design System — Flulegendarium

Este documento define os padrões visuais e de implementação da aplicação.

## Objetivos

- Garantir consistência visual em todas as páginas.
- Reduzir retrabalho de UI com componentes reutilizáveis.
- Melhorar acessibilidade e previsibilidade de interação.

## Fundamentos

### 1) Cores (tokens semânticos)

Sempre utilizar tokens do tema (`src/index.css` + `tailwind.config.ts`) e **evitar valores hardcoded**.

- `primary` / `primary-foreground`: CTA principal, ações primárias.
- `secondary` / `secondary-foreground`: ações complementares.
- `accent`: áreas de destaque neutro.
- `success`, `warning`, `info`, `error`: feedback semântico.
- `muted`, `border`, `input`: superfícies e texto de apoio.

### 2) Tipografia

- Títulos: classes utilitárias com peso alto e contraste.
- Texto de corpo: legibilidade e espaçamento confortável.
- Captions: suporte contextual com `text-sm` e `text-muted-foreground`.

### 3) Espaçamento

Adotar ritmo baseado em múltiplos de 4 (`4, 8, 12, 16, 24, 32...`) para blocos, componentes e micro-layouts.

### 4) Raio e sombras

- Raio base via `--radius`.
- Sombras priorizando variações leves para hierarquia sem ruído.

## Componentes base

Os componentes reutilizáveis vivem em `src/components/ui/*`.

Priorize:

- `Button`, `Card`, `Input`, `Label`, `Tabs`, `Badge`, `Separator`
- Variações por `variant` e `size`, evitando duplicação de estilo local.

## Página de referência

A vitrine do design system está em:

- Rota interna: `/design-system` (apenas em ambiente de desenvolvimento, ou quando `VITE_ENABLE_DESIGN_SYSTEM=true`)
- Arquivo: `src/pages/DesignSystem.tsx`

Ela inclui:

- Paleta semântica
- Escala tipográfica
- Escala de espaçamento
- Exemplos de componentes e estados

## Regras de adoção (Do / Don’t)

### Do

- Usar tokens (`bg-primary`, `text-muted-foreground`, etc.).
- Reutilizar componentes da pasta `ui`.
- Manter contraste e hierarquia visual.

### Don’t

- Hardcode de cor (`#123456`) sem justificativa técnica.
- Criar botão/cartão personalizado sem avaliar componente base.
- Misturar padrões de espaçamento arbitrários.

## Paleta de Marca

Sempre usar os tokens semânticos abaixo. Nunca escrever hex diretamente sem justificativa técnica.

| Nome | Classe Tailwind | Hex | Uso |
|------|----------------|-----|-----|
| Grená | `bg-primary` / `text-primary` | `#7A0213` | CTA principal, títulos de jogo, alertas de urgência |
| Verde | `bg-secondary` / `text-secondary` | `#006140` | Sucesso, acertos, ações secundárias |
| Gold | `bg-accent` / `text-accent` | `#C4944A` | Destaque, conquistas, novidades, tier ouro |

## Tipografia de Display

A fonte **Bebas Neue** está carregada e mapeada para a classe `font-display`.

Usar `font-display` em: scores numéricos, timers, headings de jogo, rankings, títulos de página.

Não usar `font-display` em texto de corpo, descrições ou labels de UI.

## Padrões de Componente

### feedbackState

Componentes visuais de jogo usam `feedbackState: 'idle' | 'correct' | 'wrong'`:

| Estado | Visual | Classes |
|--------|--------|---------|
| `idle` | Borda tricolor padrão | default |
| `correct` | Glow verde | `border-secondary shadow-[0_0_24px_#006140]` |
| `wrong` | Borda vermelha + shake | `animate-shake border-destructive` |

**Não usar toast** para feedback de acerto/erro inline de jogo — usar este padrão.

### Tricolor Stripe

Barra de 5–6px no topo de cards com gradiente tricolor:

```css
background: linear-gradient(90deg, #7A0213 33%, white 33% 66%, #006140 66%);
```

### accentStyles Lookup

Para cards com múltiplos temas de cor, usar objeto de lookup em vez de condicionais:

```tsx
const accentStyles = {
  grena: { stripe: 'bg-primary', cta: 'text-primary', ... },
  verde: { stripe: 'bg-secondary', cta: 'text-secondary', ... },
  gold:  { stripe: 'bg-accent',   cta: 'text-accent',   ... },
};
const s = accentStyles[accent];
```

## Próximos passos

- Migrar ocorrências antigas de cores fixas para tokens semânticos.
- Definir checklist de revisão visual em PRs.
- Evoluir para catálogo interativo (Storybook, se necessário).
