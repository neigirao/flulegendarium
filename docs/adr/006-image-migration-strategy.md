# ADR 006: Estratégia de Migração de Imagens Externas

## Status
Aceito - 2025-12-01

## Contexto
URLs externas de imagens de jogadores apresentam problemas recorrentes:
- Rate limiting (429 errors) de sites como placar.com.br, globoesporte, etc.
- Domínios podem mudar ou descontinuar serviços
- Dependência de infraestrutura externa impacta UX
- Performance degradada por latência de servidores externos

Era necessário um sistema de auditoria e migração para storage local confiável.

## Decisão
Implementamos um sistema completo de auditoria e migração em 3 fases:

### Fase 1: Detecção e Fallback Imediato
- Fallbacks locais em `constants.ts` para jogadores críticos
- `ImageGuard` detecta falhas 429 e usa fallback automaticamente
- Registrado em memória: `infrastructure/image-loading-robustness`

### Fase 2: Detecção Inteligente e Cache
- Lista de domínios problemáticos (placar.com.br, globoesporte, etc.)
- Cache em `localStorage` de URLs que falharam (24h de duração)
- Retry com exponential backoff (1s, 2s, 4s, até 10s max)
- Priorização automática de fallbacks para URLs conhecidas como problemáticas
- Implementado em `src/utils/player-image/problematicUrls.ts`

### Fase 3: Auditoria e Migração Automática (ATUAL)
Sistema completo de migração para Supabase Storage:

1. **Auditoria do Banco**
   - Query SQL identifica todas as URLs externas
   - Classifica por domínio e nível de problema
   - Dashboard visual com estatísticas

2. **Migração Automática**
   - Download de imagens externas
   - Upload para bucket `players` no Supabase Storage
   - Atualização automática da tabela `players`
   - Logs detalhados de cada operação

3. **Interface Admin**
   - Componente `ImageAuditDashboard` em painel admin
   - Seleção manual ou automática de jogadores problemáticos
   - Migração em lote com feedback em tempo real
   - Estatísticas: total, externas, problemáticas, locais

## Arquitetura da Solução

```typescript
// Fluxo de Migração
1. Admin acessa tab "Auditoria de Imagens"
2. Clica em "Iniciar Auditoria"
   → Query: SELECT id, name, image_url FROM players
   → Análise: isProblematicDomain(url)
   → Resultado: Lista classificada por risco
3. Seleciona jogadores para migrar
4. Clica em "Migrar Selecionadas"
   → Para cada jogador:
     a) fetch(external_url) → Download
     b) supabase.storage.upload() → Upload para "players"
     c) supabase.from('players').update() → Atualiza URL
     d) logger.info() → Log detalhado
```

### Componentes Criados

**`src/components/admin/images/ImageAuditDashboard.tsx`**
- Interface completa de auditoria
- Estatísticas visuais (cards com métricas)
- Seleção múltipla de jogadores
- Migração em lote com progress
- Integração com sistema de cache e logs

**`src/utils/player-image/problematicUrls.ts`** (Fase 2)
- `KNOWN_PROBLEMATIC_DOMAINS`: Lista de domínios problemáticos
- `isProblematicDomain()`: Valida se domínio é conhecido como problemático
- `markUrlAsProblematic()`: Adiciona URL ao cache localStorage
- `isUrlProblematic()`: Verifica se URL está no cache (≥2 falhas)
- `getRetryDelay()`: Calcula delay com exponential backoff

### Integração no Admin

```typescript
// AdminDashboard.tsx
<TabsList className="grid w-full grid-cols-7">
  <TabsTrigger value="images">Auditoria de Imagens</TabsTrigger>
</TabsList>

<TabsContent value="images">
  <ImageAuditDashboard />
</TabsContent>
```

## Consequências

### Positivas
- ✅ Resolução definitiva de erros 429 e falhas externas
- ✅ Performance melhorada (CDN do Supabase)
- ✅ Controle total sobre disponibilidade de imagens
- ✅ Interface admin intuitiva para migração
- ✅ Migração não-destrutiva (URLs antigas preservadas em logs)
- ✅ Sistema escalável para futuros jogadores
- ✅ Fallbacks automáticos durante transição

### Negativas
- ⚠️ Requer intervenção admin para migrar
- ⚠️ Uso de storage do Supabase (custo potencial)
- ⚠️ Necessário configurar bucket `players` como público

## Processo de Migração Recomendado

1. **Preparação**
   ```sql
   -- Verificar se bucket existe e é público
   SELECT id, name, public FROM storage.buckets WHERE id = 'players';
   ```

2. **Auditoria Inicial**
   - Acessar Admin → Auditoria de Imagens
   - Clicar em "Iniciar Auditoria"
   - Revisar lista de jogadores problemáticos

3. **Migração Gradual**
   - Fase 1: Migrar jogadores com domínios conhecidos problemáticos
   - Fase 2: Migrar jogadores com URLs externas de sites de notícias
   - Fase 3: Considerar migrar todas as URLs externas restantes

4. **Validação**
   - Testar carregamento de imagens após migração
   - Verificar logs de erros no console
   - Monitorar cache de URLs problemáticas

## Manutenção Futura

### Adicionar Novo Domínio Problemático
```typescript
// src/utils/player-image/problematicUrls.ts
const KNOWN_PROBLEMATIC_DOMAINS = [
  'placar.com.br',
  'novo-dominio-problematico.com', // ← Adicionar aqui
];
```

### Limpar Cache Manualmente
```typescript
// Via console do browser ou botão no dashboard
clearProblematicUrlsCache();
```

### Forçar Re-migração
```typescript
// Painel admin permite re-selecionar e re-migrar
// Upload com { upsert: true } sobrescreve imagem existente
```

## Monitoramento

Métricas a observar:
- Taxa de erro 429 (deve reduzir a zero)
- Tempo de carregamento de imagens (deve melhorar)
- Tamanho do cache de URLs problemáticas (deve estabilizar)
- Uso de storage do Supabase (monitorar crescimento)

## Referências
- `src/components/admin/images/ImageAuditDashboard.tsx` - Dashboard de migração
- `src/utils/player-image/problematicUrls.ts` - Detecção inteligente
- `src/components/guards/ImageGuard.tsx` - Fallback automático
- `docs/adr/004-image-fallback-strategy.md` - Estratégia de fallback
- `docs/IMAGE_ERROR_PREVENTION.md` - Prevenção de erros
