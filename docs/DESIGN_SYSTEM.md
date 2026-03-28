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

## Próximos passos

- Migrar ocorrências antigas de cores fixas para tokens semânticos.
- Definir checklist de revisão visual em PRs.
- Evoluir para catálogo interativo (Storybook, se necessário).
