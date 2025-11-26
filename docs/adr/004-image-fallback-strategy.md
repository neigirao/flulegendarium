# ADR 004: Estratégia de Fallback de Imagens

## Status
Aceito - 2025-01-16

## Contexto
O jogo depende fortemente de imagens dos jogadores, mas URLs podem se tornar inválidas, jogadores podem não ter imagens cadastradas, ou erros de carregamento podem ocorrer. Era necessário um sistema robusto de fallback.

## Decisão
Implementamos uma hierarquia de fallback com 4 níveis de prioridade:

### Hierarquia de Fallback
1. **Nível 1 - URL do Banco de Dados** (Prioridade Máxima)
   - Usa `player.image_url` se válida
   - Validação: protocolo, domínio, extensão
   - Rejeita URLs suspeitas ou malformadas

2. **Nível 2 - Fallback Configurado**
   - Mapeamento estático em `IMAGE_FALLBACKS` para jogadores conhecidos
   - Permite sobrescrever URLs inválidas do banco

3. **Nível 3 - Busca por Nome Parcial**
   - Tenta encontrar fallback usando partes do nome do jogador
   - Útil para apelidos e variações de nome

4. **Nível 4 - Imagem Padrão**
   - `/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png`
   - Usado quando todas as outras opções falham

### Validação de URLs
Implementada em `src/utils/player-image/imageUtils.ts`:

```typescript
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    
    // Rejeitar protocolos inválidos
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Rejeitar URLs suspeitas
    if (isSuspiciousUrl(url)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};
```

### Configuração de Fallbacks
Arquivo: `src/utils/player-image/imageUtils.ts`

```typescript
export const IMAGE_FALLBACKS: Record<string, string> = {
  'Marcelo Oliveira': '/lovable-uploads/marcelo.png',
  'Fred': '/lovable-uploads/fred.png',
  // ... outros jogadores
};
```

### Componente Unificado
`UnifiedPlayerImage` (`src/components/player-image/UnifiedPlayerImage.tsx`):
- Implementa toda a lógica de fallback
- Gerencia estados de loading e erro
- Integrado com logger centralizado
- Otimizado para performance

## Consequências

### Positivas
- ✅ Zero imagens quebradas no jogo
- ✅ Experiência consistente para o usuário
- ✅ Fácil manutenção via configuração
- ✅ Logs detalhados para debugging
- ✅ Performance otimizada com lazy loading
- ✅ Fallbacks testáveis e documentados

### Negativas
- ⚠️ Requer manutenção do mapeamento de fallbacks
- ⚠️ Arquivo de configuração pode crescer muito
- ⚠️ Dependência de imagens estáticas no repo

## Alternativas Consideradas

1. **URLs do Banco Sempre Prioritárias** - Rejeitado: URLs inválidas quebram o jogo
2. **Gerar Imagens Placeholder Dinâmicas** - Rejeitado: Inconsistente visualmente
3. **Buscar Imagens de APIs Externas** - Rejeitado: Latência e dependência externa
4. **Permitir URLs Inválidas com Try/Catch** - Rejeitado: Má experiência de usuário

## Manutenção

### Adicionar Novo Fallback
```typescript
// Em src/utils/player-image/imageUtils.ts
export const IMAGE_FALLBACKS: Record<string, string> = {
  // ... fallbacks existentes
  'Nome do Jogador': '/caminho/para/imagem.png',
};
```

### Atualizar Imagem Padrão
```typescript
// Em src/utils/player-image/constants.ts
export const DEFAULT_PLAYER_IMAGE = '/novo/caminho/default.png';
```

## Referências
- `src/components/player-image/UnifiedPlayerImage.tsx` - Componente principal
- `src/utils/player-image/imageUtils.ts` - Lógica de fallback e validação
- `src/utils/player-image/constants.ts` - Constantes
- Memory: `features/image-handling-priority` - Regras de priorização
