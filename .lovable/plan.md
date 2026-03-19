

# Relatório Completo: Performance, UX, Design e Validação Funcional

## Metodologia
Auditoria realizada via profiling de performance do browser, inspeção visual mobile (375x812), revisão de código-fonte, análise de console logs e navegação em fluxos reais dos 3 modos de jogo, estatísticas e home.

---

## 1. PERFORMANCE

### Core Web Vitals (medidos na Home, mobile 375x812)

| Métrica | Valor | Status |
|---------|-------|--------|
| FCP | 6412ms | Ruim (meta: <1.8s) |
| CLS | 0.2139 | Precisa melhorar (meta: <0.1) |
| TTFB | 917ms | Aceitável para preview |
| DOM Content Loaded | 6114ms | Lento |
| Full Page Load | 7255ms | Lento |

**Nota**: Em ambiente preview/dev, valores de FCP e load são inflados pelo Vite dev server. Em produção (lovable.app) serão significativamente melhores, mas o CLS é um problema real.

### Causas do CLS (0.21)
- **Principal ofensor**: `div.pt-24.min-h-screen.safe-area-top` — shift de 0.2087. O layout principal se desloca quando o conteúdo carrega, provavelmente pelo carregamento tardio de imagens/fontes.
- **Botão de navegação mobile** e o **container flex** também contribuem.

### Recursos pesados
- **Imagem hero**: 580KB PNG (`6b2888cd...png`) — deveria ser WebP/AVIF
- **Sentry**: 203KB — grande mas necessário
- **lucide-react**: 159KB — importa ícones inteiros; tree-shaking pode não estar otimizado
- **framer-motion**: 82KB, 1402ms de carga — mais lento recurso

### JS Memory
- Heap usado: 25.6MB (saudável)
- DOM Nodes: 4521 (dentro do aceitável)
- Event Listeners: 593 (aceitável)

### Recomendações de Performance
1. **Converter imagens hero para WebP** — redução de ~60% no tamanho
2. **Reservar espaço fixo** para o conteúdo principal com `min-height` para eliminar CLS
3. **Lazy-load Sentry e framer-motion** — adiar inicialização para depois do FCP
4. **Otimizar imports do lucide-react** — verificar se importações individuais estão sendo usadas

---

## 2. UX — Fluxos Testados

### Home (/)
- **OK**: Botão "Começar a Jogar" visível e funcional
- **OK**: Layout responsivo sem scroll horizontal
- **Problema menor**: PWA prompt ("Instalar App") sobrepõe conteúdo inferior — mas tem X funcional

### Quiz Adaptativo (/quiz-adaptativo)
- **OK**: Formulário de nome de convidado funciona
- **OK**: CoachMark de onboarding aparece e pode ser pulado
- **OK**: Input de nome do jogador centralizado (correção anterior aplicada)
- **OK**: Imagem do jogador carrega com blur anti-cheat
- **OK**: DifficultyIndicator sem tooltip (correção aplicada com sucesso)
- **OK**: Botão "Tive um problema" visível durante jogo, oculto no game over

### Quiz Camisas (/quiz-camisas)
- **OK**: Formulário de nome funciona
- **OK**: Imagem da camisa carrega corretamente
- **OK**: Opções de ano (2019, 2022, 2017) exibidas em 3 botões lado a lado
- **Problema visual**: Quando o timer expira, o game over aparece mas os botões de ano ficam visíveis por trás do dialog, criando sobreposição visual
- **OK**: Botão "Jogar Novamente" e "Voltar ao Início" funcionais

### Game Over Dialog
- **OK**: X fecha o dialog (chama `handleGoHome` que navega para home)
- **OK**: QuickFeedbackButton removido (correção anterior aplicada)
- **OK**: Botões "Jogar Novamente" e "Voltar ao Início" funcionais
- **Nota**: O X navega para home ao invés de apenas fechar — pode ser confuso se o usuário quiser ver o resultado sem sair

### Estatísticas (/estatisticas)
- **OK**: Página carrega com breadcrumbs, header, cards de stats
- **OK**: Seção "Quiz das Camisas" integrada corretamente
- **OK**: Tabelas de "Lendas Mais Conhecidas" com dados reais
- **OK**: Layout responsivo funciona em mobile
- **OK**: CTA "Jogar Agora" no final da página

---

## 3. DESIGN — Validação Visual Mobile (375x812)

### Alinhamento e Centralização
- **OK**: Input de nome do jogador centralizado (AdaptiveGameContainer)
- **OK**: Opções de ano centralizadas (JerseyYearOptions com `flex justify-center`)
- **OK**: Botões de skip centralizados
- **OK**: Timer centralizado no topo

### Hierarquia Visual
- **OK**: Header "QUIZ DAS CAMISAS" / "QUIZ ADAPTATIVO" visível
- **OK**: Indicador de dificuldade sem tooltip disruptivo
- **OK**: Badge de dificuldade com cor e ícone

### Problemas de Design
1. **CLS visual**: Quando a página carrega, há um salto perceptível do conteúdo
2. **Imagem hero 580KB**: Carregamento lento em conexões móveis
3. **Sobreposição game over/ano**: Na camisa, os botões de ano ficam visíveis por trás do dialog

---

## 4. VALIDAÇÃO RETROATIVA — Correções Anteriores

| Correção | Status |
|----------|--------|
| Remover GameRulesTooltip | **Confirmado** — arquivo deletado, nenhuma referência no código |
| Remover tooltip do DifficultyIndicator | **Confirmado** — componente usa Badge simples sem Tooltip |
| Centralizar input no AdaptiveGameContainer | **Confirmado** — `flex flex-col items-center` aplicado |
| Centralizar anos no JerseyGameContainer | **Confirmado** — `flex flex-col items-center space-y-3 w-full` aplicado |
| Remover QuickFeedbackButton do GameOverDialog | **Confirmado** — removido, sem referências |
| Ocultar ImageFeedbackButton quando gameOver | **Confirmado** — `{!gameOver && ...}` aplicado |
| Corrigir X do FeedbackModal | **Confirmado** — `onOpenChange` chama `onClose` corretamente |
| Fix build error weekly-image-audit | **Confirmado** — @deno-types removido |

---

## 5. ERROS NO CONSOLE

| Erro | Severidade | Impacto |
|------|-----------|---------|
| `Invalid prop 'data-lov-id' on React.Fragment` em KeyboardShortcutsHint | Baixa | Warning do React dev-mode, não afeta produção. O Lovable injeta data-lov-id e conflita com Fragment |

Nenhum erro crítico ou exceção JavaScript encontrada.

---

## 6. PLANO DE AÇÕES RECOMENDADAS

### Prioridade Alta
1. **Reduzir CLS** — Adicionar `min-height` reservado para o container principal da home e reservar dimensões fixas para imagens hero
2. **Converter hero image para WebP** — De 580KB para ~200KB

### Prioridade Média
3. **Ocultar botões de ano quando game over** — No JerseyGameContainer, esconder `JerseyYearOptions` quando `gameOver === true` para evitar sobreposição visual
4. **Melhorar comportamento do X no GameOver** — Considerar fechar o dialog sem navegar para home (apenas `onClose()`) para UX mais intuitiva

### Prioridade Baixa
5. **Lazy-load framer-motion** — Carregar após interação do usuário para reduzir tempo de carregamento inicial
6. **PWA prompt menos intrusivo** — Atrasar aparição em 5-10s para não competir com CTA principal

---

## Conclusão

A aplicação está funcionalmente estável. Todas as 8 correções anteriores foram validadas e confirmadas. Os principais pontos de melhoria são: **CLS de 0.21** (problema de layout shift), **imagem hero pesada** e **sobreposição visual no game over do quiz de camisas**. Nenhum erro crítico de JavaScript foi encontrado.

