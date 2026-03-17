

# Plano: Estatisticas de Camisas na Pagina Publica e no Admin

## Contexto

A pagina publica `/estatisticas` e o admin dashboard tem relatorios ricos para o quiz de jogadores (dificuldade, decada, curiosidades, rankings, score distribution, etc.), mas nada especifico para o quiz de camisas. As tabelas `jerseys`, `jersey_game_rankings`, `jersey_game_sessions` e `jersey_difficulty_stats` ja tem dados reais.

## Pagina Publica — Novos Componentes

### 1. `src/components/stats/JerseyStatsCards.tsx`
Cards hero resumo do quiz de camisas:
- Total de camisas no acervo (query: `jerseys` count)
- Partidas de camisas jogadas (`jersey_game_rankings` count)
- Taxa de acerto global (`jersey_difficulty_stats` is_correct true vs total)
- Maior pontuacao (`jersey_game_rankings` max score)

### 2. `src/components/stats/HardestJerseys.tsx`
Duas listas lado a lado (mesmo layout do `HardestPlayers`):
- **Camisas Mais Reconhecidas**: jerseys com maior taxa de acerto (filtra `total_attempts > 2`)
- **Camisas Mais Dificeis**: jerseys com menor taxa de acerto
- Dados: `jerseys` table campos `total_attempts`, `correct_attempts`, `years`, `type`
- Exibe: anos da camisa, tipo (Principal/Visitante), taxa de acerto, tentativas

### 3. `src/components/stats/JerseyDecadeDistribution.tsx`
Grafico de barras horizontal (igual `DecadeDistribution`) mostrando quantas camisas existem por decada.
- Dados: campo `decades` da tabela `jerseys`

### 4. `src/components/stats/JerseyScoreDistribution.tsx`
Grafico de barras (igual `ScoreDistribution`) com distribuicao de scores do quiz de camisas.
- Dados: `jersey_game_rankings.score`

### 5. `src/components/stats/JerseyCuriosidades.tsx`
Cards de curiosidades:
- Camisa mais adivinhada (maior `total_attempts` com alto acerto)
- Camisa mais dificil (menor taxa com tentativas suficientes)
- Maior pontuacao e nome do jogador
- Maior sequencia (`jersey_game_rankings.max_streak`)
- Fabricante mais presente (`jerseys.manufacturer` count)

### 6. Integracao na pagina `EstatisticasPublicas.tsx`
Adicionar nova secao "Quiz das Camisas" com SectionHeader, contendo os componentes acima. Posicionar apos a secao "Como os Tricolores Jogam" para dar visibilidade.

## Admin — Nova aba de Estatisticas de Camisas

### 7. `src/components/admin/stats/JerseyStatsOverview.tsx`
Dashboard admin com:
- Cards: total camisas, partidas jogadas, taxa de acerto, jogadores unicos
- Tabela: top 10 camisas mais dificeis com taxa de acerto, tentativas, tempo medio
- Tabela: top 10 camisas mais faceis
- Grafico: distribuicao de dificuldade das camisas (muito_facil a muito_dificil)
- Dados: `jerseys`, `jersey_game_rankings`, `jersey_difficulty_stats`

### 8. Integracao no `AdminDashboard.tsx`
Adicionar terceira aba "Camisas" (alem de Estatisticas e Noticias) com icone `Shirt`, renderizando `JerseyStatsOverview`.

## Arquivos

| Acao   | Arquivo |
|--------|---------|
| Criar  | `src/components/stats/JerseyStatsCards.tsx` |
| Criar  | `src/components/stats/HardestJerseys.tsx` |
| Criar  | `src/components/stats/JerseyDecadeDistribution.tsx` |
| Criar  | `src/components/stats/JerseyScoreDistribution.tsx` |
| Criar  | `src/components/stats/JerseyCuriosidades.tsx` |
| Criar  | `src/components/admin/stats/JerseyStatsOverview.tsx` |
| Editar | `src/pages/EstatisticasPublicas.tsx` |
| Editar | `src/components/admin/AdminDashboard.tsx` |

Sem migracoes de banco. Todos os dados vem de tabelas existentes.

