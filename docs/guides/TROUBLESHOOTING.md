# Guia de Troubleshooting

Soluções para problemas comuns no desenvolvimento e produção.

## Problemas de Build

### Erro: "Module not found"

**Sintoma:**
```
Error: Cannot find module '@/components/SomeComponent'
```

**Causas Comuns:**
- Import path incorreto
- Arquivo movido ou deletado
- Alias não configurado

**Solução:**
1. Verifique se o arquivo existe no caminho
2. Confirme alias `@/` no `tsconfig.json` e `vite.config.ts`
3. Reinicie o dev server

### Erro: "Type 'X' is not assignable to type 'Y'"

**Sintoma:**
```typescript
Type 'string | undefined' is not assignable to type 'string'
```

**Solução:**
```typescript
// ❌ Errado
const value: string = data.value;

// ✅ Correto - Com validação
const value: string = data.value ?? 'default';

// ✅ Correto - Com guard
if (data.value) {
  const value: string = data.value;
}
```

## Problemas de Runtime

### Erro: "Cannot read property of undefined"

**Sintoma:**
```
TypeError: Cannot read property 'name' of undefined
```

**Causas Comuns:**
- Dados não carregados ainda
- API retornou null/undefined
- Estado inicial incorreto

**Solução:**
```typescript
// ❌ Errado
const name = player.name;

// ✅ Correto - Optional chaining
const name = player?.name;

// ✅ Correto - Early return
if (!player) return <Loading />;
const name = player.name;

// ✅ Correto - Default value
const name = player?.name ?? 'Desconhecido';
```

### Erro: "Too many re-renders"

**Sintoma:**
```
Error: Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

**Causas Comuns:**
- setState em render sem condição
- useEffect sem dependencies
- Callback recriado todo render

**Solução:**
```typescript
// ❌ Errado
function Component() {
  const [count, setCount] = useState(0);
  setCount(count + 1); // Causa loop infinito
}

// ✅ Correto - useEffect com dependency
function Component() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(count + 1);
  }, []); // Executa apenas uma vez
}

// ✅ Correto - useCallback
const handleClick = useCallback(() => {
  setCount(c => c + 1);
}, []);
```

## Problemas de Performance

### Sintoma: App lento/travando

**Diagnóstico:**
1. Abra DevTools → Performance
2. Grave interação lenta
3. Identifique gargalos

**Soluções Comuns:**

```typescript
// ❌ Cálculo pesado no render
function Component({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return <div>{total}</div>;
}

// ✅ Memoização
function Component({ items }) {
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.value, 0),
    [items]
  );
  return <div>{total}</div>;
}

// ✅ Virtualização para listas longas
import { useVirtualizer } from '@tanstack/react-virtual';

function LargeList({ items }) {
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  // ... render virtual items
}
```

### Sintoma: Imagens não carregam

**Diagnóstico:**
1. Abra DevTools → Network
2. Verifique status das imagens
3. Confirme CORS/404/500

**Soluções:**

```typescript
// ✅ Sistema de fallback implementado
<UnifiedPlayerImage 
  playerId={player.id}
  playerName={player.name}
  imageUrl={player.image_url}
  className="w-full h-auto"
/>

// ✅ Verificar configuração de fallbacks
// src/utils/player-image/constants.ts
export const playerImagesFallbacks: Record<string, string> = {
  "PlayerName": "/path/to/fallback.png",
};
```

## Problemas de Estado

### Sintoma: Estado não atualiza

**Causas Comuns:**
- Mutação direta do estado
- State batching
- Closure stale

**Solução:**
```typescript
// ❌ Errado - Mutação direta
const handleClick = () => {
  items.push(newItem); // Não funciona
  setItems(items);
};

// ✅ Correto - Novo array
const handleClick = () => {
  setItems([...items, newItem]);
};

// ✅ Correto - Função updater
const handleClick = () => {
  setItems(items => [...items, newItem]);
};
```

### Sintoma: useEffect executando infinitamente

**Causa:** Dependency array incorreta

**Solução:**
```typescript
// ❌ Errado - Objeto/array como dependency
useEffect(() => {
  fetchData(filters);
}, [filters]); // filters é um objeto novo todo render

// ✅ Correto - Valores primitivos
useEffect(() => {
  fetchData(filters);
}, [filters.difficulty, filters.decade]);

// ✅ Correto - useMemo
const memoizedFilters = useMemo(
  () => ({ difficulty, decade }),
  [difficulty, decade]
);
useEffect(() => {
  fetchData(memoizedFilters);
}, [memoizedFilters]);
```

## Problemas de API/Database

### Erro: "Failed to fetch"

**Sintoma:**
```
Error: Failed to fetch
```

**Causas Comuns:**
- Supabase offline
- URL incorreta
- CORS issues
- Rate limiting

**Solução:**
1. Verifique Supabase status
2. Confirme URL e keys em `.env`
3. Verifique CORS no Supabase Dashboard
4. Implemente retry logic:

```typescript
const { data, error } = await supabase
  .from('players')
  .select('*')
  .retry(3); // Tenta 3 vezes

if (error) {
  logger.error('Erro ao buscar players', error);
  toast.error('Erro ao carregar dados. Tente novamente.');
}
```

### Erro: RLS Policy

**Sintoma:**
```
new row violates row-level security policy
```

**Solução:**
1. Verifique políticas RLS no Supabase
2. Confirme autenticação do usuário
3. Ajuste policy se necessário:

```sql
-- Exemplo de policy permissiva
CREATE POLICY "Enable read for all users"
ON public.players
FOR SELECT
USING (true);

-- Policy com autenticação
CREATE POLICY "Enable insert for authenticated users"
ON public.rankings
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## Problemas de Autenticação

### Sintoma: Login não persiste

**Causa:** Storage bloqueado ou limpo

**Solução:**
```typescript
// Verificar se auth persiste
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  logger.warn('Sessão perdida');
}

// Configurar persistence (já configurado no projeto)
const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    storageKey: 'flu-legends-auth',
    storage: window.localStorage,
  }
});
```

### Sintoma: "Invalid JWT"

**Causa:** Token expirado

**Solução:**
```typescript
// Refresh automático (já implementado)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    logger.info('Token renovado');
  }
  if (event === 'SIGNED_OUT') {
    // Redirecionar para login
  }
});
```

## Debugging Tools

### Console Logs Estruturados

```typescript
import { logger } from '@/utils/logger';

// Ativar modo debug
localStorage.setItem('debug', 'true');
// ou
?debug=true na URL

// Usar logger
logger.debug('Estado atual', { state });
logger.info('Operação concluída');
logger.warn('Aviso importante');
logger.error('Erro crítico', error);
```

### React Query Devtools

```typescript
// Já incluído no projeto
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Ver no browser
// Botão flutante no canto da tela em dev mode
```

### Redux Devtools (Zustand)

```typescript
// Usar para debug do gameStore e uiStore
// Extension: Redux DevTools
// Já configurado automaticamente
```

## Checklist de Debug

Quando algo não funciona:

- [ ] Verificar console por erros
- [ ] Verificar Network tab por requests falhados
- [ ] Verificar React DevTools por re-renders
- [ ] Verificar Application tab por storage
- [ ] Verificar Sources tab por breakpoints
- [ ] Verificar lighthouse por performance
- [ ] Verificar logs do Supabase
- [ ] Verificar Sentry por erros em produção

## Recursos Úteis

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Supabase Logs](https://supabase.com/dashboard)
- [Sentry Dashboard](https://sentry.io)
- [Web Vitals](https://web.dev/vitals/)

## Suporte

Se o problema persistir:

1. Verifique [documentação do projeto](../AI_GUIDE.md)
2. Consulte [arquitetura](../ARCHITECTURE.md)
3. Revise [changelog](../CHANGELOG.md) para mudanças recentes
4. Abra issue no repositório com:
   - Descrição do problema
   - Passos para reproduzir
   - Screenshots/logs relevantes
   - Ambiente (browser, OS, etc.)
