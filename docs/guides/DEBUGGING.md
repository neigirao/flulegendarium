# 🐛 Guia de Debugging - Lendas do Flu

Este guia ajuda a diagnosticar e resolver problemas comuns no projeto.

---

## 📋 Índice

1. [Sistema de Logging](#sistema-de-logging)
2. [Problemas com Imagens](#problemas-com-imagens)
3. [Seleção de Jogadores](#seleção-de-jogadores)
4. [Service Worker e Cache](#service-worker-e-cache)
5. [Performance Issues](#performance-issues)
6. [Autenticação](#autenticação)
7. [Rankings e Pontuação](#rankings-e-pontuação)

---

## 🔍 Sistema de Logging

### **Logger Centralizado**

O projeto usa um logger centralizado que **automaticamente desabilita logs de debug em produção**.

```typescript
import { logger } from '@/utils/logger';

// Debug (apenas em desenvolvimento)
logger.debug('Mensagem de debug', 'CONTEXTO', { data });

// Info (visível em produção)
logger.info('Informação importante', 'CONTEXTO');

// Warning (visível em produção)
logger.warn('Aviso', 'CONTEXTO', { details });

// Error (visível em produção)
logger.error('Erro crítico', 'CONTEXTO', { error });
```

### **Métodos Específicos do Jogo**

```typescript
// Log de ação do jogo
logger.gameAction('player_selected', playerName, { difficulty: 'medio' });

// Log de carregamento de imagem
logger.imageLoad(playerName, true, imageUrl); // sucesso
logger.imageLoad(playerName, false, imageUrl); // falha

// Log de timer
logger.timer('started', 60);
logger.timer('paused', 45);
```

### **Contextos Comuns**

| Contexto | Uso |
|----------|-----|
| `GAME` | Ações do jogo (acertos, erros, mudanças de estado) |
| `IMAGE` | Carregamento e cache de imagens |
| `TIMER` | Timer do jogo |
| `PLAYER_SELECTION` | Seleção e filtragem de jogadores |
| `AUTH` | Autenticação e autorização |
| `RANKING` | Sistema de ranking e pontuação |
| `CACHE` | Cache e Service Worker |
| `PERFORMANCE` | Métricas de performance |

### **Ativar Logs Detalhados**

Para debug intensivo, abra o Console do navegador e execute:

```javascript
// Ver todos os logs (incluindo debug)
localStorage.setItem('DEBUG', 'true');

// Ver logs de um contexto específico
localStorage.setItem('DEBUG_CONTEXT', 'IMAGE');

// Desativar
localStorage.removeItem('DEBUG');
```

---

## 🖼️ Problemas com Imagens

### **Imagem Não Carrega (404)**

**Sintomas**: Imagem aparece quebrada ou não carrega

**Diagnóstico**:

```typescript
// 1. Verificar URL no banco de dados
logger.debug('Checking player image', 'IMAGE', {
  player: player.name,
  url: player.image_url,
  isValid: isValidImageUrl(player.image_url)
});

// 2. Verificar fallback
logger.debug('Fallback check', 'IMAGE', {
  player: player.name,
  hasFallback: !!playerImagesFallbacks[player.name]
});
```

**Soluções**:

1. **Verificar URL no Banco**:
   ```sql
   SELECT name, image_url FROM players WHERE name = 'Nome do Jogador';
   ```

2. **Adicionar Fallback**:
   ```typescript
   // src/utils/player-image/imageUtils.ts
   export const playerImagesFallbacks: Record<string, string> = {
     'Nome do Jogador': 'https://url-valida.com/imagem.jpg'
   };
   ```

3. **Limpar Cache do Service Worker**:
   - Abrir DevTools → Application → Storage → Clear site data
   - Ou: DevTools → Application → Service Workers → Unregister

### **Imagem Incorreta**

**Sintomas**: Jogador aparece com imagem de outro jogador

**Diagnóstico**:

```typescript
logger.debug('Image priority', 'IMAGE', {
  player: player.name,
  databaseUrl: player.image_url,
  fallbackUrl: playerImagesFallbacks[player.name],
  finalUrl: getPlayerImageUrl(player)
});
```

**Solução**:

A ordem de prioridade é:
1. URL do banco (se válida)
2. Fallback configurado
3. Match parcial
4. Imagem padrão

Verificar se a URL do banco está correta.

### **Imagem Demora para Carregar**

**Diagnóstico**:

```typescript
// Verificar se está usando cache
// DevTools → Network → Filtrar por imagem
// Status deve ser: (from ServiceWorker)
```

**Soluções**:

1. **Verificar Service Worker**:
   ```javascript
   // Console
   navigator.serviceWorker.getRegistrations().then(regs => {
     console.log('SW registrations:', regs.length);
   });
   ```

2. **Preload de Imagens**:
   ```typescript
   // O sistema já faz preload automático
   // Verificar em utils/player-image/preloadUtils.ts
   ```

3. **Otimizar Tamanho**:
   - Imagens devem ser < 200KB
   - Formato WebP preferencial
   - Dimensões adequadas (400-600px)

---

## 🎮 Seleção de Jogadores

### **Jogador com Dificuldade Errada**

**Sintomas**: Jogador aparece em dificuldade diferente da configurada no banco

**Diagnóstico**:

```typescript
logger.debug('Player selection', 'PLAYER_SELECTION', {
  requestedDifficulty: 'medio',
  selectedPlayer: player.name,
  playerDifficulty: player.difficulty_level,
  playerId: player.id
});
```

**Solução**:

O sistema foi configurado para **SEMPRE respeitar** a dificuldade do banco. Se isso ocorrer:

1. **Verificar no Banco**:
   ```sql
   SELECT name, difficulty_level FROM players 
   WHERE id = 'player-id';
   ```

2. **Verificar Código**:
   - `src/services/playerSelectionService.ts` NÃO deve ter fallbacks
   - `src/hooks/use-adaptive-player-selection.ts` NÃO deve ter fallbacks

3. **Verificar Console**:
   ```
   ❌ Nenhum jogador disponível na dificuldade [nivel]
   ```

### **Não Há Jogadores Disponíveis**

**Sintomas**: Erro ou tela em branco, mensagem "Nenhum jogador disponível"

**Diagnóstico**:

```typescript
logger.error('No players available', 'PLAYER_SELECTION', {
  difficulty: difficultyLevel,
  totalPlayers: players.length,
  usedPlayers: usedPlayerIds.size
});
```

**Soluções**:

1. **Pool Esgotado**: Todos jogadores foram usados
   ```typescript
   // O sistema reseta automaticamente quando pool esgota
   // Verificar em PlayerSelectionService.selectRandomPlayer()
   ```

2. **Dificuldade Sem Jogadores**:
   ```sql
   -- Verificar quantos jogadores por dificuldade
   SELECT difficulty_level, COUNT(*) 
   FROM players 
   GROUP BY difficulty_level;
   ```

3. **Adicionar Mais Jogadores**:
   - Via Admin Dashboard
   - Ou diretamente no banco

### **Jogadores Se Repetem**

**Sintomas**: Mesmo jogador aparece várias vezes seguidas

**Diagnóstico**:

```typescript
logger.debug('Used players', 'PLAYER_SELECTION', {
  usedCount: usedPlayerIds.size,
  currentPlayer: player.name,
  wasUsed: usedPlayerIds.has(player.id)
});
```

**Solução**:

Verificar se `usedPlayerIds` está sendo mantido entre rodadas:

```typescript
// hooks/use-adaptive-guess-game.ts
const usedPlayerIds = useRef<Set<string>>(new Set());

// Ao selecionar jogador
usedPlayerIds.current.add(selectedPlayer.id);
```

---

## 💾 Service Worker e Cache

### **Verificar Status do Service Worker**

```javascript
// Console do navegador
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => {
    console.log('SW:', reg.active?.state);
  });
});
```

**Estados Possíveis**:
- `activated`: Funcionando ✅
- `installing`: Instalando ⏳
- `null/undefined`: Não registrado ❌

### **Limpar Cache**

```javascript
// Console do navegador
caches.keys().then(keys => {
  keys.forEach(key => {
    console.log('Cache:', key);
    caches.delete(key);
  });
  console.log('✅ Cache limpo!');
});

// Ou via DevTools:
// Application → Cache Storage → Delete
```

### **Ver Logs do Service Worker**

```javascript
// Console
console.log('[SW Logs]');
// Logs do SW aparecem com prefixo 🎯 SW:
```

**Logs Comuns**:
- `🎯 SW: LCP critical image from cache` - Imagem LCP servida do cache ✅
- `🎯 SW: Installing...` - Service Worker instalando ⏳
- `🎯 SW: Activated` - Service Worker ativado ✅

### **Forçar Atualização do Service Worker**

```javascript
// Console
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.update());
  console.log('✅ SW atualizado!');
});

// Ou via DevTools:
// Application → Service Workers → Update
```

---

## ⚡ Performance Issues

### **Página Lenta para Carregar**

**Diagnóstico**:

```typescript
// Verificar Core Web Vitals
import { useCoreWebVitals } from '@/hooks/performance';

function DebugPerformance() {
  const { lcp, fid, cls } = useCoreWebVitals();
  
  console.log('Core Web Vitals:', {
    LCP: lcp, // < 2.5s ✅
    FID: fid, // < 100ms ✅
    CLS: cls  // < 0.1 ✅
  });
}
```

**Soluções**:

1. **LCP Alto (> 2.5s)**:
   - Verificar imagens: devem usar lazy loading
   - Verificar Service Worker: deve cachear recursos críticos
   - Verificar fonts: devem usar `font-display: swap`

2. **FID Alto (> 100ms)**:
   - Verificar JavaScript: remover código bloqueante
   - Usar `requestIdleCallback` para tarefas não críticas

3. **CLS Alto (> 0.1)**:
   - Adicionar dimensões em imagens: `width` e `height`
   - Reservar espaço para conteúdo dinâmico

### **DevTools Performance**

```
Chrome DevTools → Performance:
1. Clicar em Record
2. Interagir com a página
3. Parar gravação
4. Analisar:
   - Scripting (amarelo): < 50%
   - Rendering (roxo): < 30%
   - Painting (verde): < 20%
```

### **Bundle Size**

```bash
# Analisar tamanho do bundle
npm run build
npm run preview

# Verificar chunks grandes
ls -lh dist/assets/*.js
```

---

## 🔐 Autenticação

### **Usuário Não Consegue Fazer Login**

**Diagnóstico**:

```typescript
logger.debug('Auth attempt', 'AUTH', {
  email: email,
  hasSession: !!session,
  error: error?.message
});
```

**Soluções**:

1. **Verificar Supabase**:
   - Abrir Supabase Dashboard
   - Verificar Authentication → Users
   - Verificar se email está confirmado

2. **Verificar Ambiente**:
   ```typescript
   // Verificar variáveis de ambiente
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
   // NÃO logar VITE_SUPABASE_ANON_KEY por segurança
   ```

3. **Limpar Sessão**:
   ```javascript
   // Console
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

### **Sessão Expira Rapidamente**

**Verificar Configuração**:

```typescript
// src/integrations/supabase/client.ts
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Deve ser true
    autoRefreshToken: true // Deve ser true
  }
});
```

---

## 🏆 Rankings e Pontuação

### **Pontuação Não Salva**

**Diagnóstico**:

```typescript
logger.debug('Saving ranking', 'RANKING', {
  playerName: playerName,
  score: score,
  userId: userId,
  authenticated: !!userId
});
```

**Soluções**:

1. **Verificar Autenticação**:
   - Usuário deve estar logado para salvar
   - Verificar `session` no Supabase

2. **Verificar RLS Policies**:
   ```sql
   -- Supabase Dashboard → Database → Policies
   -- Verificar se há policy de INSERT na tabela rankings
   ```

3. **Verificar Rede**:
   - DevTools → Network
   - Procurar requisição POST para `/rest/v1/rankings`
   - Status deve ser 201 Created

### **Ranking Não Atualiza**

**Verificar Cache**:

```typescript
// React Query está cacheando
// Forçar revalidação:
queryClient.invalidateQueries({ queryKey: ['rankings'] });
```

---

## 🛠️ Ferramentas Úteis

### **React DevTools**

```
Componentes → Profiler:
- Identificar re-renders desnecessários
- Analisar performance de componentes
```

### **Redux DevTools / Zustand DevTools**

```javascript
// Ver estado do Zustand
import { useGameStore } from '@/stores/gameStore';

// Console
const state = useGameStore.getState();
console.log('Game state:', state);
```

### **Network Throttling**

```
DevTools → Network:
- Fast 3G: Simular conexão lenta
- Offline: Testar PWA
```

### **Lighthouse**

```
DevTools → Lighthouse:
- Performance
- Accessibility
- Best Practices
- SEO
- PWA
```

---

## 📞 Ajuda Adicional

Se o problema persistir:

1. **Verificar Issues no GitHub** (se aplicável)
2. **Verificar Logs do Supabase**: Dashboard → Logs
3. **Verificar Sentry** (se configurado): Erros em produção
4. **Contatar Equipe de Desenvolvimento**

---

**Última atualização**: 2025-01-16
