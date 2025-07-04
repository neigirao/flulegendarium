
const CACHE_NAME = 'lendas-do-flu-v3-performance';
const STATIC_CACHE = 'static-v3-performance';
const DYNAMIC_CACHE = 'dynamic-v3-performance';
const IMAGE_CACHE = 'images-v3-performance';

// Recursos críticos para LCP otimizado
const CRITICAL_ASSETS = [
  '/',
  '/src/main.tsx',
  '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png', // Logo Fluminense - LCP crítico
  '/lovable-uploads/1b089617-8fa2-440f-ab41-5192f292f5f3.png', // Banner principal
];

// Recursos de preload para otimização
const PRELOAD_ASSETS = [
  '/lovable-uploads/16398385-eef5-4e38-b90a-39630732acba.png',
  '/lovable-uploads/16f7afff-6bba-4b39-a454-daa6c2373151.png',
  '/manifest.json'
];

// Install - cache recursos críticos primeiro (LCP otimização)
self.addEventListener('install', (event) => {
  console.log('🚀 SW: Installing performance-optimized service worker');
  
  event.waitUntil(
    Promise.all([
      // Cache recursos críticos com prioridade alta
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 SW: Caching critical assets for LCP');
        return cache.addAll(CRITICAL_ASSETS);
      }),
      
      // Cache recursos secundários com baixa prioridade
      caches.open(IMAGE_CACHE).then((cache) => {
        console.log('🖼️ SW: Preloading secondary images');
        return Promise.allSettled(
          PRELOAD_ASSETS.map(url => 
            cache.add(url).catch(e => console.warn('SW: Failed to preload', url))
          )
        );
      }),
      
      caches.open(DYNAMIC_CACHE).then(() => {
        console.log('⚡ SW: Dynamic cache ready');
      })
    ]).then(() => {
      console.log('✅ SW: Performance installation complete');
      self.skipWaiting();
    })
  );
});

// Activate - limpar caches antigos otimizado
self.addEventListener('activate', (event) => {
  console.log('🔄 SW: Activating performance service worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
      
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!validCaches.includes(cacheName)) {
            console.log('🗑️ SW: Deleting old cache for performance:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ SW: Performance activation complete');
      self.clients.claim();
    })
  );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.startsWith('/api/') || url.origin.includes('supabase')) {
    event.respondWith(handleAPIRequest(request));
  } else if (request.destination === 'document') {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// Cache-first otimizado para imagens (performance crítica)
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      // Log apenas para imagens críticas LCP
      if (request.url.includes('0aa3609f-0584-4bf4-8303-e03f50f7e131')) {
        console.log('🎯 SW: LCP critical image from cache');
      }
      return cached;
    }
    
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache inteligente: apenas imagens pequenas/médias para quota
      const contentLength = response.headers.get('content-length');
      const size = contentLength ? parseInt(contentLength) : 0;
      
      if (size < 3 * 1024 * 1024) { // < 3MB
        cache.put(request, response.clone());
        
        if (request.url.includes('0aa3609f-0584-4bf4-8303-e03f50f7e131')) {
          console.log('🎯 SW: LCP critical image cached');
        }
      }
    }
    
    return response;
  } catch (error) {
    console.warn('SW: Image fetch failed:', error);
    // Fallback otimizado para Fluminense
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="#7A0213"/><circle cx="150" cy="150" r="50" fill="#006140"/><text x="150" y="160" text-anchor="middle" fill="white" font-size="16">FLU</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API calls
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'No internet connection' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cache = await caches.open(STATIC_CACHE);
    return await cache.match('/') || new Response('Offline');
  }
}

// Handle static resource requests
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for game scores
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-score') {
    event.waitUntil(syncGameScore());
  }
});

async function syncGameScore() {
  // Implementation for syncing scores when back online
  console.log('Syncing game scores in background');
}
