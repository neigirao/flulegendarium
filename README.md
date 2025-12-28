# 🎮⚽️ Lendas do Flu - Quiz de Jogadores

[![Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)](https://lovable.dev)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-Vitest%20%2B%20Playwright-4FC08D)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](./docs/CONTRIBUTING.md)

> Quiz interativo sobre jogadores históricos do Fluminense Football Club. Teste seus conhecimentos, desbloqueie conquistas e compare-se no ranking global!

## 📝 Visão Geral

O **Lendas do Flu** é uma aplicação web moderna que desafia os torcedores a reconhecerem jogadores históricos do Fluminense através de suas fotos. Com sistema de dificuldade adaptativa, conquistas desbloqueáveis e ranking competitivo, o jogo oferece uma experiência envolvente para fãs de todas as idades.

### ✨ Principais Funcionalidades

- 🎯 **Quiz Adaptativo**: Dificuldade ajusta automaticamente baseado no desempenho
- 📅 **Quiz por Década**: Filtre jogadores por período histórico (1970s-2020s)
- 👕 **Quiz das Camisas**: Adivinhe o ano das camisas históricas entre 3 opções 🆕
- 📊 **Relatórios Estendidos**: Análises de até 90 dias no painel admin 🆕
- 🏆 **Sistema de Conquistas**: Desbloqueie achievements únicos
- 📊 **Ranking Global**: Compare sua pontuação com outros torcedores
- ⏱️ **Timer Dinâmico**: 60 segundos para cada jogador/camisa
- ⚡ **Performance Otimizada**: SWR Cache, Image Transforms, Prefetch 🆕
- 💾 **Progressive Web App**: Instale e jogue offline
- 🌙 **Dark Mode**: Interface otimizada para dia e noite
- 📱 **Totalmente Responsivo**: Experiência perfeita em qualquer dispositivo

## 🚀 Como Usar

### Instalação

```bash
# Clone o repositório
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Inicie o servidor de desenvolvimento
npm run dev
```

### Build para Produção

```bash
npm run build
npm run preview
```

## 🏗️ Arquitetura

### Stack Tecnológica

**Frontend:**
- ⚛️ React 18.3 + TypeScript
- ⚡ Vite 5
- 🎨 Tailwind CSS + shadcn/ui
- 🔄 React Query (TanStack Query)
- 🐻 Zustand (State Management)
- 🎭 Framer Motion (Animações)
- ✅ Zod (Validação Runtime)

**Backend:**
- 🗄️ Supabase (PostgreSQL)
- ⚡ Edge Functions
- 🔐 Auth & Storage
- 📊 Row Level Security (RLS)

**Testes:**
- ⚡ Vitest (Unit Tests)
- 🎭 Playwright (E2E Tests)
- 🧪 Testing Library

### Visão Geral da Arquitetura

<lov-mermaid>
graph TB
    subgraph "Frontend - React SPA"
        UI[🎨 UI Components<br/>shadcn/ui + Tailwind]
        Hooks[🪝 Custom Hooks<br/>Game Logic]
        Store[🐻 Zustand Store<br/>Global State]
        Services[⚙️ Services<br/>Business Logic]
    end
    
    subgraph "Backend - Supabase"
        DB[(🗄️ PostgreSQL<br/>Players & Stats)]
        Auth[🔐 Authentication<br/>User Management]
        Storage[📦 Storage<br/>Player Images]
        Edge[⚡ Edge Functions<br/>API Logic]
    end
    
    UI --> Hooks
    Hooks --> Store
    Hooks --> Services
    Services --> DB
    Services --> Auth
    Services --> Storage
    Services --> Edge
    
    style UI fill:#61dafb
    style Hooks fill:#3178c6
    style Store fill:#764abc
    style DB fill:#3ecf8e
    style Auth fill:#3ecf8e
    style Storage fill:#3ecf8e
    style Edge fill:#3ecf8e
</lov-mermaid>

### Fluxo do Jogo

<lov-mermaid>
sequenceDiagram
    participant U as 👤 Usuário
    participant UI as 🎨 UI
    participant Hook as 🪝 useBaseGameState
    participant Svc as ⚙️ PlayerSelectionService
    participant DB as 🗄️ Supabase DB
    
    U->>UI: Inicia Jogo
    UI->>Hook: startGame()
    Hook->>Svc: selectRandomPlayer()
    Svc->>DB: Busca jogadores
    DB-->>Svc: Lista de jogadores
    Svc-->>Hook: Jogador selecionado
    Hook-->>UI: Atualiza estado
    
    U->>UI: Submete palpite
    UI->>Hook: handleGuess(name)
    Hook->>Hook: Valida resposta
    alt Resposta Correta
        Hook->>Hook: Incrementa pontos
        Hook->>Svc: selectNextPlayer()
    else Resposta Incorreta
        Hook->>Hook: Decrementa tentativas
    end
    Hook-->>UI: Atualiza UI
    
    alt Fim do Jogo
        Hook->>DB: Salva sessão
        Hook-->>UI: Mostra resultado
    end
</lov-mermaid>

### Estrutura do Projeto

```
src/
├── components/        # Componentes React organizados por feature
│   ├── guess-game/   # Componentes do quiz de jogadores
│   ├── decade-game/  # Componentes do quiz por década
│   ├── jersey-game/  # 🆕 Componentes do quiz de camisas
│   ├── home/         # 🆕 Componentes da homepage
│   ├── achievements/ # Sistema de conquistas
│   ├── admin/        # Painel administrativo
│   └── ui/           # Componentes UI reutilizáveis (shadcn)
├── hooks/            # Hooks customizados
│   ├── game/         # Hooks de lógica de jogo
│   ├── admin-stats/  # Hooks de estatísticas
│   ├── use-jersey-guess-game.ts  # 🆕 Hook quiz camisas
│   └── use-report-period.ts      # 🆕 Hook período reports
├── services/         # Serviços de negócio
│   ├── playerSelectionService.ts
│   ├── jerseyService.ts  # 🆕 Serviço quiz camisas
│   ├── rankingService.ts
│   └── achievementsService.ts
├── schemas/          # Schemas Zod para validação
│   ├── player.schema.ts
│   ├── game.schema.ts
│   └── ranking.schema.ts
├── stores/           # State management (Zustand)
│   ├── gameStore.ts
│   └── uiStore.ts
├── types/            # TypeScript types & interfaces
│   ├── game.ts
│   ├── guess-game.ts
│   └── utils.ts
├── config/           # Configurações
│   ├── game-config.ts
│   └── difficulty-levels.ts
└── utils/            # Funções utilitárias
    ├── validation.ts
    ├── logger.ts
    └── player-image/
```

### Camadas da Aplicação

<lov-mermaid>
graph LR
    subgraph "Presentation Layer"
        A[Components]
    end
    
    subgraph "Logic Layer"
        B[Custom Hooks]
        C[Services]
    end
    
    subgraph "Data Layer"
        D[Zustand Store]
        E[React Query Cache]
        F[Schemas & Validation]
    end
    
    subgraph "External"
        G[Supabase API]
    end
    
    A --> B
    B --> C
    B --> D
    C --> E
    C --> F
    C --> G
    
    style A fill:#61dafb
    style B fill:#3178c6
    style C fill:#764abc
    style D fill:#ff6b6b
    style E fill:#4ecdc4
    style F fill:#45b7d1
    style G fill:#3ecf8e
</lov-mermaid>

## 📚 Documentação

- 📖 [Arquitetura Completa](./docs/ARCHITECTURE.md)
- 🎮 [Fluxo do Jogo](./docs/GAME_FLOW.md)
- 🤝 [Guia de Contribuição](./docs/CONTRIBUTING.md)
- 🧪 [Guia de Testes](./docs/guides/TESTING.md)
- 📊 [API de Hooks](./docs/api/HOOKS_API.md)

## 🤝 Como Contribuir

Contribuições são bem-vindas! Veja nosso [Guia de Contribuição](./docs/CONTRIBUTING.md).

## 📝 Deploy

Visite [Lovable](https://lovable.dev/projects/2d18f90c-a6cd-4fc2-913d-b76eb4df6c17) e clique em Share → Publish.

---

<div align="center">

Feito com 💚💙 usando [Lovable](https://lovable.dev)

</div>
