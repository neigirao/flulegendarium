

# Plano: Redesign da Pagina de Estatisticas com Data Storytelling

## Diagnostico Atual

A pagina atual e uma lista vertical de tabelas e cards sem narrativa. Falta contexto, hierarquia visual e conexao emocional com os dados. Os dados existentes no banco sao muito mais ricos do que o que esta sendo mostrado.

## Dados Disponiveis (nao utilizados hoje)

| Dado | Fonte | Insight |
|------|-------|---------|
| 2.396 starts vs 360 rankings | `game_starts`, `rankings` | Funil de conversao — so 15% salva ranking |
| Pico as 23h BRT | `game_starts.started_at` | Tricolores jogam a noite |
| 355/360 scores entre 0-500 | `rankings.score` | A maioria e iniciante |
| Jan/2026 = 179 rankings | `rankings.created_at` | Tendencia temporal |
| 74% modo adaptativo | `game_starts.game_mode` | Preferencia de modo |
| 91 jogadores dos anos 2010 | `players.decades` | Era moderna domina |
| Recorde de streak: 51 | `game_sessions.max_streak` | Curiosidade engajante |
| 130 camisas titular, 40 reserva | `jerseys.type` | Distribuicao do acervo |

## Nova Estrutura da Pagina (Storytelling Flow)

```text
┌─────────────────────────────────────────┐
│  HEADER — "O Flu em Numeros"            │
│  Subtitulo narrativo contextual         │
├─────────────────────────────────────────┤
│  1. HERO STATS (cards atuais melhorados)│
│     + taxa de acerto global com gauge   │
├─────────────────────────────────────────┤
│  2. CURIOSIDADES (cards existentes)     │
│     + recorde de streak (51!)           │
│     + "horario nobre" do tricolor       │
├─────────────────────────────────────────┤
│  3. COMO OS TRICOLORES JOGAM (NOVO)    │
│     - Donut: Adaptativo vs Classico     │
│     - Mini bar: horario de pico         │
│     - Stat: avg acertos por sessao      │
├─────────────────────────────────────────┤
│  4. LINHA DO TEMPO (NOVO)              │
│     - Area chart: partidas por mes      │
│     - Highlight do melhor mes           │
├─────────────────────────────────────────┤
│  5. LENDAS POR DECADA (NOVO)           │
│     - Bar chart horizontal: decadas     │
│     - Narrativa "era dourada"           │
├─────────────────────────────────────────┤
│  6. DIFICULDADE (existente, melhorado)  │
│     - Mantém bar chart                  │
│     - Adiciona % de cada faixa          │
├─────────────────────────────────────────┤
│  7. CONHECIDAS vs DIFICEIS (existente)  │
│     - Mantém tabelas side-by-side       │
├─────────────────────────────────────────┤
│  8. HALL DA FAMA (existente)            │
│     - Mantém tabs com rankings          │
├─────────────────────────────────────────┤
│  9. DISTRIBUICAO DE SCORES (NOVO)       │
│     - Bar chart: faixas de pontuacao    │
│     - Narrativa "voce esta aqui"        │
└─────────────────────────────────────────┘
```

## Novos Componentes

### 1. `PlayerBehaviorStats.tsx`
- Donut chart (Recharts PieChart) mostrando Adaptativo (74%) vs Classico (26%)
- Mini bar chart com horarios de pico (agrupados em Manha/Tarde/Noite/Madrugada)
- Card com media de acertos por sessao (5.8) e recorde de streak (51)
- Query: `game_starts` (game_mode, started_at) + `game_sessions` (avg)

### 2. `MonthlyGrowthChart.tsx`
- Area chart (Recharts AreaChart) com partidas por mes
- Highlight automatico do melhor mes com badge
- Query: `rankings` agrupados por mes (to_char no JS)

### 3. `DecadeDistribution.tsx`
- Bar chart horizontal mostrando jogadores por decada
- Destaque para a decada com mais jogadores (2010s: 91)
- Query: `players.decades` com unnest no JS

### 4. `ScoreDistribution.tsx`
- Bar chart vertical com faixas (0-500, 501-1000, etc)
- Mensagem narrativa: "98% dos jogadores marcam ate 500 pts"
- Query: `rankings.score`

## Melhorias nos Componentes Existentes

### `Curiosidades.tsx`
- Adicionar 2 cards: "Recorde de Sequencia" (51 acertos seguidos) e "Horario Nobre" (23h BRT)
- Dados de `game_sessions.max_streak` e `game_starts.started_at`

### `DifficultyDistribution.tsx`
- Adicionar labels de % acima de cada barra
- Tooltip melhorado com porcentagem

### `EstatisticasPublicas.tsx`
- Reorganizar secoes na ordem do storytelling flow
- Adicionar subtitulos narrativos em cada secao (ex: "A maioria dos tricolores joga no modo adaptativo — e prefere a madrugada")

## Implementacao Tecnica

- Todas as queries usam Supabase client-side com `staleTime: 10min`
- Recharts ja instalado (PieChart, AreaChart, BarChart)
- Framer Motion para animacoes de entrada
- Sem migracao de banco — todos os dados ja estao acessiveis via RLS publico
- 4 arquivos novos + 3 arquivos editados

