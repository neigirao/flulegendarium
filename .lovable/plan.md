

# Plano: Corrigir 403 nas imagens de camisas e jogo sempre iniciar com a mesma camisa

## Problemas Identificados

### 1. Erro 403 nas imagens de camisas (render/image)

O `supabaseTransforms.ts` converte URLs de `/storage/v1/object/public/` para `/storage/v1/render/image/public/` para aplicar transformacoes (resize, webp, quality). Porem, o endpoint `/render/image/` requer o plano Pro do Supabase. No plano Free, retorna **403 Forbidden** para TODAS as imagens de camisas, nao apenas a de 2025.

Isso afeta: `JerseyImage.tsx`, `UnifiedPlayerImage.tsx`, `LCPOptimizedImage.tsx`, `use-critical-image-preload.ts`.

### 2. Jogo sempre comeca com a mesma camisa (terceira de 2025)

A configuracao `DIFFICULTY_PROGRESSION.INITIAL_LEVEL` define o nivel inicial como `'muito_facil'`. A distribuicao no banco e:

- `muito_facil`: **1 camisa** (terceira 2025 - be1b6d54)
- `facil`: 3 camisas
- `medio`: 184 camisas
- `dificil`: 1 camisa
- `muito_dificil`: 0 camisas

Como so existe 1 camisa `muito_facil`, o jogo sempre seleciona ela primeiro.

### 3. Verificacao de outros casos

Todas as 189 camisas com URLs do Supabase Storage sofrem o mesmo 403 ao usar o endpoint de transforms. O problema e sistematico, nao isolado.

---

## Solucao

### Mudanca 1: Desabilitar Image Transforms (retornar URL original)

**Arquivo: `src/utils/image/supabaseTransforms.ts`**

Alterar `getTransformedImageUrl` para retornar a URL original sem modificacao. O endpoint `/render/image/` nao esta disponivel no plano atual. Isso remove o 403 de todas as imagens.

```typescript
export function getTransformedImageUrl(
  url: string,
  options: TransformOptions = {}
): string {
  // Image transforms require Supabase Pro plan
  // Return original URL to avoid 403 errors
  return url;
}
```

Igualmente, `getResponsiveSrcSet` deve retornar `undefined` (sem srcset) ja que nao ha transforms:

```typescript
export function getResponsiveSrcSet(
  url: string,
  sizes: number[] = [320, 640, 960, 1280]
): string | undefined {
  // Transforms not available - no srcset
  return undefined;
}
```

### Mudanca 2: Iniciar jogo no nivel 'medio'

**Arquivo: `src/config/difficulty-levels.ts`**

Alterar `DIFFICULTY_PROGRESSION.INITIAL_LEVEL` de `'muito_facil'` para `'medio'`, onde existem 184 camisas disponiveis, garantindo variedade a cada partida.

```typescript
export const DIFFICULTY_PROGRESSION = {
  CORRECT_THRESHOLD: 3,
  INCORRECT_THRESHOLD: 2,
  INITIAL_LEVEL: 'medio' as DifficultyLevel
} as const;
```

### Mudanca 3: Fallback no hook de selecao para evitar repeticao

**Arquivo: `src/hooks/use-jersey-guess-game.ts`** (linhas ~188-197)

Quando `selectJerseyByDifficulty` retorna null (sem camisas na dificuldade), o fallback `selectRandomJersey` ja existe. Nenhuma mudanca necessaria aqui apos corrigir o nivel inicial.

---

## Impacto

- **403 eliminado**: Todas as imagens de camisas (189) carregarao diretamente do Storage sem passar pelo endpoint de transforms
- **Variedade garantida**: Com 184 camisas no nivel medio, a probabilidade de repetir a mesma camisa inicial cai de 100% para ~0.5%
- **Trade-off**: Imagens nao serao otimizadas (sem resize/webp server-side), mas carregarao corretamente. Quando/se o plano for atualizado para Pro, basta reverter a mudanca 1

