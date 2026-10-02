# 013 - Boas práticas cruzadas dos apps

Data: 02/10/2026. Lendas permanece em português por decisão de produto.

## Aprendizados aplicados nesta semana

- Login social apenas: Google e Apple tanto na web quanto no Capacitor. Redirecionamento nativo usa o fluxo próprio; não trocar por origin do navegador.
- Uma rodada de visitante antes de pedir conta. Métricas de início, erro e sucesso de autenticação.
- Login na primeira tela, antes da chamada principal. Respeitar safe area sem sobrescrever o espaço do cabeçalho fixo.
- Arte oficial Apple incorporada ao build e G oficial Google com Google Sans; nenhuma dependência de CDN para a arte no login.
- Botões com alvo mínimo de 44px. Links de voltar nas páginas legais também.
- Rótulos pequenos com piso de 12px; verde/grená para textos sobre fundo claro, não usar accent branco como texto.
- Rotas /termos, /privacidade e /suporte públicas. 404 em português. /ranking redireciona a /estatisticas.
- Sentry apenas erros: sem browser tracing, replay ou dados pessoais padrão; remover IP explícito do evento. GA4 com Signals e personalização de anúncios desligados no código. Sem Hotjar/AdSense.
- Imagens fora da primeira tela podem ser lazy/async; não atrasar imagens de marca ou LCP.
- Docs acompanham o código e distinguem main de produção. Web depende do publish do dono; iOS empacota o site e precisa de novo build.

## Limites da varredura

Não comprova ausência de IP na infraestrutura do Sentry. Não altera controles do servidor ou do painel GA4. Exclusão de conta não foi encontrada na main: política continua informando solicitação por email; implementação exige revisão separada do banco compartilhado. Telas autenticadas e hardware iOS não foram testados nesta rodada. Labels e touch targets de telas internas exigem teste logado antes de um selo de conformidade total.
