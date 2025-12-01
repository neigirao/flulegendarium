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

### Fase 3: Auditoria e Migração Automática via Edge Function (ATUAL)
Sistema completo de migração robusta usando Edge Function:

1. **Auditoria do Banco**
   - Query SQL identifica todas as URLs externas
   - Classifica por domínio e nível de problema
   - Dashboard visual com estatísticas

2. **Edge Function de Migração**
   - `migrate-player-image`: Edge Function dedicada para migração
   - Download server-side (sem CORS ou rate limiting)
   - Upload otimizado para bucket `players` no Supabase Storage
   - Atualização atômica da tabela `players`
   - Logs detalhados de cada operação

3. **Interface Admin com Processamento em Lotes**
   - Componente `ImageAuditDashboard` em painel admin
   - Processamento em lotes de 5 jogadores por vez
   - Delay de 2 segundos entre lotes para evitar sobrecarga
   - Barra de progresso em tempo real (processados/total)
   - Estatísticas detalhadas: sucessos, erros, progresso atual
   
4. **Tratamento de Erros e Retry**
   - Status individual por jogador (pending/processing/success/error)
   - Botão "Tentar Novamente" para migrações que falharam
   - Mensagens de erro específicas por jogador
   - Logs completos no console do Edge Function

## Arquitetura da Solução

```typescript
// Fluxo de Migração com Edge Function
1. Admin acessa tab "Auditoria de Imagens"
2. Clica em "Iniciar Auditoria"
   → Query: SELECT id, name, image_url FROM players
   → Análise: isProblematicDomain(url)
   → Resultado: Lista classificada por risco
3. Seleciona jogadores para migrar
4. Clica em "Migrar Selecionadas"
   → Para cada lote de 5 jogadores:
     a) supabase.functions.invoke('migrate-player-image', {...})
        → Edge Function executa:
          1. fetch(external_url) no servidor (sem CORS)
          2. supabase.storage.upload() → Upload para "players"
          3. supabase.from('players').update() → Atualiza URL
          4. console.log() → Log detalhado
     b) Aguarda 2 segundos antes do próximo lote
     c) Atualiza barra de progresso em tempo real
     d) Marca status: success ou error com mensagem
5. Exibe botão "Tentar Novamente" para falhas
```

### Componentes Criados

**`supabase/functions/migrate-player-image/index.ts`**
- Edge Function dedicada para migração robusta
- Download server-side de imagens externas (sem CORS)
- Upload otimizado para Supabase Storage
- Atualização atômica da tabela players
- Retorno estruturado: { success, newUrl, error }
- Logs detalhados para debugging

**`src/components/admin/images/ImageAuditDashboard.tsx`**
- Interface completa de auditoria
- Estatísticas visuais (cards com métricas)
- Seleção múltipla de jogadores
- **Processamento em lotes** (5 jogadores por vez, 2s delay)
- **Barra de progresso** em tempo real com contador
- **Status individual** por jogador (pending/processing/success/error)
- **Botão de retry** para migrações que falharam
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
- ✅ **Edge Function elimina problemas de CORS**
- ✅ **Processamento em lotes previne sobrecarga**
- ✅ **Barra de progresso e feedback em tempo real**
- ✅ **Sistema de retry para falhas individuais**
- ✅ **Logs detalhados para debugging**

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
