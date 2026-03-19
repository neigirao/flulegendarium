

# Plano: Corrigir tooltip restante e alinhamentos nos jogos

## Problemas

1. **Tooltip ainda existe**: O arquivo `GameRulesTooltip.tsx` continua no projeto (não é importado, mas pode causar confusão). Mais importante: `DifficultyIndicator.tsx` (usado no modo clássico `GameContainer.tsx`) tem um tooltip que pode quebrar layout.

2. **Anos da camisa desalinhados**: O wrapper em `JerseyGameContainer.tsx` linha 422 usa `space-y-3` sem centralização explícita — precisa `flex flex-col items-center`.

3. **Input do jogador desalinhado**: Já tem `flex flex-col items-center` no `AdaptiveGameContainer` (linha 400), mas o `GameContainer.tsx` clássico (linha 154) envolve o `GuessForm` em `div className="mb-6"` sem centralização.

## Correções

### 1. Deletar `GameRulesTooltip.tsx`
Arquivo órfão — remover completamente.

### 2. Remover tooltip do `DifficultyIndicator.tsx`
Substituir o `TooltipProvider/Tooltip/TooltipTrigger/TooltipContent` por um Badge simples sem tooltip, mantendo a mesma aparência visual.

### 3. Centralizar wrapper dos anos em `JerseyGameContainer.tsx`
Linha 422: mudar `<div className="space-y-3">` para `<div className="flex flex-col items-center space-y-3 w-full">`.

### 4. Centralizar input em `GameContainer.tsx` (modo clássico)
Linha 154: mudar `<div className="mb-6">` para `<div className="mb-6 flex flex-col items-center">`.

## Arquivos

| Ação | Arquivo |
|------|---------|
| Deletar | `src/components/guess-game/GameRulesTooltip.tsx` |
| Editar | `src/components/guess-game/DifficultyIndicator.tsx` |
| Editar | `src/components/jersey-game/JerseyGameContainer.tsx` |
| Editar | `src/components/guess-game/GameContainer.tsx` |

