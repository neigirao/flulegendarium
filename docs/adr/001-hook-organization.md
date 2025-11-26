# ADR 001: Organização de Hooks por Categoria

## Status
Aceito - 2025-01-16

## Contexto
O projeto cresceu e tinha mais de 50 hooks customizados na pasta `src/hooks/`, dificultando a navegação e manutenção. Não havia uma estrutura clara para encontrar hooks relacionados.

## Decisão
Organizamos os hooks em categorias funcionais com barrel exports:

- `hooks/game/` - Hooks de gerenciamento de estado do jogo
- `hooks/admin-stats/` - Hooks de estatísticas e analytics da área admin
- `hooks/analytics/` - Hooks de tracking e analytics
- `hooks/performance/` - Hooks de monitoramento e otimização de performance
- `hooks/mobile/` - Hooks de funcionalidades e otimizações mobile
- `hooks/data/` - Hooks de gerenciamento de dados e queries
- `hooks/realtime/` - Hooks de funcionalidades em tempo real
- `hooks/auth/` - Hooks de autenticação e autorização

Cada categoria possui um `index.ts` que serve como ponto único de exportação.

## Consequências

### Positivas
- ✅ Melhor descoberta de hooks relacionados
- ✅ Imports mais claros e organizados
- ✅ Facilita refatoração e manutenção
- ✅ Reduz acoplamento entre módulos
- ✅ Melhora compreensão da estrutura por IA

### Negativas
- ⚠️ Requer atualização de imports em componentes existentes
- ⚠️ Aumenta levemente a profundidade da árvore de arquivos

## Alternativas Consideradas

1. **Manter tudo na raiz** - Rejeitado: Dificulta navegação com muitos arquivos
2. **Organizar por feature** - Rejeitado: Hooks são compartilhados entre features
3. **Organizar por layer (data/ui/logic)** - Rejeitado: Muito abstrato e ambíguo
