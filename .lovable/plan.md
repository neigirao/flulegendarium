

# Plano: Mostrar botão de feedback de imagem sempre no quiz

## Problema

O `ImageFeedbackButton` só aparece dentro do bloco `imageStatus === 'error'` no `UnifiedPlayerImage.tsx` (linha 262). Se a imagem carrega (mesmo sendo a errada ou de baixa qualidade), o botão nunca é exibido. O usuário precisa poder reportar imagens incorretas mesmo quando elas carregam.

## Correção

**`src/components/player-image/UnifiedPlayerImage.tsx`**:
- Mover o `ImageFeedbackButton` para fora do bloco de erro, posicionado no canto inferior direito do container da imagem
- Mostrar o botão sempre que `imageStatus === 'loaded'` OU `imageStatus === 'error'`
- Usar `position: absolute` sobre a imagem (já é o estilo do botão)

**`src/components/guess-game/AdaptivePlayerImage.tsx`**:
- Verificar se o container tem `position: relative` para o botão absolute funcionar (já tem)

## Escopo

1 arquivo editado: `UnifiedPlayerImage.tsx` — mover o `ImageFeedbackButton` para dentro do container da imagem (div linha 221-276), visível quando `loaded` ou `error`.

