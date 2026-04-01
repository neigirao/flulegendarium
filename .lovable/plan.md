

# Revisão: Perfil, Conquistas e Bug da Imagem QR Code

## Achados

### 1. BUG CRÍTICO — QR Code de doação como fallback de camisa
Em `src/utils/fallback-images/index.ts` linha 21, `DEFAULT_JERSEY_IMAGE` aponta para `/lovable-uploads/7df50b87-e220-4f5e-be35-e5f61cb46d2f.png` — que é a **imagem do QR Code PIX de doação** usada em `Donations.tsx`. Embora `DEFAULT_JERSEY_IMAGE` não esteja sendo importada atualmente em nenhum componente, sua existência é perigosa e deve ser corrigida para apontar ao SVG de camisa inline ou ao escudo do clube.

Além disso, a validação em `src/utils/player-image/imageUtils.ts` **não bloqueia URLs do tipo gstatic** (que são thumbnails do Google e podem parecer QR codes). Apenas o jersey imageUtils tem essa proteção. Precisamos adicionar o mesmo bloqueio no player imageUtils.

### 2. Perfil (`ProfilePage.tsx`) — 100% dados reais, OK
- Todas as estatísticas vêm de `use-user-profile.ts` que consulta `user_game_history`, `rankings` e `user_challenges` no Supabase
- Nenhum dado mockado encontrado
- Empty states bem tratados
- **Sem problemas**

### 3. Conquistas (`Conquistas.tsx` + `AchievementsGrid.tsx`) — 100% dados reais, OK
- Progresso calculado a partir de `user_game_history` real via Supabase
- Achievements desbloqueados vêm de `user_achievements` table
- `calculateRealProgress` mapeia IDs de achievement para estatísticas reais do banco
- **Sem problemas de dados mockados**

### 4. Conquistas — Pequeno bug de progresso
O `calculateRealProgress` não cobre todos os achievement IDs definidos em `ACHIEVEMENTS`. IDs como `coracao_tricolor`, `primeiro_campeao`, `hat_trick_tricolor`, `titulo_em_casa`, `lenda_viva`, `heroi_copacabana`, `campeao_america`, etc. não têm case no switch — retornam 0 sempre. Os cases existentes usam IDs antigos (`first_game`, `streak_5`, `games_10`, etc.) que não existem mais.

---

## Plano de Execução

### 1. Corrigir `DEFAULT_JERSEY_IMAGE` (fallback-images/index.ts)
Substituir a URL do QR code pela referência ao SVG inline de camisa (`fluminenseJerseySvg`), eliminando qualquer chance de mostrar QR code como fallback.

### 2. Adicionar bloqueio de gstatic no player imageUtils
Adicionar os patterns `encrypted-tbn0.gstatic.com` e `gstatic.com/images` à lista de `suspiciousPatterns` em `src/utils/player-image/imageUtils.ts`, igual já existe no jersey imageUtils.

### 3. Corrigir `calculateRealProgress` no AchievementsGrid
Atualizar o switch para usar os IDs reais definidos em `ACHIEVEMENTS` (`coracao_tricolor`, `primeiro_campeao`, `hat_trick_tricolor`, `titulo_em_casa`, `lenda_viva`, `heroi_copacabana`, `campeao_america`, `guerreiro_laranjeiras`, `filho_do_maraca`, `maquina_tricolor`, `raio_laranjeiras`), mapeando cada um para a estatística correta do banco.

