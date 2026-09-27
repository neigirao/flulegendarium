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

`mobile:sync` recompila o site (`dist/`) e sincroniza os arquivos no projeto iOS. `ios/App/App/public/`, configuração JSON gerada, builds e dados de usuário do Xcode não são versionados. O workflow iOS só executa manualmente e compila para simulador sem assinar nem publicar; aguardar a primeira build verde antes de automatizar. Precisa de macOS/Xcode para validar a compilação. Nunca incluir certificados, perfis ou chaves no repositório.

## Antes de chamar de app pronto

- OAuth Google na web usa `redirectTo: window.location.origin`; no WebView a origem é `capacitor://localhost`. Configurar `ASWebAuthenticationSession`, deep link próprio, URL permitida no Supabase e retorno para a sessão, testando o `flowType` real (implicit ou PKCE). O Google One Tap via script web precisa ser desativado ou adaptado. Também rever redirects de confirmação de conta e redefinição de senha. Nada disso está implementado nesta base.
- `use-tab-visibility` encerra a partida ao perder o foco; uma chamada, navegador de autenticação ou troca de app causará Game Over. Definir pausa/reentrada segura e testar antes do lançamento.
- O web app tem `viewport-fit=cover` e classes `safe-area-*`; validar visualmente em iPhone com notch/Dynamic Island. `navigator.vibrate` não equivale a haptics nativo.
- Substituir ícone e splash padrão do Capacitor por arte própria aprovada; validar direitos de imagem, rótulo e apresentação no aparelho.
- Testar login, Supabase, imagens, rotas ao reabrir, modo offline/rede, performance e acessibilidade em iPhone real. O jogo depende de rede para conteúdo.
- Assinatura, conta Apple Developer, TestFlight e App Store exigem autorização própria. Compilar para simulador não cria uma publicação.

Nenhuma migration, edge function nem auth admin faz parte desta base. Android virá depois.
