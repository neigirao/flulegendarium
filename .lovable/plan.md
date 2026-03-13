# Plano: Pagina Publica de Estatisticas + Melhorias de Dados

## Analise dos Dados Atuais (como especialista de dados)

### O que existe hoje

- **360 rankings** salvos, **90 jogadores unicos**, **428 tentativas**, **64 sessoes**
- **196 jogadores** no banco, **189 camisas**
- Dados de dificuldade ja recalculados: 82 facil, 81 muito_facil, 16 dificil, 11 muito_dificil, 6 medio
- Ultimo ranking salvo: 10/fev/2026 (1 mes sem atividade recente)
- Top scorer: "Pretinha dog tricolor" com 2680 pts

### Problemas identificados

1. **Dados fragmentados**: rankings em `rankings` + `jersey_game_rankings` + `card_game_rankings` — nao ha visao unificada
2. **Metricas de engajamento ausentes**: nao ha taxa de retorno, distribuicao de scores, ou tendencias temporais visiveis ao publico
3. **PersonalDashboard so para logados**: estatisticas pessoais requerem auth, mas dados agregados poderiam ser publicos
4. **Jogadores mais dificeis/faceis**: dados existem (`player_difficulty_stats`) mas nao sao exibidos para o publico
5. **Nenhuma pagina de estatisticas globais**: tudo esta escondido no admin ou no dashboard pessoal

---

## Proposta: Pagina `/estatisticas` publica

Uma pagina acessivel a todos com dados agregados do jogo, dividida em secoes:

### Secao 1 — Numeros Gerais (hero cards)

- Total de partidas jogadas (360)
- Jogadores unicos (90)
- Acertos totais
- Jogadores no banco de dados (196) sem mostrar a foto dele
- Camisas no acervo (189) mas sem mostrar a imagem dela

### Secao 2 — Jogadores Mais Conhecidos vs Mais Dificeis

- Top 10 jogadores com maior taxa de acerto (os "lendas faceis") - sem mostrar a foto
- Top 10 jogadores com menor taxa de acerto (os "lendas dificeis") -  sem mostrar a foto
- Dados vindos da tabela `players` (campos `total_attempts`, `correct_attempts`)

### Secao 3 — Hall da Fama Expandido

- Top 10 por modo de jogo (ja existe no Home, mas versao expandida com mais dados: media, total de jogos, melhor score)
- Jogadores mais dedicados (mais partidas jogadas)

### Secao 4 — Distribuicao de Dificuldade

- Grafico de pizza/barra mostrando quantos jogadores em cada nivel de dificuldade
- Dados ja disponiveis: 82 facil, 81 muito_facil, 16 dificil, etc.

### Secao 5 — Curiosidades

- Jogador mais adivinhado (Henrique Dourado: 97 tentativas)
- Jogador com 100% de acerto (Washington, Roni, Higor Leite)
- Maior pontuacao ja registrada (2680 pts)

---

## Implementacao Tecnica

### Arquivos a criar

1. `**src/pages/EstatisticasPublicas.tsx**` — pagina principal com todas as secoes
2. `**src/components/stats/GlobalStatsCards.tsx**` — cards de numeros gerais
3. `**src/components/stats/DifficultyDistribution.tsx**` — grafico com Recharts (ja instalado)
4. `**src/components/stats/HardestPlayers.tsx**` — tabela jogadores mais dificeis/faceis
5. `**src/components/stats/TopPlayersExpanded.tsx**` — ranking expandido

### Arquivos a editar

- **Roteamento**: adicionar `/estatisticas` no router
- `**TopNavigation.tsx**`: adicionar link "Estatisticas" na navegacao

### Queries necessarias (todas publicas, sem RLS issues)

- `players`: SELECT publico (ja tem policy)
- `rankings`: SELECT publico (ja tem policy)
- `jersey_game_rankings`: SELECT publico (ja tem policy)
- `game_attempts`: SELECT publico (ja tem policy)

Nenhuma migracao de banco necessaria — todos os dados ja estao acessiveis via RLS existente.

### Stack

- Recharts para graficos (ja instalado)
- Framer Motion para animacoes de entrada
- Queries com `staleTime: 10min` (dados mudam pouco)