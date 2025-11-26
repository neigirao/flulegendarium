# ADR 003: Sistema de Dificuldade Adaptativa

## Status
Aceito - 2025-01-16

## Contexto
O jogo precisava de um sistema que ajustasse automaticamente a dificuldade baseado no desempenho do jogador, mas que ao mesmo tempo respeitasse rigorosamente os níveis de dificuldade configurados no banco de dados.

## Decisão
Implementamos um sistema de dificuldade com as seguintes características:

### Níveis de Dificuldade
- **Iniciante**: Jogadores muito conhecidos e fáceis de identificar
- **Fácil**: Jogadores conhecidos com algumas pistas visuais
- **Médio**: Jogadores conhecidos mas que requerem conhecimento moderado
- **Difícil**: Jogadores menos conhecidos ou de épocas específicas
- **Expert**: Jogadores obscuros ou muito específicos

### Regras Fundamentais
1. **Respeito Absoluto ao Nível**: O sistema NUNCA faz fallback para outros níveis de dificuldade. Se não houver jogadores no nível solicitado, retorna erro.
2. **Seleção Aleatória**: Dentro do nível de dificuldade, a seleção é aleatória para evitar padrões previsíveis.
3. **Histórico de Uso**: Evita repetir jogadores recentemente usados, mantendo o jogo interessante.
4. **Reset de Pool**: Quando todos os jogadores de um nível foram usados, o pool é resetado.

### Estrutura no Banco de Dados
Cada jogador tem os seguintes campos de dificuldade:
```sql
difficulty_level: 'iniciante' | 'facil' | 'medio' | 'dificil' | 'expert'
difficulty_score: NUMBER (0-100) -- Score calculado baseado em estatísticas
difficulty_confidence: NUMBER (0-1) -- Confiança na classificação
```

### Implementação
Centralizada no `PlayerSelectionService` (`src/services/playerSelectionService.ts`):

```typescript
// Filtragem por dificuldade - SEM FALLBACKS
if (difficultyLevel) {
  filteredPlayers = this.filterByDifficulty(filteredPlayers, difficultyLevel);
  
  if (filteredPlayers.length === 0) {
    return {
      player: null,
      availablePlayers: [],
      didReset: false,
      debugMessage: `Nenhum jogador disponível na dificuldade ${difficultyLevel}`
    };
  }
}
```

## Consequências

### Positivas
- ✅ Gameplay consistente e previsível
- ✅ Respeita a curadoria manual de dificuldade
- ✅ Evita frustrações por jogadores inesperadamente difíceis
- ✅ Facilita balanceamento por análise de dados
- ✅ Permite ajustes granulares por jogador

### Negativas
- ⚠️ Requer curadoria cuidadosa do banco de dados
- ⚠️ Níveis mal distribuídos podem causar falta de jogadores
- ⚠️ Necessita monitoramento contínuo dos níveis

## Alternativas Consideradas

1. **Sistema com Fallbacks** - Rejeitado: Quebra a confiabilidade do nível de dificuldade
2. **Dificuldade Automática por IA** - Rejeitado: Muito complexo e propenso a erros
3. **Dificuldade Baseada em Taxa de Acerto** - Rejeitado: Cria feedback loop positivo
4. **Níveis Contínuos (0-100)** - Rejeitado: Dificulta curadoria e balanceamento

## Referências
- `src/services/playerSelectionService.ts` - Implementação principal
- `src/config/difficulty-levels.ts` - Configuração de níveis
- `src/types/guess-game.ts` - Tipos TypeScript
- Memory: `features/player-difficulty-system` - Regras de negócio
