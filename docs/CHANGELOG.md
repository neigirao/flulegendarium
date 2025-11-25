# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### 🎯 Melhoria de Manutenibilidade (2025-01-16)

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
