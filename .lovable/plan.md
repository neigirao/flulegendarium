
# Plano: Corrigir inicializacao de dificuldade que ignora INITIAL_LEVEL

## Problema

A mudanca anterior alterou `DIFFICULTY_PROGRESSION.INITIAL_LEVEL` para `'medio'`, porem o hook `use-jersey-guess-game.ts` **nao usa essa constante**. Ele hardcoda `DIFFICULTY_LEVELS[0]` em dois lugares:

- **Linha 59** (estado inicial): `useState<DifficultyLevelConfig>(DIFFICULTY_LEVELS[0])` -- sempre `muito_facil`
- **Linha 383** (reset): `setCurrentDifficulty(DIFFICULTY_LEVELS[0])` -- sempre `muito_facil`

Como so existe 1 camisa com `difficulty_level = 'muito_facil'`, o jogo sempre seleciona a mesma camisa (terceira de 2025).

## Solucao

**Arquivo: `src/hooks/use-jersey-guess-game.ts`**

1. Importar `DIFFICULTY_PROGRESSION` e `getDifficultyConfig`
2. Criar constante para o nivel inicial correto usando `getDifficultyConfig(DIFFICULTY_PROGRESSION.INITIAL_LEVEL)`
3. Substituir `DIFFICULTY_LEVELS[0]` nas linhas 59 e 383 pela constante do nivel inicial

### Mudanca no import (linha 8)

De:
```typescript
import { DIFFICULTY_LEVELS, type DifficultyLevelConfig } from "@/config/difficulty-levels";
```
Para:
```typescript
import { DIFFICULTY_LEVELS, DIFFICULTY_PROGRESSION, getDifficultyConfig, type DifficultyLevelConfig } from "@/config/difficulty-levels";
```

### Mudanca na inicializacao (linha 59)

De:
```typescript
const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevelConfig>(DIFFICULTY_LEVELS[0]);
```
Para:
```typescript
const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevelConfig>(
  getDifficultyConfig(DIFFICULTY_PROGRESSION.INITIAL_LEVEL)
);
```

### Mudanca no reset (linha 383)

De:
```typescript
setCurrentDifficulty(DIFFICULTY_LEVELS[0]);
```
Para:
```typescript
setCurrentDifficulty(getDifficultyConfig(DIFFICULTY_PROGRESSION.INITIAL_LEVEL));
```

## Impacto

- O jogo passara a iniciar no nivel `medio` (184 camisas disponiveis) em vez de `muito_facil` (1 camisa)
- O reset tambem usara o nivel correto
- Qualquer mudanca futura em `INITIAL_LEVEL` sera refletida automaticamente
