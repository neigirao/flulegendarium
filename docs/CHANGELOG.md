# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### 👕 Quiz das Camisas - Múltipla Escolha (2025-01-XX)

#### Added
- ✅ `JerseyYearOptions` - Componente de 3 opções de ano com feedback visual
- ✅ `generateYearOptions()` - Gerador de opções com distância 1-3 anos
- ✅ `JerseyTutorial` - Tutorial de onboarding para o quiz de camisas
- ✅ Mecânica de múltipla escolha em vez de input de texto
- ✅ `GameModesPreview` - Componente na home mostrando os 3 modos de jogo

#### Changed
- 🔄 `use-jersey-guess-game.ts` - Suporte a opções e resultado visual
- 🔄 `jerseyService.ts` - Métodos `generateOptions()` e `checkOptionSelection()`
- 🔄 `JerseyGameContainer.tsx` - Usa `JerseyYearOptions` em vez de `JerseyGuessForm`
- 🔄 `Index.tsx` - Atualizada home com GameModesPreview e contagem de camisas

### 📊 Sistema de Relatórios Estendidos - 90 dias (2025-01-XX)

#### Added
- ✅ `useReportPeriod` hook - Gerencia período de relatórios com persistência
- ✅ `PeriodSelector` componente - UI para seleção de período
- ✅ Suporte a períodos de 7, 14, 30, 60 e 90 dias

#### Changed
- 🔄 `executiveAnalyticsService` - Suporte a `days` dinâmico
- 🔄 `adminBusinessIntelligence` - Suporte a `days` dinâmico
- 🔄 Todos os hooks de reports com queryKey dinâmica

### ⚡ Otimizações de Performance (2025-01-XX)

#### Added
- ✅ SWR Cache em `usePlayersData` (TTL: 10min, stale: 2min)
- ✅ `OptimizedImage` em `JerseyImage` com srcset e lazy loading
- ✅ Hover prefetch em `TopNavigation` e botão principal da Index
- ✅ `supabaseTransforms.ts` - Utilitário para transformar URLs de imagens

### 📝 FAQ e SEO (2025-01-XX)

#### Added
- ✅ Nova categoria "Quiz das Camisas" no FAQ com 6 perguntas
- ✅ Rotas SEO para `/quiz-camisas`, `/conquistas`, `/perfil`, `/doacoes`
- ✅ Schema FAQPage para structured data

#### Changed
- 🔄 FAQ atualizado com informação dos 3 modos de jogo
- 🔄 SEO da home atualizado com menção aos 3 modos

---

### 🎉 Fase Final de Manutenibilidade - COMPLETA (2025-01-16)

#### Removed (Dead Code Cleanup)
- ❌ Removidos 7 hooks não utilizados: `use-observability`, `use-debug`, `use-image-observer`, `use-resource-hints`, `use-iframe-cache`, `use-achievement-system`, `use-simple-game-session`
- ❌ Corrigida exportação duplicada de `useMobilePerformance` em `hooks/performance/index.ts`

#### Changed (Logger Migration)
- 🔄 Migrados console.logs para logger centralizado em hooks críticos: `use-edit-player-form`, `use-edit-player-submission`
- 🔄 Migrados console.logs em componentes PWA: `PWAProvider`, `PWAInstallPrompt`
- 🔄 Migrados console.logs em services: `decadePlayerService`

#### Fixed (TODOs Resolved)
- ✅ Resolvido TODO em `AchievementsGrid`: Implementado cálculo real de progresso baseado em estatísticas
- ✅ Resolvido TODO em `PersonalDashboard`: Implementadas queries para década favorita, rank e total de jogadores

#### Added (Documentation)
- ✅ Criado `docs/adr/003-adaptive-difficulty-system.md` - ADR sobre sistema de dificuldade
- ✅ Criado `docs/adr/004-image-fallback-strategy.md` - ADR sobre estratégia de fallback de imagens
- ✅ Criado `docs/adr/005-service-worker-caching.md` - ADR sobre cache do Service Worker
- ✅ Atualizados componentes otimizados: `AchievementsGridOptimized`, `PersonalDashboardOptimized`

### 🎯 Melhoria de Manutenibilidade - Fase 4 (2025-01-16)

#### Added
- ✅ Criado `src/hooks/mobile/index.ts` - Consolidação de hooks mobile
- ✅ Criado `src/hooks/data/index.ts` - Consolidação de hooks de dados
- ✅ Criado `src/hooks/realtime/index.ts` - Consolidação de hooks realtime
- ✅ Criado `src/hooks/auth/index.ts` - Consolidação de hooks de autenticação
- ✅ Criado `docs/adr/001-hook-organization.md` - ADR sobre organização de hooks
- ✅ Criado `docs/adr/002-centralized-logging.md` - ADR sobre sistema de logging
- ✅ Criado `docs/api/SERVICES_API.md` - Documentação completa de services
- ✅ Criado `docs/guides/DEPLOYMENT.md` - Guia completo de deploy
- ✅ Criado `docs/guides/TROUBLESHOOTING.md` - Guia de resolução de problemas

#### Changed
- 🔄 Hooks organizados em 8 categorias funcionais
- 🔄 Documentação técnica completa implementada

### 🎯 Melhoria de Manutenibilidade - Fase 2 (2025-01-16)

#### Added
- ✅ Criado `src/hooks/admin-stats/index.ts` - Consolidação de hooks admin
- ✅ Atualizado `src/hooks/game/index.ts` - Exporta todos hooks de game

#### Changed  
- 🔄 Hook `use-user-analytics.ts` removido (não utilizado)
- 🔄 Hooks de game consolidados com barrel export
- 🔄 Hooks admin organizados em módulo dedicado

### 🎯 Melhoria de Manutenibilidade - Fase 1 (2025-01-16)

#### Added
- ✅ Criado `docs/AI_GUIDE.md` - Guia completo para IA com estrutura do projeto
- ✅ Criado `docs/CHANGELOG.md` - Histórico de mudanças
- ✅ Criado `src/hooks/analytics/index.ts` - Consolidação de hooks de analytics
- ✅ Criado `src/hooks/performance/index.ts` - Consolidação de hooks de performance
- ✅ Migração de console.logs críticos para `src/utils/logger.ts`

#### Removed
- ❌ Removido `src/hooks/use-player-selection.ts` (não utilizado)
- ❌ Removido `src/hooks/use-enhanced-player-selection.ts` (não utilizado)
- ❌ Removido `src/hooks/use-game-state.ts` (deprecated)
- ❌ Removido `src/hooks/use-game-metrics.ts` (não utilizado)
- ❌ Removido `src/hooks/use-performance.ts` (duplicado)
- ❌ Removido `src/hooks/use-optimized-performance.ts` (duplicado)
- ❌ Removido `src/hooks/use-performance-monitor.ts` (duplicado)
- ❌ Removido `src/hooks/use-performance-optimization.ts` (duplicado)
- ❌ Removido `src/components/social/SocialShareModal.tsx` (não utilizado)

#### Changed
- 🔄 Hooks de analytics agora devem ser importados de `@/hooks/analytics`
- 🔄 Hooks de performance agora devem ser importados de `@/hooks/performance`
- 🔄 Logger centralizado substituindo console.logs em arquivos críticos

### 🎮 Sistema de Dificuldade (2025-01-16)

#### Fixed
- 🐛 Corrigido sistema de seleção de jogadores para SEMPRE respeitar `difficulty_level` do banco
- 🐛 Removidos fallbacks que permitiam seleção de jogadores com dificuldade diferente
- 🐛 Corrigida prioridade de carregamento de imagens (banco > fallback > padrão)

#### Changed
- ⚠️ **BREAKING**: `playerSelectionService.selectRandomPlayer()` agora retorna `null` se não houver jogadores na dificuldade especificada
- ⚠️ **BREAKING**: `useAdaptivePlayerSelection.selectPlayerByDifficulty()` não usa mais fallbacks de dificuldade

---

## [1.0.0] - 2024-XX-XX

### Added
- 🎉 Lançamento inicial do Lendas do Flu
- ✅ Sistema de jogo adaptativo com ajuste de dificuldade
- ✅ Modo de jogo por década
- ✅ Sistema de ranking e pontuação
- ✅ Autenticação com Supabase
- ✅ Dashboard administrativo
- ✅ Sistema de conquistas
- ✅ PWA com Service Worker
- ✅ Sistema de cache de imagens
- ✅ Analytics com Google Analytics

---

## Tipos de Mudanças

- `Added` - Novas funcionalidades
- `Changed` - Mudanças em funcionalidades existentes
- `Deprecated` - Funcionalidades que serão removidas
- `Removed` - Funcionalidades removidas
- `Fixed` - Correções de bugs
- `Security` - Correções de segurança

## Símbolos

- 🎉 Nova feature importante
- ✅ Feature adicionada
- 🔄 Mudança/refatoração
- 🐛 Bug fix
- ⚠️ Breaking change
- 🔒 Security fix
- 📝 Documentação
- ⚡ Performance
- 🎨 UI/UX
- ❌ Remoção
