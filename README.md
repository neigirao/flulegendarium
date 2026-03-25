# Lendas do Flu

Quiz web sobre ídolos históricos do Fluminense com modos de jogo (adaptativo, por década e camisas), ranking e painel administrativo.

> **Foco desta documentação:** acelerar diagnóstico de erros, reduzir regressões e facilitar evolução assistida por IA.

## Visão rápida

- **Frontend:** React 18 + TypeScript + Vite
- **Estado e dados:** Zustand + TanStack Query
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **Qualidade:** ESLint, Vitest e Playwright

## Início rápido

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## Documentação essencial

- Arquitetura e limites de responsabilidade: `docs/ARCHITECTURE.md`
- Guia para contribuição técnica: `docs/CONTRIBUTING.md`
- Guia operacional para IA: `docs/AI_GUIDE.md`
- Runbook de diagnóstico e triagem: `docs/ERROR_TRIAGE.md`
- Estratégias de prevenção de erro de imagens: `docs/IMAGE_ERROR_PREVENTION.md`
- Fluxo de jogo funcional: `docs/GAME_FLOW.md`

## Objetivo de engenharia (2026)

A aplicação adota 3 princípios obrigatórios:

1. **Falhar de forma observável**: todo erro relevante deve ser rastreável por logs/eventos com contexto.
2. **Corrigir com segurança**: mudanças devem seguir checklist de impacto e validações mínimas.
3. **Evoluir com IA sem perder controle**: toda proposta de IA deve declarar hipótese, risco e plano de rollback.

## Processo recomendado para mudanças

1. Ler `docs/AI_GUIDE.md` (se usar IA) e `docs/ARCHITECTURE.md`.
2. Executar alteração pequena e orientada por hipótese.
3. Validar localmente (`npm run lint` + testes afetados).
4. Registrar decisões e riscos no PR (template em `docs/CONTRIBUTING.md`).
5. Se houver incidente, seguir `docs/ERROR_TRIAGE.md`.

## Critérios de “mudança pronta”

Uma mudança só é considerada pronta quando:

- não introduz `any` sem justificativa,
- não quebra modo offline/PWA nos fluxos críticos,
- mantém comportamento de seleção de jogadores e dificuldade,
- inclui atualização de documentação quando altera fluxos, contratos ou observabilidade.

## Mapa de diretórios (resumo)

```txt
src/
  components/        UI por domínio
  hooks/             lógica reutilizável de estado/fluxo
  services/          regras de negócio e integração
  stores/            estado global (Zustand)
  utils/             utilitários e validação
  integrations/      clients e config externa (Supabase)
  pages/             rotas
```

## Suporte

Para manutenção contínua, trate documentação como parte do código. Se um fluxo mudou e os docs não foram atualizados, a tarefa está incompleta.
