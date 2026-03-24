# Redesign Visual dos Jogos de Adivinhação

## Regras Confirmadas (mantidas intactas)

- Primeiro erro = Game Over imediato
- Sem dicas
- Timer de 45s
- Diálogo de confirmação antes do palpite
- Campo de texto livre (sem autocomplete)
- Skip com penalidade
- Dificuldade adaptativa
- Paridade entre 3 modos
- Pontuação por velocidade

## Mudanças Visuais (baseadas no layout)

### 1. Timer Circular (`GameTimer.tsx`)

Substituir o timer retangular por um **timer circular com anel SVG animado** (como na imagem). O anel verde diminui conforme o tempo passa, ficando vermelho nos últimos 5 segundos. O tempo fica centralizado dentro do círculo.

### 2. Indicador de Combo Visual (`ComboIndicator.tsx` — novo)

Criar componente que exibe o streak atual como "🔥 Nx Combo" ao lado do timer. Puramente decorativo — mostra `currentStreak` sem afetar pontuação. Aparece quando streak >= 2.

### 3. Score Card Redesenhado (`GameHeader.tsx`)

Redesenhar o card de score no estilo da imagem: fundo translúcido com label "SCORE:" acima do número e ícone de estrela. Layout horizontal: Score à esquerda, Timer circular no centro, Combo à direita.

### 4. Card da Imagem do Jogador (`AdaptivePlayerImage.tsx`)

Borda com gradiente verde/vermelho (tricolor) e cantos arredondados. Glow sutil verde ao redor do card. Manter os filtros de dificuldade existentes.

### 5. Barra de Dificuldade Vertical (`AdaptiveDifficultyIndicator.tsx`)

Substituir o indicador horizontal por uma **barra vertical** à direita da imagem, com 5 segmentos coloridos (verde claro → verde escuro) e label "DIFFICULTY: N/5".

### 6. Background e Layout Geral

- Background: gradiente escuro (dark teal/green) — já existe no page wrapper, ajustar tons
- Botão "Voltar" no canto superior direito 
- Título "Lendas do Flu" + subtítulo do modo centralizado no topo

### 7. Aplicar aos 3 Modos

Como os 3 containers usam `BaseGameContainer` + `GameHeader`, as mudanças se propagam automaticamente. Componentes específicos (como a barra de dificuldade vertical) serão adaptados por modo:

- **Adaptativo**: barra de dificuldade vertical
- **Década**: badge da década selecionada
- **Camisas**: adaptação equivalente

### Componentes Afetados

- `GameTimer.tsx` — timer circular SVG
- `GameHeader.tsx` — novo layout (score + timer + combo)
- `AdaptivePlayerImage.tsx` — borda tricolor com glow
- `AdaptiveDifficultyIndicator.tsx` — barra vertical
- `BaseGameContainer.tsx` — ajustes de layout
- Novo: `ComboIndicator.tsx` — indicador de streak visual
- Pages: `AdaptiveGuessPlayerSimple.tsx`, `DecadeGuessPlayerSimple.tsx` — ajuste de background