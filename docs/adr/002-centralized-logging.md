# ADR 002: Sistema de Logging Centralizado

## Status
Aceito - 2025-01-16

## Contexto
O código usava `console.log` e `console.error` de forma inconsistente, dificultando debug em produção e impossibilitando controle de níveis de log.

## Decisão
Implementamos um sistema de logging centralizado em `src/utils/logger.ts` com:

- Níveis de log estruturados (debug, info, warn, error)
- Controle via modo debug (localStorage ou query param)
- Formatação consistente com timestamps e contexto
- Integração com Sentry para erros
- Suporte a agrupamento de logs relacionados

## Uso

```typescript
import { logger } from '@/utils/logger';

// Log simples
logger.info('Usuário fez login', { userId: '123' });

// Log de erro
logger.error('Falha na autenticação', error);

// Log de debug (apenas em modo debug)
logger.debug('Estado interno', { state });
```

## Consequências

### Positivas
- ✅ Logs estruturados e pesquisáveis
- ✅ Controle de verbosidade em produção
- ✅ Facilita debug e troubleshooting
- ✅ Integração com ferramentas de monitoramento
- ✅ Formatação consistente

### Negativas
- ⚠️ Requer migração de console.log existentes
- ⚠️ Overhead mínimo de performance (negligenciável)

## Alternativas Consideradas

1. **Wrapper simples de console** - Rejeitado: Pouco controle
2. **Biblioteca externa (winston/pino)** - Rejeitado: Overhead desnecessário para frontend
3. **Apenas Sentry** - Rejeitado: Limitado para logs não-erro
