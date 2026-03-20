

# Itens Pendentes dos Planos Anteriores

## Status Atual

Dos 6 itens recomendados no relatório de auditoria, 4 foram concluídos:

| Item | Status |
|------|--------|
| Reduzir CLS (containIntrinsicSize) | Feito |
| Converter hero PNG para WebP | Feito |
| Ocultar botões de ano no game over | Feito |
| Comportamento do X no GameOverDialog | Feito |
| **Lazy-load framer-motion** | **Pendente** |
| **PWA prompt menos intrusivo** | **Pendente** |

## Itens Pendentes

### 1. PWA prompt — atrasar de 2s para 8s
Atualmente o `PWAInstallPrompt.tsx` exibe após 2 segundos. Isso compete com o CTA principal "Começar a Jogar". Mudar o `setTimeout` de 2000 para 8000ms.

- **Arquivo**: `src/components/pwa/PWAInstallPrompt.tsx` (linha 68)
- **Mudança**: `setTimeout(..., 2000)` → `setTimeout(..., 8000)`

### 2. Lazy-load Sentry
O Sentry (203KB) é importado sincronamente em `main.tsx` antes do render. Pode ser carregado de forma assíncrona após o primeiro render usando `requestIdleCallback` ou `setTimeout`.

- **Arquivo**: `src/main.tsx` — mover `initializeSentry()` para dentro de um `requestIdleCallback` ou `setTimeout(..., 0)` após o `root.render()`

### 3. Lazy-load framer-motion (prioridade baixa)
Framer-motion (82KB) é usado em vários componentes. Lazy-loading completo exigiria refatorar imports em muitos arquivos — impacto alto, benefício moderado. Recomendo não priorizar agora.

## Plano de Implementação

1. Atrasar PWA prompt para 8 segundos — 1 linha
2. Lazy-load Sentry após render — mover `initializeSentry()` para depois do `root.render()` com `requestIdleCallback`

Tempo estimado: ~2 minutos.

