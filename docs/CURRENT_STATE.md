# Estado atual e operação do Lendas do Flu

Revisão da main em15/10/2026. Este arquivo não comprova publicação, banco live, Edge Function implantada ou estado de revisão Apple.

## Mapa de leitura

README para setup; `ARCHITECTURE.md`, `CONTRIBUTING.md`, `AI_GUIDE.md` e `ERROR_TRIAGE.md` para manutenção. `mobile-ios.md` e `native-artwork.md` antes de tocar no pacote. Auditorias com data antiga e propostas em ADR não substituem código e verificação do ambiente.

## Produto e administração

Quiz adaptativo, década e camisas; demo de uma rodada sem ranking de convidado; desafios, perfil, conquistas, notícias e administração. `/admin` e `/admin/login` são superfícies distintas do login público. Admin inclui conteúdo e operação; manter os gates/RLS e não tratá-lo como interface apenas demonstrativa. Fonte inicial: `src/pages/Admin.tsx`, seus componentes e RPCs.

Não inventar retenção: atividade, cadastro e presença histórica são métricas diferentes. Nunca converter indisponibilidade em zero. Notícias precisam usar data/autoria reais; OG/favicon web e arte temporária do app são superfícies diferentes.

## Exclusão da conta no escopo do app

`ProfilePage.tsx` inclui `ExcluirContaSecao`; regras em `src/lib/excluir-conta.ts`. Palavra EXCLUIR libera confirmação. A conta Apple é reautenticada e revogada via `revoke-apple-token` antes de `delete_my_lendas_data`. Falha/cancelamento não deve ser sucesso. O retorno web usa marcador por sessão vinculado ao mesmo usuário.

O backend é compartilhado com outros projetos. O contrato apaga dados do Lendas e PRESERVA `auth.users`; não ampliar para exclusão global nem prometer apagar dados externos. A sessão sai após o sucesso. A presença de UI/RPC no repositório não comprova SQL aplicado ou a função publicada.

Antes de teste destrutivo ou merge de mudança destrutiva: backup verificado, teste real explicitamente autorizado em conta descartável, SQL de produção mostrado antes da execução. Nunca usar conta ativa ou a demonstração da Apple Review. Não reexecutar migrations antigas para "sincronizar".

## Observabilidade

`src/main.tsx` inicializa Sentry de forma tardia e condicional. `src/utils/sentry.ts`: integrations vazias, traces/replay zerados, sendDefaultPii false, remoção de IP do objeto user. Existem breadcrumbs de Web Vitals e navegação; não afirmar que todo contexto é removido. Revisar eventos/painel ao alterar privacidade. Sem Hotjar/AdSense no desenho atual; não introduzir trackers por copiar um template.

Não transpor Crashlytics de outro app: `codemagic.yaml` inspecionado não contém a etapa Firebase dos outros repositórios. Para afirmar crash reporting nativo, verificar o pacote real e o painel.

## Build e distribuição

Vite gera `dist/`; `npm run mobile:sync` recompila/sincroniza o pacote local Capacitor. Google/Apple usam `ASWebAuthenticationSession`, retorno `lendasdoflu://entrar`. Preservar iPhone-only, restrição de doações no app e assets nativos separados dos web. Publish Lovable não atualiza o binário.

Em15/10 o webhook Codemagic foi desativado e `triggering` removido do web-ci em commit separado `2c0d8646ab4410efeb0bc2147337e66771f7b489`. O workflow iOS continua separado com envio TestFlight, sem submissão automática à App Store. GitHub Actions ainda tem triggers próprios: Codemagic manual não significa que todo CI está desligado. Commits documentais usam [skip ci] para não iniciar esses checks.

Não iniciar workflow, gastar créditos, publicar ou submeter como efeito de editar documentação. Antes de release, consultar o build atual no ASC e validar login/cancelamento/saída, exclusão autorizada, imagens, rotas, atualização instalada e comportamento ao perder foco. O código de visibilidade pode encerrar partida: testar esse contrato, não prometer pausa segura sem verificação.
