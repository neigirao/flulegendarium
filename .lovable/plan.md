

# Corrigir Layout das Páginas de Jogo

## Problema
As páginas de jogo (Quiz Adaptativo, Quiz por Década, Quiz das Camisas) usam `page-warm` no wrapper externo, mas o `BaseGameContainer` usa `ResponsiveContainer variant="game"` que aplica um estilo visual diferente do restante do site:
- `bg-gradient-to-br from-secondary/5 via-background to-primary/5` (gradiente sutil)
- `border border-border rounded-2xl shadow-lg backdrop-blur-sm` (card com borda e sombra)

Isso cria um "card" visual separado que destoa do padrão claro/warm usado nas demais páginas (Home, FAQ, Doações, etc.), onde o conteúdo flui diretamente sobre o fundo `page-warm`.

## Solução

### 1. Atualizar `ResponsiveContainer` — variante `game`
Mudar a variante `game` de um card glassmorphism para um container limpo que harmonize com o tema warm:
- Remover `bg-gradient-to-br from-secondary/5 via-background to-primary/5`
- Remover `border border-border rounded-2xl shadow-lg backdrop-blur-sm`
- Substituir por estilo clean: fundo branco sutil com sombra leve (como os cards das outras páginas) ou transparente

**Arquivo**: `src/components/ux/ResponsiveContainer.tsx` (linha ~30)

### 2. Ajustar `BaseGameContainer` — cores de texto
Com o fundo agora claro, garantir que:
- Título "LENDAS DO FLU" use `text-primary` (grená) em vez de `text-foreground`
- Subtítulo use `text-muted-foreground`
- Botões e ícones mantenham contraste adequado sobre fundo claro

**Arquivo**: `src/components/guess-game/BaseGameContainer.tsx`

### 3. Verificar containers dos jogos específicos
Os game containers internos (AdaptiveGameContainer, JerseyGameContainer, DecadeGameContainer) podem ter estilos inline que conflitam. Garantir que nenhum aplica gradientes escuros ou backgrounds que destoem.

## Arquivos afetados
- `src/components/ux/ResponsiveContainer.tsx` — variante `game`
- `src/components/guess-game/BaseGameContainer.tsx` — cores de texto/header

## O que NÃO muda
- Lógica de jogo — zero alterações
- TopNavigation — mantida
- Componentes de gameplay (timer, combo, difficulty) — mantidos

