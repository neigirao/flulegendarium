# ADR 009: Paginação Client-Side no Admin Dashboard

## Status
Aceito — 2026-05-02

## Contexto

As views `PlayersManagement` e `JerseysManagement` carregavam todos os registros de uma vez e renderizavam a lista inteira no DOM. Com 100+ jogadores e 80+ camisas, isso causava:

- Lentidão na renderização inicial do admin
- Scroll longo e difícil de navegar
- Re-renders custosos a cada filtro ou busca

## Decisão

Implementamos paginação **client-side** com 24 itens por página em ambas as views, usando `useState` para `currentPage` e `useMemo` para calcular o slice da lista filtrada.

Optamos por client-side (não server-side) porque:

1. Os dados já estão carregados via TanStack Query com cache — não há custo de rede adicional
2. O volume total (< 500 registros) é pequeno o suficiente para manter em memória
3. A filtragem local já era feita client-side — paginação server-side exigiria refatoração de todas as queries

A página reseta para 1 automaticamente via `useEffect` quando os filtros ou o termo de busca mudam.

## Alternativas consideradas

- **Paginação server-side (Supabase `.range()`):** Melhor para volumes grandes, mas exigiria redesenho das queries e perderia o cache local. Desnecessário no volume atual.
- **Virtualização (react-virtual):** Resolve performance sem paginar, mas aumenta complexidade e não resolve o problema de UX de scroll longo.

## Consequências

### Positivas
- ✅ Renderização inicial mais rápida
- ✅ Navegação mais simples para o admin
- ✅ Zero mudanças nas queries Supabase
- ✅ Reseta página ao filtrar — UX consistente

### Negativas / Riscos
- ⚠️ Se o volume crescer muito (> 1000 registros), o carregamento inicial pode ficar lento — nesse ponto migrar para server-side
- ⚠️ Número de páginas exibido linearmente no componente `<Pagination>` — com muitas páginas fica verboso (adicionar elipsis no futuro)

## Arquivos afetados

- `src/components/admin/PlayersManagement.tsx`
- `src/components/admin/jerseys/JerseysManagement.tsx`
