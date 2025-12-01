# Configuração do Storage Bucket para Imagens

## Bucket Necessário: `players`

Para que o sistema de migração de imagens funcione corretamente, é necessário ter um bucket público chamado `players` no Supabase Storage.

## Verificação Rápida

Verifique se o bucket já existe:

```sql
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'players';
```

## Setup do Bucket

Se o bucket não existir, crie-o executando a migration abaixo:

```sql
-- Criar bucket público para imagens de jogadores
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'players', 
  'players', 
  true, 
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
);
```

## Políticas de Acesso (RLS)

### 1. Permitir leitura pública de todas as imagens

```sql
CREATE POLICY "Imagens de jogadores são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'players');
```

### 2. Permitir upload apenas para usuários autenticados (admin)

```sql
CREATE POLICY "Admins podem fazer upload de imagens"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'players' 
  AND auth.role() = 'authenticated'
);
```

### 3. Permitir atualização apenas para usuários autenticados

```sql
CREATE POLICY "Admins podem atualizar imagens"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'players' 
  AND auth.role() = 'authenticated'
);
```

### 4. Permitir exclusão apenas para usuários autenticados

```sql
CREATE POLICY "Admins podem deletar imagens"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'players' 
  AND auth.role() = 'authenticated'
);
```

## Estrutura de Arquivos

As imagens são salvas com o seguinte padrão:

```
/players/{player_id}.{ext}
```

Exemplos:
- `/players/31cc1063-38c2-4b29-86bf-cf1a6e055fdd.jpg`
- `/players/abc123-def456-ghi789.png`
- `/players/xyz789-uvw456-rst123.webp`

## URL Pública das Imagens

Após o upload, as URLs seguem o padrão:

```
https://{PROJECT_REF}.supabase.co/storage/v1/object/public/players/{player_id}.{ext}
```

Exemplo:
```
https://hafxruwnggitvtyngedy.supabase.co/storage/v1/object/public/players/31cc1063-38c2-4b29-86bf-cf1a6e055fdd.jpg
```

## Como Usar no Código

### Upload de Imagem

```typescript
import { supabase } from '@/integrations/supabase/client';

const uploadPlayerImage = async (playerId: string, blob: Blob, extension: string) => {
  const fileName = `${playerId}.${extension}`;
  
  const { data, error } = await supabase.storage
    .from('players')
    .upload(fileName, blob, {
      contentType: blob.type,
      upsert: true, // Sobrescreve se já existir
    });
    
  if (error) throw error;
  
  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('players')
    .getPublicUrl(fileName);
    
  return publicUrl;
};
```

### Download de Imagem

```typescript
const downloadPlayerImage = async (playerId: string) => {
  const { data, error } = await supabase.storage
    .from('players')
    .download(`${playerId}.jpg`);
    
  if (error) throw error;
  return data; // Blob
};
```

### Deletar Imagem

```typescript
const deletePlayerImage = async (playerId: string, extension: string) => {
  const { error } = await supabase.storage
    .from('players')
    .remove([`${playerId}.${extension}`]);
    
  if (error) throw error;
};
```

## Migração Automática

O componente `ImageAuditDashboard` realiza toda a migração automaticamente:

1. Faz download da URL externa
2. Faz upload para o bucket `players`
3. Atualiza a coluna `image_url` na tabela `players`
4. Gera logs detalhados de cada operação

## Solução de Problemas

### Erro: "Bucket not found"

Execute a SQL de criação do bucket:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('players', 'players', true);
```

### Erro: "Permission denied"

Verifique as políticas RLS no bucket:
```sql
SELECT * FROM storage.policies WHERE bucket_id = 'players';
```

### Erro: "File too large"

Aumente o limite de tamanho do bucket:
```sql
UPDATE storage.buckets 
SET file_size_limit = 20971520 -- 20MB
WHERE id = 'players';
```

### Erro: "Invalid mime type"

Adicione o tipo MIME necessário:
```sql
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
WHERE id = 'players';
```

## Monitoramento

### Ver todos os arquivos no bucket

```sql
SELECT name, bucket_id, created_at, updated_at, 
       pg_size_pretty(metadata->>'size') as size
FROM storage.objects 
WHERE bucket_id = 'players'
ORDER BY created_at DESC;
```

### Estatísticas de uso

```sql
SELECT 
  bucket_id,
  COUNT(*) as total_files,
  pg_size_pretty(SUM((metadata->>'size')::bigint)) as total_size
FROM storage.objects 
WHERE bucket_id = 'players'
GROUP BY bucket_id;
```

## Backup e Recuperação

### Listar todas as URLs atuais

```sql
SELECT id, name, image_url 
FROM players 
WHERE image_url LIKE '%supabase.co/storage%'
ORDER BY name;
```

### Backup antes da migração

```sql
CREATE TABLE players_backup AS 
SELECT * FROM players;
```

### Restaurar URLs antigas

```sql
UPDATE players 
SET image_url = players_backup.image_url 
FROM players_backup 
WHERE players.id = players_backup.id;
```

## Recomendações

1. ✅ Sempre use `upsert: true` para permitir re-upload
2. ✅ Mantenha extensões consistentes (.jpg, .png, .webp)
3. ✅ Use o UUID do jogador como nome do arquivo
4. ✅ Configure limite de tamanho adequado (10-20MB)
5. ✅ Monitore uso de storage regularmente
6. ✅ Faça backup da tabela `players` antes de migrações em massa

## Referências

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [RLS Policies for Storage](https://supabase.com/docs/guides/storage/security/access-control)
- `src/components/admin/images/ImageAuditDashboard.tsx` - Interface de migração
- `docs/adr/006-image-migration-strategy.md` - Decisão arquitetural
