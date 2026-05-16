# ADR 011 — Sistema de Feedback Inline (feedbackState)

## Status: Accepted (2026-05-16)

## Contexto

Os modos de jogo usavam `toast` (react-hot-toast / sonner) para comunicar acerto ou erro ao jogador. Isso causava:

- Sobreposição de conteúdo em mobile (toast no topo ou rodapé, longe do elemento do jogo)
- Ausência de feedback visual direto na imagem/card do objeto adivinhado
- Inconsistência entre quiz de jogadores e quiz de camisas
- Impossibilidade de animar o próprio card (borda, glow, shake)

## Decisão

Substituir toasts por um estado local `feedbackState: 'idle' | 'correct' | 'wrong'` nos containers de jogo.

- O estado é passado como prop para o componente de imagem/card, que muda sua aparência (borda, sombra, animação de shake)
- Um componente `QuizFeedbackZone` exibe mensagem contextual inline (pontos ganhos, nome do jogador)
- O estado retorna para `idle` após 2s via callback `onIdle`

## Componentes que implementam este padrão

- `AdaptivePlayerImage` — prop `feedbackState`, borda tricolor idle / glow verde correto / shake vermelho errado
- `JerseyImage` — idem, borda dourada idle
- `QuizFeedbackZone` — zona de texto contextual no quiz adaptativo
- `JerseyEducationalReveal` — card de revelação no quiz de camisas

## Consequências

**Positivo:**
- Feedback contextualizado junto ao objeto do jogo
- Consistência visual entre os dois modos
- Acessível (pode receber `aria-live` no futuro)
- Sem dependência de posicionamento de toast em mobile

**Negativo:**
- Requer propagação de prop `feedbackState` do container até componentes visuais filhos
- Lógica de detecção de correto/errado no container (delta de score ou timeout de 300ms)
