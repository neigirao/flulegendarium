# Configuração do Cron Job para Auditoria Semanal de Imagens

Este documento descreve como configurar a auditoria automática semanal de imagens com relatório por email.

## Visão Geral

A edge function `weekly-image-audit` realiza auditoria completa de todas as imagens de jogadores no banco de dados e envia um relatório detalhado por email com:
- Total de jogadores
- Quantidade de URLs externas vs locais
- Lista de jogadores com URLs problemáticas
- Estatísticas visuais
- Link direto para o painel admin

## Pré-requisitos

### 1. Habilitar Extensões do PostgreSQL

Você precisa habilitar as extensões `pg_cron` e `pg_net` no Supabase:

**Acesse:** https://supabase.com/dashboard/project/hafxruwnggitvtyngedy/database/extensions

Habilite as seguintes extensões:
- ✅ `pg_cron` - Para jobs agendados
- ✅ `pg_net` - Para fazer chamadas HTTP

### 2. Configurar Email no Resend

1. **Validar Domínio:**
   - Acesse: https://resend.com/domains
   - Adicione e valide seu domínio personalizado
   - Configure os registros DNS necessários

2. **Atualizar Email na Edge Function:**
   
   Edite o arquivo `supabase/functions/weekly-image-audit/index.ts` e altere:

   ```typescript
   const emailResponse = await resend.emails.send({
     from: 'Lendas do Flu <noreply@seudominio.com>', // ← Alterar aqui
     to: ['seu-email@seudominio.com'],               // ← Alterar aqui
     subject: '📊 Relatório Semanal...',
     html: emailHtml,
   });
   ```

   **IMPORTANTE:** Se você ainda não validou um domínio, pode usar `onboarding@resend.dev` apenas para testes, mas isso tem limitações severas.

## Configuração do Cron Job

### Opção 1: Execução Semanal (Recomendado)

Execute toda **segunda-feira às 9h** (UTC):

```sql
-- Acessar: https://supabase.com/dashboard/project/hafxruwnggitvtyngedy/sql/new

SELECT cron.schedule(
  'weekly-image-audit',
  '0 9 * * 1',  -- Segunda-feira às 9h UTC
  $$
  SELECT
    net.http_post(
      url:='https://hafxruwnggitvtyngedy.supabase.co/functions/v1/weekly-image-audit',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZnhydXduZ2dpdHZ0eW5nZWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNDE0NTIsImV4cCI6MjA1NTkxNzQ1Mn0.gWlNlVeJyISEIjjfLN46hrZ7OZSKd_6rQFJ2LnUkVDw"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

### Opção 2: Execução Diária (Para Testes)

Execute **todos os dias às 9h** (UTC):

```sql
SELECT cron.schedule(
  'daily-image-audit',
  '0 9 * * *',  -- Todos os dias às 9h UTC
  $$
  SELECT
    net.http_post(
      url:='https://hafxruwnggitvtyngedy.supabase.co/functions/v1/weekly-image-audit',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZnhydXduZ2dpdHZ0eW5nZWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNDE0NTIsImV4cCI6MjA1NTkxNzQ1Mn0.gWlNlVeJyISEIjjfLN46hrZ7OZSKd_6rQFJ2LnUkVDw"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

### Opção 3: Execução Mensal

Execute **todo dia 1º de cada mês às 9h** (UTC):

```sql
SELECT cron.schedule(
  'monthly-image-audit',
  '0 9 1 * *',  -- Dia 1º de cada mês às 9h UTC
  $$
  SELECT
    net.http_post(
      url:='https://hafxruwnggitvtyngedy.supabase.co/functions/v1/weekly-image-audit',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZnhydXduZ2dpdHZ0eW5nZWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNDE0NTIsImV4cCI6MjA1NTkxNzQ1Mn0.gWlNlVeJyISEIjjfLN46hrZ7OZSKd_6rQFJ2LnUkVDw"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

## Sintaxe do Cron

Formato: `minuto hora dia mês dia-da-semana`

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Dia da semana (0-7, 0=Domingo, 7=Domingo)
│ │ │ └───── Mês (1-12)
│ │ └─────── Dia do mês (1-31)
│ └───────── Hora (0-23)
└─────────── Minuto (0-59)
```

**Exemplos:**
- `0 9 * * 1` - Toda segunda às 9h
- `0 9 * * *` - Todos os dias às 9h
- `0 9 1 * *` - Todo dia 1º às 9h
- `*/30 * * * *` - A cada 30 minutos
- `0 */6 * * *` - A cada 6 horas

## Gerenciamento do Cron Job

### Listar Jobs Agendados

```sql
SELECT * FROM cron.job;
```

### Ver Execuções Recentes

```sql
SELECT 
  job_id,
  runid,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;
```

### Desabilitar Job Temporariamente

```sql
UPDATE cron.job 
SET active = false 
WHERE jobname = 'weekly-image-audit';
```

### Reabilitar Job

```sql
UPDATE cron.job 
SET active = true 
WHERE jobname = 'weekly-image-audit';
```

### Excluir Job Permanentemente

```sql
SELECT cron.unschedule('weekly-image-audit');
```

### Alterar Horário do Job

```sql
-- Primeiro, excluir o job existente
SELECT cron.unschedule('weekly-image-audit');

-- Depois, criar novamente com novo horário
SELECT cron.schedule(
  'weekly-image-audit',
  '0 10 * * 1',  -- Novo horário: Segunda às 10h
  $$
  SELECT
    net.http_post(
      url:='https://hafxruwnggitvtyngedy.supabase.co/functions/v1/weekly-image-audit',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZnhydXduZ2dpdHZ0eW5nZWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNDE0NTIsImV4cCI6MjA1NTkxNzQ1Mn0.gWlNlVeJyISEIjjfLN46hrZ7OZSKd_6rQFJ2LnUkVDw"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

## Teste Manual

Para testar a edge function antes de agendar, você pode executar manualmente:

### Pelo Terminal

```bash
curl -X POST https://hafxruwnggitvtyngedy.supabase.co/functions/v1/weekly-image-audit \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZnhydXduZ2dpdHZ0eW5nZWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNDE0NTIsImV4cCI6MjA1NTkxNzQ1Mn0.gWlNlVeJyISEIjjfLN46hrZ7OZSKd_6rQFJ2LnUkVDw" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Pelo Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/hafxruwnggitvtyngedy/functions/weekly-image-audit
2. Clique em "Invoke Function"
3. Envie um payload vazio: `{}`
4. Verifique os logs

## Monitoramento

### Ver Logs da Edge Function

**Acesse:** https://supabase.com/dashboard/project/hafxruwnggitvtyngedy/functions/weekly-image-audit/logs

Fique atento a:
- ✅ Status 200 - Sucesso
- ❌ Status 500 - Erro na execução
- 📧 "Email enviado com sucesso" nos logs
- 🚫 Erros do Resend (domínio não validado, etc.)

### Logs Típicos de Sucesso

```
🚀 Iniciando auditoria semanal de imagens...
🔍 Iniciando auditoria de imagens...
📊 Total de jogadores encontrados: 150
✅ Auditoria concluída: 12 jogadores problemáticos
📧 Enviando relatório por email...
✅ Email enviado com sucesso!
```

### Logs Típicos de Erro

```
❌ Erro ao enviar email: Domain not verified
```
**Solução:** Validar domínio no Resend

```
❌ Erro ao buscar jogadores: permission denied
```
**Solução:** Verificar RLS policies na tabela players

## Formato do Email

O email enviado contém:

**Header:**
- Título do relatório
- Data e hora da execução

**Estatísticas:**
- Total de jogadores
- URLs externas
- URLs problemáticas (precisam migração)
- URLs locais (OK)

**Tabela de Jogadores Problemáticos:**
- Nome do jogador
- URL da imagem atual
- Domínio identificado

**Call to Action:**
- Link direto para o painel admin
- Botão para migração

**Footer:**
- Data completa do relatório
- Informações do sistema

## Troubleshooting

### Problema: Email não está sendo enviado

**Verificações:**
1. Secret `RESEND_API_KEY` está configurada?
   ```sql
   -- Não é possível ver o valor, mas pode verificar se existe
   SELECT name FROM vault.secrets WHERE name = 'RESEND_API_KEY';
   ```

2. Domínio está validado no Resend?
   - Acesse: https://resend.com/domains
   - Status deve estar "Verified"

3. Email "from" está usando domínio validado?
   - Verifique na edge function se o email corresponde

### Problema: Cron job não está executando

**Verificações:**
1. Extensões habilitadas?
   ```sql
   SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');
   ```

2. Job está ativo?
   ```sql
   SELECT jobname, active, schedule FROM cron.job WHERE jobname = 'weekly-image-audit';
   ```

3. Verificar logs de execução:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE job_id = (SELECT jobid FROM cron.job WHERE jobname = 'weekly-image-audit')
   ORDER BY start_time DESC 
   LIMIT 10;
   ```

### Problema: Edge function retorna erro 500

**Verificações:**
1. Ver logs detalhados da edge function
2. Verificar se `SUPABASE_SERVICE_ROLE_KEY` está configurada
3. Verificar permissões RLS na tabela players

## Boas Práticas

1. **Teste Primeiro:**
   - Execute manualmente antes de agendar
   - Verifique se o email chega corretamente
   - Valide que o relatório está completo

2. **Monitore Regularmente:**
   - Verifique logs semanalmente
   - Configure alertas para falhas (opcional)
   - Mantenha email atualizado

3. **Ajuste a Frequência:**
   - Semanal é ideal para a maioria dos casos
   - Diário pode ser útil durante migrações ativas
   - Mensal para projetos estáveis

4. **Mantenha Documentado:**
   - Registre mudanças de horário
   - Documente alterações no email
   - Mantenha lista de destinatários atualizada

## Segurança

- ✅ Edge function usa `SUPABASE_SERVICE_ROLE_KEY` (acesso completo ao banco)
- ✅ Cron job usa `ANON_KEY` (seguro para chamadas públicas)
- ✅ Email API key armazenada em secrets (criptografada)
- ✅ Relatório não expõe dados sensíveis

## Recursos Adicionais

- [Documentação pg_cron](https://supabase.com/docs/guides/database/extensions/pgcron)
- [Documentação Resend](https://resend.com/docs)
- [Edge Functions Logs](https://supabase.com/dashboard/project/hafxruwnggitvtyngedy/functions/weekly-image-audit/logs)
- [SQL Editor](https://supabase.com/dashboard/project/hafxruwnggitvtyngedy/sql/new)
