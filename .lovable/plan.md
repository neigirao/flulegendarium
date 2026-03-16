

# Plano: Botao de Feedback de Imagem + Relatorio Admin

## Resumo

Adicionar um botao discreto no `UnifiedPlayerImage` e no `ImageGuard` que aparece quando a imagem falha (estado de erro ou fallback). O usuario clica, confirma o report, e os dados sao salvos na tabela `image_error_reports` (ja existente). No admin, criar uma nova aba com relatorio desses reports.

## Componentes

### 1. `src/components/image-feedback/ImageFeedbackButton.tsx` (NOVO)

Botao pequeno com icone de flag/alerta que:
- Recebe props: `itemName`, `itemType` ('player' | 'jersey'), `imageUrl`, `itemId?`
- Ao clicar, abre um mini popover/toast confirmando "Reportar imagem com problema?"
- Salva na tabela `image_error_reports` com `error_type: 'user_report'` e `player_name` = nome do jogador/camisa
- Usa `reportedImages` Set do `imageReportService` para evitar reports duplicados
- Feedback visual: toast de sucesso apos envio

### 2. Integracao nos componentes de imagem

**`UnifiedPlayerImage.tsx`**: Adicionar `ImageFeedbackButton` visivel quando `imageStatus === 'error'` ou quando esta em fallback (retryCount > 0 e loaded). Passa `player.name`, `player.id`, `currentSrc`.

**`ImageGuard.tsx`**: Adicionar prop opcional `itemName` e `itemId`. Quando `currentFallbackLevel >= 1` (usando fallback), mostrar o botao. Usado para camisas no jersey quiz.

### 3. `src/components/admin/reports/ImageFeedbackReport.tsx` (NOVO)

Tabela no admin mostrando:
- Nome do jogador/camisa
- URL original
- Tipo de erro
- Data do report
- Status (resolvido/pendente)
- Botao para marcar como resolvido
- Query: `supabase.from('image_error_reports').select('*').order('created_at', { ascending: false })`

### 4. `src/pages/Admin.tsx`

Adicionar o `ImageFeedbackReport` dentro da aba "Imagens" (`image-audit` tab), como terceira secao apos as auditorias existentes.

### 5. `src/services/imageReportService.ts`

Adicionar funcao `reportUserImageFeedback(itemName, itemType, imageUrl, itemId?)` que insere com `error_type: 'user_report'`.

## Tabela existente — sem migracao

A tabela `image_error_reports` ja tem todos os campos necessarios:
- `player_name` (text, required) — armazena nome do jogador ou camisa
- `original_url` (text, nullable) — URL da imagem
- `error_type` (text, default 'load_error') — usaremos 'user_report'
- `resolved` (boolean, default false)
- `device_info` (jsonb)

RLS ja permite INSERT publico (`With Check: true`) e SELECT para admins.

## Arquivos

| Acao | Arquivo |
|------|---------|
| Criar | `src/components/image-feedback/ImageFeedbackButton.tsx` |
| Criar | `src/components/admin/reports/ImageFeedbackReport.tsx` |
| Editar | `src/components/player-image/UnifiedPlayerImage.tsx` |
| Editar | `src/components/guards/ImageGuard.tsx` |
| Editar | `src/services/imageReportService.ts` |
| Editar | `src/pages/Admin.tsx` |

