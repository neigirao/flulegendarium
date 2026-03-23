
# Auditoria Completa — Progresso

## Concluídos

| # | Item | Status |
|---|------|--------|
| 1 | Fix `useAnalytics` eventQueue → `useRef` | ✅ Feito |
| 2 | Atualizar preload de imagem (PNG → WebP) | ✅ Feito |
| 3 | Remover SearchAction do StructuredData | ✅ Feito |
| 4 | Remover meta tags `article:*` do index.html | ✅ Feito |
| 5 | Corrigir URL do Game StructuredData (/jogar → /selecionar-modo-jogo) | ✅ Feito |
| 6 | Mover third-party scripts para `requestIdleCallback` | ✅ Feito |
| 7 | Remover polling de 60s e push notification do ServiceWorker | ✅ Feito |
| 8 | Substituir console.log por logger no gameHistoryService | ✅ Feito |
| 9 | Remover interface local Player do DynamicSEO (usar tipo canônico) | ✅ Feito |
| 10 | Confirmar existência de sitemap.xml e robots.txt | ✅ Já existiam |

| 11 | Unificar JSON-LD em SEOManager único | ✅ Feito |
| 12 | Confirmar sitemap.xml e robots.txt existentes | ✅ Já existiam |
| 13 | Consolidar hooks de analytics (5 → 2) | ✅ Feito |

## Pendentes

### P1 — Engenharia e Performance
- ~~Criar RPC `get_home_stats()` para unificar queries da home~~ ✅ Feito

### P2 — UX e Design
- Unificar GameContainers (3 → 1 com composição)
- Adicionar indicador de progresso claro nos jogos
- Adicionar visual na hero section

### P3 — Dívida Técnica
- Consolidar tipo Player em todos os arquivos restantes
- Substituir console.log por logger nos demais services
- Migrar aggregation de dados admin para server-side (RPC)
- Aumentar cobertura de testes
