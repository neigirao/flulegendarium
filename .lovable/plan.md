

## Diagnóstico: Jogo não exibe imagens dos jogadores + Erros de build

### Problema Principal
A imagem do jogador não aparece no quiz adaptativo. A análise revela duas causas raiz:

1. **~70% das imagens são URLs externas não confiáveis** (gstatic, glbimg, netflu, etc.) que falham por CORS, hotlink protection ou expiração. A validação em `isValidImageUrl` bloqueia domínios do grupo Globo (`glbimg.com`) e o mecanismo de retry tenta URLs no Supabase Storage que não existem (baseadas no nome do jogador normalizado).

2. **Build quebrado** por erros de TypeScript em 3 Edge Functions (`collect-players-data`, `process-player-name`, `upload-player`) — `error` tipado como `unknown` e parâmetros sem tipo.

3. **Google One Tap inicializando múltiplas vezes** — o cleanup do useEffect reseta `initializedRef.current = false`, causando re-inicialização a cada re-render do componente.

### Distribuição de URLs no banco
- Supabase Storage: 58 jogadores (confiável)
- Google Thumbnails (gstatic): 41 jogadores (efêmero, pode expirar)
- Globo (glbimg): 30 jogadores (bloqueado pela validação)
- Outros externos: 66 jogadores (CORS/hotlink imprevisível)
- Fluzao.xyz: 1 jogador

### Plano de Correção

**Passo 1: Corrigir erros de build nas Edge Functions**
- `collect-players-data/index.ts`: Tipar `error` como `unknown` nos catch blocks usando `(error instanceof Error ? error.message : 'Unknown error')`. Adicionar tipo `Record<string, unknown>` ao `playerImagesMap` e tipos aos parâmetros de `savePlayersToDatabase`.
- `process-player-name/index.ts` (linha 225): Mesma correção de `error.message`.
- `upload-player/index.ts` (linha 73): Mesma correção de `error.message`.

**Passo 2: Permitir URLs externas no carregamento de imagens**
- Em `src/utils/player-image/problematicUrls.ts`: Remover `glbimg.com` do bloqueio (muitas imagens válidas vêm deste CDN).
- Em `src/utils/player-image/imageUtils.ts`: Relaxar a validação para aceitar qualquer URL http/https que não seja suspeitamente malformada. O mecanismo de retry + fallback para imagem padrão já cobre falhas reais.

**Passo 3: Garantir que a imagem padrão apareça visualmente quando o carregamento falha**
- Em `UnifiedPlayerImage.tsx`: Quando `imageStatus === 'error'`, chamar `onImageLoaded?.()` para que o timer inicie mesmo sem imagem do jogador. Atualmente, se a imagem falha E o `onImageLoaded` nunca é chamado, o jogo pode travar sem timer (embora no screenshot o timer está rodando, indicando que em alguns cenários o timer inicia por outra via).

**Passo 4: Corrigir Google One Tap sendo inicializado múltiplas vezes**
- Em `useGoogleOneTap.ts`: Não resetar `initializedRef.current = false` no cleanup. O Google SDK já está carregado na página; resetar o ref causa re-inicialização desnecessária.

### Detalhes Técnicos

```text
Fluxo de carregamento de imagem:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ getReliable  │───►│ isValidImage │───►│ Imagem no   │
│ ImageUrl()   │    │ Url() check  │    │ componente  │
└─────────────┘    └──────┬───────┘    └──────┬──────┘
                          │ BLOQUEIA           │ FALHA
                          │ glbimg.com         │ timeout/CORS
                          ▼                    ▼
                   ┌──────────────┐    ┌─────────────┐
                   │ defaultImage │    │ retry com   │
                   │ (escudo)     │    │ URL supabase│
                   └──────────────┘    │ (não existe)│
                                       └──────┬──────┘
                                              ▼
                                       ┌─────────────┐
                                       │ defaultImage │
                                       └─────────────┘

Correção: permitir URLs externas → elas carregam 
diretamente ou falham e usam fallback normalmente.
```

**Arquivos a modificar:**
1. `supabase/functions/collect-players-data/index.ts` — fix TypeScript errors
2. `supabase/functions/process-player-name/index.ts` — fix TypeScript errors
3. `supabase/functions/upload-player/index.ts` — fix TypeScript errors
4. `src/utils/player-image/problematicUrls.ts` — remover bloqueio de glbimg
5. `src/utils/player-image/imageUtils.ts` — relaxar validação
6. `src/components/player-image/UnifiedPlayerImage.tsx` — chamar onImageLoaded no error state
7. `src/hooks/useGoogleOneTap.ts` — corrigir re-inicialização múltipla

