

# Redesign da Página "Selecionar Modo de Jogo"

## Visão Geral
Refazer a página `/selecionar-modo-jogo` seguindo o layout da imagem: fundo claro/bege, cards empilhados verticalmente com ícones SVG customizados e borda dourada, mantendo banner de login e seletor de timer.

## Mudanças

### 1. Background e estrutura geral
- Substituir o gradiente escuro tricolor por fundo **off-white/bege** (`#F5F0E8` ou similar)
- Adicionar marca d'água sutil do escudo do Flu em opacidade baixa como background decorativo
- Remover os stripes diagonais atuais

### 2. Cards de modo de jogo — layout vertical
- Trocar o grid `grid-cols-3` por layout vertical (`flex flex-col`, `max-w-xl mx-auto`)
- Cada card terá layout **horizontal**: ícone à esquerda, texto + botão à direita
- Borda arredondada com **borda dourada/grená** sutil (como na imagem)
- Fundo branco com sombra suave
- Badge "NOVO!" no Quiz das Camisas (substituindo "POPULAR")

### 3. Ícones SVG customizados
- Criar 3 ícones SVG inline:
  - **Quiz Adaptativo**: cérebro estilizado (referência Brain do layout)
  - **Quiz por Década**: calendário com grid (referência Calendar do layout)
  - **Quiz das Camisas**: camisa/jersey (referência Shirt do layout)
- Cada ícone em um container circular com fundo bege e borda dourada

### 4. Título
- "ESCOLHA SEU MODO DE JOGO" em tipografia bold/display, cor grená escura
- Sem o ícone de escudo/? que existe hoje

### 5. Elementos mantidos
- **Banner de login** (para usuários não autenticados) — adaptar cores para fundo claro
- **TimerSelector** compact no header — adaptar cores para fundo claro
- **Botão Voltar** — adaptar para cores do tema claro
- Lógica de analytics, onboarding (CoachMark), data-testid

### 6. Elementos removidos
- Widget de desafios diários
- Seção de dicas para tricolores
- Welcome message para usuários logados
- Lista de features em cada card (bullet points)

### 7. Textos dos cards (como na imagem)
- Cada card terá: título bold, descrição curta (1-2 linhas), botão "Jogar agora" em grená

### Componentes afetados
- `src/pages/GameModeSelection.tsx` — rewrite completo do JSX
- Nenhum componente novo necessário (SVGs inline no próprio arquivo)

### Cores adaptadas para tema claro
- Textos: grená escuro (`#722F37` ou `var(--primary)`)
- Cards: branco com borda dourada (`#C4A265`)
- Botões "Jogar agora": fundo grená, texto branco
- Banner login: fundo amarelo claro com borda dourada

