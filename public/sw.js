
const CACHE_NAME = 'lendas-do-flu-v3';
const STATIC_CACHE = 'static-v3';
const DYNAMIC_CACHE = 'dynamic-v3';
const IMAGE_CACHE = 'images-v3';
const FONT_CACHE = 'fonts-v3';

// Static resources to cache immediately - optimized list
const staticResources = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/og-image.png',
  '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png'
];

// Critical fonts to cache
const criticalFonts = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
];

// Install service worker with better caching strategy
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('🚀 Caching static resources');
        return cache.addAll(staticResources.filter(url => url !== undefined));
      }),
      
      // Cache critical fonts
      caches.open(FONT_CACHE).then((cache) => {
        console.log('🔤 Caching critical fonts');
        return cache.addAll(criticalFonts);
      }),
      
      // Initialize other caches
      caches.open(IMAGE_CACHE).then(() => {
        console.log('🖼️ Image cache ready');
      }),
      caches.open(DYNAMIC_CACHE).then(() => {
        console.log('⚡ Dynamic cache ready');
      })
    ])
  );
  self.skipWaiting();
});

// Activate service worker with better cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cach‌Nome) => {
          if (!cacheName.includes('v3')) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Enhanced fetch strategy with better performance
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests with optimized strategies
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (request.destination === 'font' || url.href.includes('fonts.g')) {
    event.respondWith(handleFontRequest(request));
  } else if (url.pathname.startsWith('/api/') || url.origin.includes('supabase')) {
    event.respondWith(handleAPIRequest(request));
  } else if (request.destination === 'document') {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// Optimized image handling with WebP support
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Clone and cache the response
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('📷 Image offline, returning placeholder');
    // Return optimized SVG placeholder
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="#f8fafc"/>
        <circle cx="200" cy="180" r="40" fill="#e2e8f0"/>
        <rect x="160" y="240" width="80" height="8" rx="4" fill="#e2e8f0"/>
        <rect x="140" y="260" width="120" height="6" rx="3" fill="#f1f5f9"/>
        <text x="200" y="320" text-anchor="middle" fill="#64748b" font-family="Inter,sans-serif" font-size="14">Imagem não disponível</text>
      </svg>`,
      { 
        headers: { 
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600'
        } 
      }
    );
  }
}

// Font caching with cache-first strategy
async function handleFontRequest(request) {
  const cache = await caches.open(FONT_CACHE);
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
    console.log('🔤 Font loading failed, falling back to system fonts');
    return new Response('', { status: 404 });
  }
}

// Enhanced API handling with better error responses
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      // Only cache successful GET requests
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 API offline, checking cache');
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return structured offline response
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'Sem conexão com a internet. Algumas funcionalidades podem estar limitadas.',
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}

// Navigation with stale-while-revalidate
async function handleNavigationRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('🧭 Navigation offline, serving cached version');
    const cachedResponse = await cache.match(request);
    return cachedResponse || await cache.match('/');
  }
}

// Static resources with cache-first
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Serve from cache and update in background
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response);
      }
    }).catch(() => {});
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Recurso não disponível offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Background sync for scores with retry logic
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-score') {
    event.waitUntil(syncGameScore());
  }
});

async function syncGameScore() {
  console.log('🔄 Sincronizando pontuações em background');
  
  try {
    // Get pending scores from IndexedDB
    const scores = await getPendingScores();
    
    for (const score of scores) {
      try {
        await submitScore(score);
        await removePendingScore(score.id);
      } catch (error) {
        console.log('❌ Falha ao sincronizar pontuação:', error);
      }
    }
  } catch (error) {
    console.log('🔄 Erro na sincronização geral:', error);
  }
}

// Placeholder functions for score sync (to be implemented)
async function getPendingScores() {
  return [];
}

async function submitScore(score) {
  // Implementation would go here
}

async function removePendingScore(id) {
  // Implementation would go here
}

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_MEASURE') {
    console.log('📊 Performance measure:', event.data.measure);
  }
});
