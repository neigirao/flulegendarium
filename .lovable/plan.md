# Plano: Melhorias nas paginas de Estatisticas, Home e Jogos

## Auditoria Completa — 8 Lentes

---

### 1. SEO — URLs canonicas com dominio antigo

**Problema critico**: 4 paginas de jogo ainda usam `flulegendarium.lovable.app` nas meta tags:

- `GameModeSelection.tsx` linha 49
- `DecadeGuessPlayerSimple.tsx` linha 16
- `AdaptiveGuessPlayerSimple.tsx` linha 17
- `ShareSystem2.tsx` linha 190

**Problema secundario**: A pagina de estatisticas nao tem FAQ Schema (FAQ Section ausente) nem BreadcrumbList schema. O titulo SEO e generico ("Estatisticas | Lendas do Flu") — poderia ser mais descritivo com keywords de cauda longa.

**Correcoes**:

- Migrar todas as 4 paginas para usar `DynamicSEO` com `baseUrl = lendasdoflu.com` em vez de `SEOHead` com URL hardcoded
- Atualizar titulo da pagina de estatisticas para "O Flu em Numeros: Estatisticas, Rankings e Curiosidades do Quiz | Lendas do Flu"
- Adicionar BreadcrumbList JSON-LD na pagina de estatisticas

---

### 2. Conteudo / Redator

**Home — textos repetitivos e desatualizados**:

- "188+ jogadores" na linha 115 (dado estatico) — deveria ser dinamico ou removido
- "50+ camisas historicas" (sao 189 camisas no banco)
- "3 modos de jogo" repetido 2x no hero (linhas 58-63 e 62)
- Secao "Como Funciona" e generica — poderia ter linguagem mais emocional para torcedores

**Estatisticas — narrativas fracas**:

- SectionHeaders com subtitulos staticos que nao refletem os dados reais
- "A maioria prefere o modo adaptativo — e joga quando a noite cai" — isso deveria ser dinamico baseado nos dados
- Falta uma frase de abertura emocional conectando o torcedor aos numeros

**Correcoes**:

- Tornar contagem de jogadores/camisas dinamica na Home (query leve com `head: true`)
- Reescrever textos do hero com linguagem mais emocional ("Voce conhece TODAS as lendas?")
- Tornar subtitulos das secoes de estatisticas dinamicos (calculados a partir dos dados)

---

### 3. Engenheiro de Performance

**Pagina de Estatisticas — 6+ queries paralelas no mount**:

- `GlobalStatsCards`: 6 queries
- `Curiosidades`: 5 queries
- `PlayerBehaviorStats`: 2 queries
- `MonthlyGrowthChart`: 1 query
- `DecadeDistribution`: 1 query
- `ScoreDistribution`: 1 query
- `HardestPlayers`: 1 query
- `TopPlayersExpanded`: 2 queries
- `DifficultyDistribution`: 1 query
Total: ~20 queries Supabase no mount inicial

**Problema**: Todas disparam simultaneamente. Recharts renderiza 5 graficos com `ResponsiveContainer` (recalcula layout no resize).

**Correcoes**:

- Agrupar secoes abaixo da dobra com `contentVisibility: auto` + `containIntrinsicSize` (igual a Home)
- As secoes de graficos (posicao 3-9) so precisam renderizar quando visiveis
- Considerar consolidar queries em 1-2 edge functions para reduzir round-trips (futuro)

---

### 4. Analista de Dados

**Dados subutilizados**:

- `jersey_difficulty_stats`: tem `guess_time` — poderia mostrar "Tempo medio de resposta" por modo
- `game_sessions.total_correct` vs `total_attempts` — taxa de acerto por sessao (nao so global)
- `card_game_rankings`: existe mas nao aparece em nenhuma estatistica publica
- `jersey_game_rankings.max_streak`: recorde de streak do quiz de camisas (separado do quiz principal)
- `rankings.difficulty_level`: distribuicao de rankings por nivel de dificuldade
- `funnel_events`: taxa de conversao (game_start → ranking_saved) poderia ser um insight publico

**Metricas ausentes que geram engajamento**:

&nbsp;

- "Quantos jogadores ja passaram por aqui hoje" (contador live-like baseado em game_starts do dia)

**Correcoes**:

- Adicionar card "Camisas Quiz" no Hall da Fama expandido (ja existe `jersey` tab mas falta no GlobalStatsCards)
- Adicionar "Recorde de Streak por Modo" — separar streak do quiz classico vs camisas
- Adicionar micro-stat "Jogadores Hoje" na home (count de game_starts do dia)

---

### 5. UX

**Home**:

- CTA principal tem bom tamanho mas falta urgencia visual apos remocao do `animate-pulse`
- O card de login para usuarios nao-logados e pouco visivel — pouca hierarquia visual
- Secao "Como Funciona" usa steps 1-2-3 mas nao tem CTA ao final

**Estatisticas**:

- 9 secoes em scroll linear sem navegacao — usuario perde contexto
- Nenhum link/CTA para jogar a partir da pagina de estatisticas
- Graficos em mobile (393px viewport atual) podem ficar comprimidos

**Jog