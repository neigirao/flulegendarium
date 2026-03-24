

# Retrofit Visual Completo — Lendas do Flu

## Diagnóstico do Estado Atual

### Problemas Identificados

1. **Inconsistência de backgrounds entre páginas**:
   - Home (`Index.tsx`): gradiente escuro `from-secondary via-neutral-700 to-primary`
   - GameModeSelection: gradiente escuro `from-secondary via-primary/80 to-secondary/90`
   - FAQ: `bg-tricolor-vertical-border` (fundo branco com borda tricolor)
   - Donations: gradiente escuro `from-primary via-primary/80 to-secondary`
   - Auth: `bg-tricolor-vertical-border` (fundo branco)
   - Social/Profile/Conquistas: `bg-tricolor-vertical-border` (fundo branco)
   - Estatísticas: `bg-background` (branco puro)
   - Jogos: dark teal gradient (redesign recente)
   - **Resultado**: cada página parece um site diferente

2. **Cores hardcoded restantes**:
   - `NotFound.tsx`: `text-flu-grena`, `bg-flu-verde`, `bg-flu-grena` (classes CSS diretas)
   - `Conquistas.tsx`: `border-flu-grena`, `text-flu-grena`, `bg-flu-grena`, `text-gray-600`
   - `ProfilePage.tsx`: `bg-green-500`, `bg-red-500` (badges de desafios)

3. **Hierarquia visual fraca na Home**:
   - Hero text usa `text-primary-foreground` (branco) sobre fundo escuro mas os cards de modo de jogo usam `bg-card/10` (quase invisível)
   - Seção "Como Funciona" repete o CTA sem diferenciação visual
   - Login banner e stats banner têm estilos quase idênticos

4. **Páginas informativas sem identidade visual**:
   - FAQ, Social, Profile, Conquistas usam `bg-tricolor-vertical-border` que é apenas uma borda de 4px — o resto é branco genérico
   - Falta warmth/personalidade tricolor nessas páginas

5. **Cards inconsistentes**:
   - Home: `bg-card/10 backdrop-blur-sm` (glassmorphism)
   - GameModeSelection: `bg-card/95 rounded-2xl p-6 shadow-xl` (sólido)
   - FAQ: `Card` padrão shadcn (sólido branco)
   - Profile: `Card` padrão shadcn
   - Mistura de glass + sólido sem critério

6. **Tipografia**: Bebas Neue + Inter estão corretas, mas a aplicação é inconsistente (alguns títulos usam `font-display`, outros não)

---

## Estratégia do Retrofit

### Princípio: Dois Temas, Um Sistema

```text
┌─────────────────────────────────────────┐
│  TEMA ESCURO (gameplay imersivo)        │
│  - Páginas de quiz (3 modos)            │
│  - Dark teal gradient (já implementado) │
│  - Cards glass com backdrop-blur        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  TEMA CLARO (informativo/navegação)     │
│  - Home, GameModeSelection, FAQ, Auth   │
│  - Social, Profile, Conquistas, Doações │
│  - Estatísticas, News, 404             │
│  - Fundo off-white com textura sutil    │
│  - Cards brancos com borda/sombra suave │
└─────────────────────────────────────────┘
```

### Nova Paleta para Tema Claro
- **Background**: `#F8F5F0` (off-white quente, tom parchment)
- **Cards**: branco `#FFFFFF` com `shadow-sm` e borda `border-primary/10`
- **Accent dourado**: `#C4A265` para destaques premium (badges, ícones)
- **Texto principal**: grená escuro `var(--primary)` para títulos
- **Texto body**: `var(--foreground)` / `var(--muted-foreground)` 
- **CTAs**: botões grená sólido (já existente)

---

## Mudanças por Página

### 1. CSS Global (`src/index.css`)
- Adicionar variável `--background-warm: 30 25% 97%` para o tom off-white
- Adicionar `--gold-accent: 38 43% 58%` para detalhes dourados
- Criar classe `.bg-warm` e `.page-container-light` reutilizável
- Manter os temas de jogo escuro intactos

### 2. Home (`Index.tsx`) — Redesign completo
- **Background**: gradiente off-white quente em vez do escuro
- **Hero**: título grená grande sobre fundo claro, subtítulo em muted
- **Cards de modo**: brancos com ícone colorido, borda sutil, hover com shadow
- **Seções**: separadas por fundo alternado (branco / off-white levemente mais escuro)
- **Ranking**: cards brancos com medalhas douradas
- **"Como Funciona"**: ícones numerados em círculos grená/verde sobre fundo claro
- Texto muda de `text-primary-foreground` → `text-primary` (grená) e `text-foreground`

### 3. GameModeSelection — Redesign (já planejado, tema claro com cards verticais)
- Background off-white com marca d'água sutil
- Cards horizontais com SVG customizado + borda dourada
- Manter banner login + timer

### 4. FAQ (`FAQ.tsx`)
- Background off-white quente em vez de branco puro
- Hero section: gradiente grená→verde mantido (é bonito)
- Cards de categoria: adicionar left-border grená em vez de `border-primary/20`
- Instagram CTA section: manter o gradiente atual

### 5. Auth (`Auth.tsx`)
- Background off-white quente
- Card de login: manter branco, adicionar shadow mais expressiva
- Escudo do Flu maior no topo

### 6. Donations (`Donations.tsx`)
- **Trocar** do gradiente escuro para fundo off-white quente
- Cards de valor: brancos com hover grená
- QR Code section: card com borda dourada
- Textos: grená em vez de `text-primary-foreground` (branco)

### 7. Social (`SocialPage.tsx`)
- Background off-white
- Cards de ranking e challenge: brancos
- Títulos em grená

### 8. Profile (`ProfilePage.tsx`)
- Background off-white
- Stat cards: brancos com ícone grená (já são, basicamente)
- Corrigir `bg-green-500`/`bg-red-500` → `bg-success`/`bg-error`
- Avatar area: fundo grená sutil

### 9. Conquistas (`Conquistas.tsx`)
- Background off-white
- Eliminar `text-flu-grena`, `bg-flu-grena`, `text-gray-600` → tokens semânticos

### 10. Estatísticas (`EstatisticasPublicas.tsx`)
- Background off-white em vez de `bg-background` (muito branco e frio)
- Section headers: manter estilo atual, ajustar fundo

### 11. NotFound (`NotFound.tsx`)
- Background off-white
- Eliminar `text-flu-grena`, `bg-flu-verde`, `bg-flu-grena` → `text-primary`, `bg-secondary`, `bg-primary`

### 12. DailyChallengesPage
- Background off-white (alinhado com Profile e Social)

### 13. NewsPortal
- Background off-white

### 14. GameModesPreview (componente na Home)
- Cards: brancos com sombra em vez de `bg-card/10` glass
- Ícones: em círculos com fundo grená/verde/accent

---

## Componentes Afetados (resumo)
- `src/index.css` — novas variáveis + classes utilitárias
- `src/pages/Index.tsx` — background + cores de texto
- `src/pages/GameModeSelection.tsx` — redesign completo (já planejado)
- `src/pages/FAQ.tsx` — background
- `src/pages/Auth.tsx` — background
- `src/pages/Donations.tsx` — background + cores de texto
- `src/pages/SocialPage.tsx` — background
- `src/pages/ProfilePage.tsx` — background + fix hardcoded colors
- `src/pages/Conquistas.tsx` — background + fix hardcoded colors
- `src/pages/EstatisticasPublicas.tsx` — background
- `src/pages/NotFound.tsx` — background + fix hardcoded colors
- `src/pages/DailyChallengesPage.tsx` — background
- `src/pages/NewsPortal.tsx` — background
- `src/components/home/GameModesPreview.tsx` — cards style
- `src/components/home/GameTypeRankings.tsx` — cards style

## O que NÃO muda
- **TopNavigation** — mantida como está (conforme solicitado)
- **Páginas de quiz** (Adaptive, Decade, Jersey) — redesign dark teal recente mantido
- **GameTimer, ComboIndicator, GameHeader** — recém redesenhados, mantidos
- **Lógica de jogo** — zero mudanças
- **Design tokens** existentes — preservados, apenas adicionamos novos

## Impacto
- **~15 arquivos** com mudanças (maioria são trocas de className de background)
- **Consistência visual** em todas as páginas não-gameplay
- **Identidade tricolor** preservada com tom quente em vez de branco frio genérico
- **Zero mudanças funcionais**

