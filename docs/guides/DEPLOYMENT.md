# Guia de Deploy

Guia completo para deploy da aplicação Lendas do Flu.

## Pré-requisitos

- Conta na Lovable (para deploy automático)
- Supabase configurado (banco de dados)
- Variáveis de ambiente configuradas
- Imagens otimizadas

## Deploy via Lovable

### Deploy Automático

1. **Fazer commit das mudanças**
   - Todas as alterações são automaticamente versionadas
   - O Lovable mantém histórico completo

2. **Clicar em "Publish"**
   - Desktop: Canto superior direito
   - Mobile: Canto inferior direito no modo Preview

3. **Escolher tipo de deploy**
   - **Staging**: Preview antes de produção
   - **Production**: Deploy para domínio principal

### Comportamento de Deploy

**Frontend (UI, React):**
- Requer clique em "Update" no diálogo de publicação
- Gera build otimizado
- CDN cache pode levar alguns minutos

**Backend (Edge Functions, Database):**
- Deploy imediato e automático
- Migrações de banco aplicadas automaticamente
- Edge functions atualizadas instantaneamente

## Variáveis de Ambiente

### Obrigatórias

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### Opcionais

```env
VITE_SENTRY_DSN=seu_sentry_dsn
VITE_GA_MEASUREMENT_ID=seu_google_analytics_id
VITE_DEBUG_MODE=false
```

### Configuração

1. Acesse **Settings → Environment Variables**
2. Adicione as variáveis necessárias
3. Faça novo deploy para aplicar

## Domínio Customizado

### Conectar Domínio

1. **Acesse Settings → Domains**
2. **Adicione seu domínio**
   - dominio.com (domínio principal)
   - subdomain.dominio.com (subdomínio)

3. **Configure DNS**
   ```
   CNAME: seu-dominio.com → projeto.lovable.app
   ```

4. **Aguarde propagação** (até 48h)

### SSL/HTTPS

- Certificado SSL automático via Let's Encrypt
- Renovação automática
- HTTPS forçado por padrão

## Checklist Pré-Deploy

### Performance

- [ ] Imagens otimizadas (<200KB cada)
- [ ] Lazy loading implementado
- [ ] Code splitting configurado
- [ ] Service Worker ativo
- [ ] Compression (gzip/brotli) ativa

### SEO

- [ ] Meta tags configuradas
- [ ] Sitemap.xml gerado
- [ ] Robots.txt configurado
- [ ] Open Graph tags
- [ ] Structured data (JSON-LD)

### Segurança

- [ ] RLS policies ativas no Supabase
- [ ] API keys não expostas
- [ ] CORS configurado
- [ ] Rate limiting ativo
- [ ] Headers de segurança

### Funcionalidade

- [ ] Testes E2E passando
- [ ] Formulários validados
- [ ] Error boundaries implementados
- [ ] Loading states configurados
- [ ] Offline fallback

## Monitoramento Pós-Deploy

### Verificações Imediatas

1. **Teste o domínio**
   - Acesse https://seu-dominio.com
   - Verifique SSL
   - Teste em mobile

2. **Verifique funcionalidades**
   - Autenticação
   - Formulários
   - API calls
   - Navegação

3. **Monitore métricas**
   - Google Analytics
   - Sentry (erros)
   - Web Vitals
   - Logs do Supabase

### Ferramentas de Monitoramento

```bash
# Core Web Vitals
https://pagespeed.web.dev/

# SSL Check
https://www.ssllabs.com/ssltest/

# Mobile Friendly
https://search.google.com/test/mobile-friendly

# Structured Data
https://search.google.com/structured-data/testing-tool
```

## Rollback

### Em Caso de Problema

1. **Via Lovable:**
   - Settings → Version History
   - Selecione versão anterior
   - Clique "Restore"

2. **Banco de Dados:**
   - Supabase mantém backups automáticos
   - Acesse Supabase Dashboard → Backups
   - Restaure snapshot anterior se necessário

## CI/CD (Avançado)

### GitHub Integration

1. **Conecte repositório GitHub**
2. **Configure workflows** (`.github/workflows/`)
3. **Deploy automático em push**

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
      - run: npm run build
```

## Otimização de Cache

### Headers Recomendados

```apache
# .htaccess (se usando)
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

## Troubleshooting

### Problema: Site não atualiza

**Solução:**
1. Limpe cache do CDN (Lovable Dashboard)
2. Hard refresh no browser (Ctrl+Shift+R)
3. Aguarde até 5 minutos

### Problema: Erro 404 em rotas

**Solução:**
1. Configure redirect para index.html
2. Verifique routing do React Router
3. Adicione `_redirects` file:
   ```
   /*    /index.html   200
   ```

### Problema: Variáveis de ambiente não funcionam

**Solução:**
1. Verifique prefixo `VITE_`
2. Rebuild após adicionar variáveis
3. Confirme que estão no ambiente correto (staging/prod)

## Suporte

- [Lovable Docs](https://docs.lovable.dev/)
- [Lovable Discord](https://discord.gg/lovable)
- [Supabase Docs](https://supabase.io/docs)
