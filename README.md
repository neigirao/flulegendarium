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
npm ci
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## Produto e publicação (02/10/2026)

- Site: https://lendasdoflu.com/ . React Router oferece quiz adaptativo, por década e camisas, rankings, perfil, desafios, páginas públicas e administração.
- Login de usuário: Google e Apple. Web usa OAuth Supabase; iOS usa `ASWebAuthenticationSession` e retorno `lendasdoflu://entrar`, tratados em `src/lib/entrar-nativo.ts`.
- Uma rodada demo por sessão de navegador permite experimentar sem conta; após Game Over, `/auth` permite continuar. Não salva ranking do convidado. Não é proteção antifraude nem promessa de funcionamento offline.
- Desafios usam o dia de São Paulo. Contagens somam; sequência e precisão usam o maior valor. Sequência de dias avança ao terminar uma partida, não ao abrir o menu.
- Ainda não há crédito transacional de recompensa de desafio. A UI não promete bônus nem soma ao ranking. A correção da rotação em `supabase/functions/rotate-daily-challenges` precisa de deploy separado.
- Eventos GA4 `auth_start`, `auth_success`, `auth_error`, `auth_abandon` são aditivos ao funil existente. Só enviam enums de provedor, superfície e motivo; nunca e-mail, ID, token, texto do erro ou URL de retorno.
- `main` não prova que a versão está publicada. O publish Lovable, deploy de função e migração de banco são etapas separadas. PRs só entram depois do CI verde; não executar schema/deploy/publish como efeito de editar documentação.

## Validação local

```bash
npm run lint
npx tsc --noEmit -p tsconfig.app.json
npm test
npm run test:coverage
npm run build
npm run test:e2e
```

O Playwright abre Vite em 8080 localmente; em CI usa preview em 4173 após build. Instale o Chromium com `npx playwright install chromium`. Fixtures E2E usam uma sessão de teste, não credenciais de uma pessoa real. CI GitHub executa lint/build/testes/cobertura; E2E e Lighthouse são workflows separados. Codemagic também tem workflow web e iOS; não disparar distribuição só para validar documentação.

## Variáveis de ambiente

Use `.env.example` como referência, mas confira quem consome cada configuração:

| Configuração | Consumidor e efeito atual |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | `useGoogleOneTap.ts`; opcional para One Tap. Botões OAuth não dependem desse script. |
| `VITE_GA4_ID` | `use-analytics.ts`; fallback `G-X2VE77MEYC`. O loader no `index.html` também tem o ID fixo: alinhar ambos ao trocar propriedade. |
| `VITE_ENABLE_DESIGN_SYSTEM` | Ativa `/design-system` em produção com `true`; ativo em DEV. |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` | Constam no exemplo, mas **não substituem** o cliente gerado atual: `src/integrations/supabase/client.ts` contém URL e chave pública fixas. Rever esse arquivo e a configuração Lovable ao trocar backend. |

Segredos das Edge Functions ficam no servidor: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `INTERNAL_FUNCTION_SECRET`; `RESEND_API_KEY`, `OPENAI_API_KEY`, `SENTRY_DSN` e `ENVIRONMENT` são usados pelas funções que precisam deles. Nunca colocar service-role, certificados, chave Apple `.p8` ou tokens de assinatura em `VITE_*`, commits ou logs.

Google/Apple e redirect URLs são configurados no Supabase/provedor, não só em `.env`. No iOS, manter esquema de URL e bundle ID alinhados com Info.plist e Capacitor. Consulte `docs/mobile-ios.md`.

## Documentação essencial

- Arquitetura e limites de responsabilidade: `docs/ARCHITECTURE.md`
- Guia para contribuição técnica: `docs/CONTRIBUTING.md`
- Guia operacional para IA: `docs/AI_GUIDE.md`
- Índice rápido do código para agentes: `docs/AI_CODEBASE_INDEX.md`
- Runbook de diagnóstico e triagem: `docs/ERROR_TRIAGE.md`
- Estratégias de prevenção de erro de imagens: `docs/IMAGE_ERROR_PREVENTION.md`
- Fluxo de jogo funcional: `docs/GAME_FLOW.md`

## Objetivo de engenharia (2026)

A aplicação adota 3 princípios obrigatórios:

1. **Falhar de forma observável**: todo erro relevante deve ser rastreável por logs/eventos com contexto.
2. **Corrigir com segurança**: mudanças devem seguir checklist de impacto e validações mínimas.
3. **Evoluir com IA sem perder controle**: toda proposta de IA deve declarar hipótese, risco e plano de rollback.

## Processo recomendado para mudanças

1. Ler `docs/AI_GUIDE.md`, `docs/AI_CODEBASE_INDEX.md` (se usar IA) e `docs/ARCHITECTURE.md`.
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
