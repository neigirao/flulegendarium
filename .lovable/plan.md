

# Plano: Botao "Tive um problema" abaixo do input de resposta

## Resumo

Substituir o botao de flag nas imagens por um botao de texto "Tive um problema" posicionado abaixo do campo de resposta (GuessForm no quiz de jogadores, JerseyYearOptions no quiz de camisas). Ao clicar, o report e salvo, o usuario recebe um agradecimento, e o jogo e encerrado (gameOver). No admin, a secao existente `ImageFeedbackReport` ja funciona para exibir os reports.

## Mudancas

### 1. Refatorar `ImageFeedbackButton.tsx`

- Remover o estilo de icone/flag absoluto
- Novo visual: botao de texto discreto com "Tive um problema"
- Ao clicar e confirmar: salvar report, mostrar toast de agradecimento, chamar callback `onReportSent` (novo prop)
- Nova prop `onReportSent: () => void` para que o container do jogo encerre a partida

### 2. Remover `ImageFeedbackButton` dos componentes de imagem

- **`UnifiedPlayerImage.tsx`**: remover o `ImageFeedbackButton` (linhas 271-278)
- **`ImageGuard.tsx`**: remover o `ImageFeedbackButton` (linhas 178-185)
- **`JerseyImage.tsx`**: remover o `ImageFeedbackButton` do estado de erro

### 3. Adicionar botao no `AdaptiveGameContainer.tsx`

- Importar `ImageFeedbackButton`
- Posicionar abaixo do `SkipPlayerButton` (apos linha 416)
- Passar `itemName={currentPlayer.name}`, `itemType="player"`, `imageUrl={currentPlayer.image_url}`, `itemId={currentPlayer.id}`
- `onReportSent={() => resetScore()}` — encerra o jogo (resetScore forca gameOver)

### 4. Adicionar botao no `JerseyGameContainer.tsx`

- Posicionar abaixo do `SkipPlayerButton` (apos linha 444)
- Passar `itemName={"Camisa " + currentJersey.years.join('/')}`, `itemType="jersey"`, `imageUrl={currentJersey.image_url}`, `itemId={currentJersey.id}`
- `onReportSent` encerra o jogo da mesma forma

### 5. Verificar se existe `GameContainer.tsx` (modo classico)

- Se o modo classico tambem tem imagem+input, adicionar la tambem

## Arquivos

| Acao | Arquivo |
|------|---------|
| Editar | `src/components/image-feedback/ImageFeedbackButton.tsx` |
| Editar | `src/components/player-image/UnifiedPlayerImage.tsx` |
| Editar | `src/components/guards/ImageGuard.tsx` |
| Editar | `src/components/jersey-game/JerseyImage.tsx` |
| Editar | `src/components/guess-game/AdaptiveGameContainer.tsx` |
| Editar | `src/components/jersey-game/JerseyGameContainer.tsx` |

