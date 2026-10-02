# Lendas do Flu no iOS - base Capacitor

O identificador `com.neigirao.lendasdoflu` foi aprovado por Nei em 25/09/2026. A base embala o build local do Vite em `ios/`; não muda o site. Mudar o identificador depois da publicação cria outro app, não uma atualização.

## Build local (Mac)

Node 22+, Xcode compatível com Capacitor 8:

```sh
npm ci
npm run mobile:sync
xcodebuild -project ios/App/App.xcodeproj -scheme App \
  -configuration Debug -destination 'generic/platform=iOS Simulator' \
  CODE_SIGNING_ALLOWED=NO build
```

`mobile:sync` recompila o site (`dist/`) e sincroniza os arquivos no projeto iOS. `ios/App/App/public/`, configuração JSON gerada, builds e dados de usuário do Xcode não são versionados. O workflow GitHub iOS executa manualmente para simulador. `codemagic.yaml` inclui workflow de distribuição com assinatura e envio ao TestFlight (não submissão automática ao App Store); aguardar a primeira build verde antes de automatizar. Precisa de macOS/Xcode para validar a compilação. Nunca incluir certificados, perfis ou chaves no repositório.

## Antes de chamar de app pronto

- Google/Apple têm caminho nativo implementado: `src/lib/entrar-nativo.ts` + `ios/App/App/LoginNativoPlugin.swift` usam `ASWebAuthenticationSession`. O retorno é `lendasdoflu://entrar`; registrar esse endereço no Supabase e manter o esquema `lendasdoflu` no Info.plist. O parser aceita tokens implícitos ou código PKCE; usa `setSession`/`exchangeCodeForSession`. Implementação não substitui teste em iPhone real nem confirmação da configuração de cada provedor.
- `use-tab-visibility` encerra a partida ao perder o foco; uma chamada, navegador de autenticação ou troca de app causará Game Over. Definir pausa/reentrada segura e testar antes do lançamento.
- O web app tem `viewport-fit=cover` e classes `safe-area-*`; validar visualmente em iPhone com notch/Dynamic Island. `navigator.vibrate` não equivale a haptics nativo.
- Substituir ícone e splash padrão do Capacitor por arte própria aprovada; validar direitos de imagem, rótulo e apresentação no aparelho.
- Testar login, Supabase, imagens, rotas ao reabrir, modo offline/rede, performance e acessibilidade em iPhone real. O jogo depende de rede para conteúdo.
- Assinatura, conta Apple Developer, TestFlight e App Store exigem autorização própria. Compilar para simulador não cria uma publicação.

Nenhuma migration, edge function nem auth admin faz parte desta base. Android virá depois.


## Recursos recentes e limites

A demo de convidado é uma rodada por sessão de WebView/navegador. Após concluir, pede login; a demo não salva ranking. Eventos de autenticação distinguem web/nativo sem enviar tokens ou PII. Doações ficam ocultas no build nativo. Ícone/splash e o bootstrap nativo estão no repo; validar no aparelho antes de afirmar qualidade ou disponibilidade na loja.

Publicar o site não recompila o binário instalado. `npm run mobile:sync` gera assets; distribuição iOS exige build e assinatura separados. Não incluir chaves Apple/certificados nos arquivos de ambiente do cliente.
