

# Corrigir Erros de Build que Travam o Preview

O preview fica desatualizado porque existem **erros de TypeScript** que impedem a compilação. São 2 arquivos com problemas de tipo:

## 1. `src/pages/Index.tsx` — Cast do retorno da RPC

O `supabase.rpc('get_home_stats')` retorna tipo `Json`, mas o código acessa `.player_count`, `.jersey_count`, `.today_players` diretamente.

**Fix**: Fazer cast seguro com `as unknown as { player_count: number; jersey_count: number; today_players: number }` antes de acessar as propriedades.

## 2. `src/components/admin/reports/ImageFeedbackReport.tsx` — Tipo do `device_info`

A interface `ReportTableProps` define `device_info` como `{ pageUrl?: string } | null`, mas o Supabase retorna tipo `Json`. São incompatíveis.

**Fix**: Mudar o tipo de `device_info` para `Record<string, unknown> | null` e usar optional chaining no acesso a `pageUrl` (`(report.device_info as any)?.pageUrl`).

## Arquivos afetados
- `src/pages/Index.tsx` (1 linha)
- `src/components/admin/reports/ImageFeedbackReport.tsx` (3 linhas)

## Sobre o preview desatualizado
O preview do Lovable só atualiza quando o build compila com sucesso. Esses 2 erros de tipo estão bloqueando toda compilação. Ao corrigi-los, o preview voltará a atualizar normalmente.

