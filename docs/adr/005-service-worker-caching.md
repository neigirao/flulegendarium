# ADR 005: Estratégia de Cache do Service Worker

## Status
Aceito - 2025-01-16

## Contexto
Como Progressive Web App (PWA), o aplicativo necessita funcionar offline e ter carregamento rápido. Um Service Worker bem configurado é essencial para isso, mas precisa balancear cache com atualização de conteúdo.

## Decisão
Implementamos uma estratégia de cache em múltiplas camadas baseada na natureza dos recursos:

### Estratégias de Cache

#### 1. Cache-First (Arquivos Estáticos)
Usado para recursos que raramente mudam:
- Assets do build (JS, CSS compilados)
- Fontes
- Ícones da aplicação

```javascript
// Pseudo-código
if (cache.has(request)) {
  return cache.get(request);
} else {
  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}
```

#### 2. Network-First (Dados Dinâmicos)
Usado para conteúdo que muda frequentemente:
- Dados de jogadores
- Rankings
- Estatísticas do usuário

```javascript
// Pseudo-código
try {
  const response = await fetch(request, { timeout: 3000 });
  cache.put(request, response.clone());
  return response;
} catch {
  return cache.get(request) || fallbackResponse;
}
```

#### 3. Stale-While-Revalidate (Imagens)
Usado para recursos grandes mas importantes:
- Imagens dos jogadores
- Imagens de fundo

```javascript
// Pseudo-código
const cachedResponse = cache.get(request);
const networkPromise = fetch(request).then(response => {
  cache.put(request, response.clone());
  return response;
});

return cachedResponse || networkPromise;
```

### Configuração de Cache

#### Nomes de Cache
```javascript
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
```

#### Recursos Pré-Cacheados
```javascript
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  // Assets críticos identificados pelo Vite
];
```

#### Limites de Cache
- **Static Cache**: Sem limite (controlado por versão)
- **Dynamic Cache**: 50 entradas (LRU)
- **Image Cache**: 100 imagens (LRU)

### Limpeza de Cache

#### No Install
```javascript
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
  );
});
```

#### No Activate
```javascript
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== STATIC_CACHE && 
                          key !== DYNAMIC_CACHE && 
                          key !== IMAGE_CACHE)
            .map(key => caches.delete(key))
      );
    })
  );
});
```

### Offline Experience

#### Página Offline
Servida quando não há rede E não há cache:
```html
<!-- public/offline.html -->
<div class="offline-message">
  <h1>Você está offline</h1>
  <p>Conecte-se à internet para continuar jogando</p>
</div>
```

#### Fallback de Imagens
Imagem genérica para jogadores sem cache:
```javascript
if (request.destination === 'image') {
  return cache.match('/default-player.png');
}
```

## Consequências

### Positivas
- ✅ Funciona offline após primeira visita
- ✅ Carregamento instantâneo de recursos cacheados
- ✅ Sempre tenta buscar conteúdo fresco
- ✅ Fallbacks graceful para offline
- ✅ Gerenciamento automático de espaço
- ✅ Suporte a atualizações do app

### Negativas
- ⚠️ Complexidade adicional no debugging
- ⚠️ Cache pode ficar stale se SW não atualizar
- ⚠️ Usa espaço em disco do usuário
- ⚠️ Requer estratégia de versionamento cuidadosa

## Casos Especiais

### Bypass de Cache (Admin)
Área admin sempre busca conteúdo fresco:
```javascript
if (url.pathname.startsWith('/admin')) {
  return fetch(request); // Sem cache
}
```

### Invalidação Manual
Exposto via `PWAProvider` para forçar atualização:
```typescript
const reloadApp = () => {
  caches.keys().then(keys => {
    keys.forEach(key => caches.delete(key));
  });
  window.location.reload();
};
```

## Monitoramento

### Métricas Importantes
- Taxa de hit de cache
- Tamanho total do cache
- Frequência de atualizações do SW
- Erros de cache

### Logs
Integrado com logger centralizado:
```typescript
logger.info('Service Worker: Cache hit', 'SW', { url });
logger.warn('Service Worker: Fallback to cache', 'SW', { url });
```

## Alternativas Consideradas

1. **Network-Only** - Rejeitado: Não funciona offline
2. **Cache-Only** - Rejeitado: Conteúdo fica stale
3. **Workbox** - Considerado para futuro: Mais features mas mais complexo
4. **IndexedDB para Dados** - Futuro: Melhor para dados estruturados grandes

## Troubleshooting

### Cache Não Atualiza
1. Verificar versão do CACHE_VERSION
2. Forçar reload com Ctrl+Shift+R
3. Limpar cache manualmente via DevTools

### Consumo Excessivo de Disco
1. Reduzir limites de IMAGE_CACHE e DYNAMIC_CACHE
2. Implementar limpeza mais agressiva
3. Revisar quais recursos estão sendo cacheados

## Referências
- `public/sw.js` - Implementação do Service Worker
- `src/components/pwa/PWAProvider.tsx` - Integração React
- `src/components/pwa/PWAInstallPrompt.tsx` - UI de instalação
- [Service Worker Cookbook](https://serviceworke.rs/)
- [Workbox (para referência futura)](https://developers.google.com/web/tools/workbox)
