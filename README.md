# 🎮⚽️ Lendas do Flu - Quiz de Jogadores

[![Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)](https://lovable.dev)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e)](https://supabase.com/)

> Quiz interativo sobre jogadores históricos do Fluminense Football Club. Teste seus conhecimentos, desbloqueie conquistas e compare-se no ranking global!

## 📝 Visão Geral

O **Lendas do Flu** é uma aplicação web moderna que desafia os torcedores a reconhecerem jogadores históricos do Fluminense através de suas fotos. Com sistema de dificuldade adaptativa, conquistas desbloqueáveis e ranking competitivo, o jogo oferece uma experiência envolvente para fãs de todas as idades.

### ✨ Principais Funcionalidades

- 🎯 **Quiz Adaptativo**: Dificuldade ajusta automaticamente baseado no desempenho
- 📅 **Quiz por Década**: Filtre jogadores por período histórico (1970s-2020s)
- 🏆 **Sistema de Conquistas**: Desbloqueie achievements únicos
- 📊 **Ranking Global**: Compare sua pontuação com outros torcedores
- ⏱️ **Timer Dinâmico**: 60 segundos para cada jogador
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
- 🔄 React Query
- 🐻 Zustand

**Backend:**
- 🗄️ Supabase (PostgreSQL)
- ⚡ Edge Functions
- 🔐 Auth & Storage

### Estrutura do Projeto

```
src/
├── components/     # Componentes React
├── hooks/          # Hooks customizados
├── services/       # Serviços de API
├── stores/         # State management
├── types/          # TypeScript types
├── config/         # Configurações
└── utils/          # Utilitários
```

## 📚 Documentação

- 📖 [Arquitetura Completa](./docs/ARCHITECTURE.md)
- 🎮 [Fluxo do Jogo](./docs/GAME_FLOW.md)
- 🤝 [Guia de Contribuição](./docs/CONTRIBUTING.md)

## 🤝 Como Contribuir

Contribuições são bem-vindas! Veja nosso [Guia de Contribuição](./docs/CONTRIBUTING.md).

## 📝 Deploy

Visite [Lovable](https://lovable.dev/projects/2d18f90c-a6cd-4fc2-913d-b76eb4df6c17) e clique em Share → Publish.

---

<div align="center">

Feito com 💚💙 usando [Lovable](https://lovable.dev)

</div>
