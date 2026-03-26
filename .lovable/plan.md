

# Google Sign-In + Google One Tap

## Credenciais (fornecidas pelo usuário)

- **Client ID**: `1079382547248-ak86i9vrbfjdebfja205qgrpfsuo43iq.apps.googleusercontent.com`
- **Client Secret**: `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`

## Pré-requisito: Configuração no Supabase Dashboard

O usuário deve acessar o Supabase Dashboard (Auth → Providers → Google) e:
1. Habilitar o provider Google
2. Colar o Client ID e Client Secret acima
3. Verificar que o callback URL `https://hafxruwnggitvtyngedy.supabase.co/auth/v1/callback` está nas Authorized Redirect URLs do Google Cloud Console
4. Verificar que `https://flulegendarium.lovable.app` e `https://id-preview--2d18f90c-a6cd-4fc2-913d-b76eb4df6c17.lovable.app` estão nas Authorized JavaScript Origins

## Implementação

### 1. Fix build error — `UnifiedPlayerImage.tsx` (linha 253)

`window.setTimeout` → `globalThis.setTimeout` para evitar erro TS18048.

### 2. Adicionar `VITE_GOOGLE_CLIENT_ID` ao `.env`

```
VITE_GOOGLE_CLIENT_ID="1079382547248-ak86i9vrbfjdebfja205qgrpfsuo43iq.apps.googleusercontent.com"
```

### 3. Criar hook `useGoogleOneTap` — `src/hooks/useGoogleOneTap.ts`

- Carrega o script `https://accounts.google.com/gsi/client` via `requestIdleCallback`
- Inicializa `google.accounts.id.initialize` com:
  - `client_id` do env
  - `auto_select: false`
  - `context: 'signin'`
  - `cancel_on_tap_outside: true`
- Callback: chama `supabase.auth.signInWithIdToken({ provider: 'google', token: credential })`
- Chama `google.accounts.id.prompt()` — o Google controla posicionamento (canto superior direito desktop, bottom sheet mobile) e cooldown exponencial automaticamente
- Só ativa se usuário NÃO está logado e `VITE_GOOGLE_CLIENT_ID` existe
- Tracking via `useAnalytics`: `one_tap_displayed`, `one_tap_completed`, `one_tap_skipped`, `one_tap_error`

### 4. Botão "Entrar com Google" na página Auth — `src/pages/Auth.tsx`

- Adicionar divider "ou continue com" + botão Google estilizado (ícone Google + texto) entre os tabs e o link "Jogar como convidado" (após linha 321, antes de linha 324)
- O botão chama `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/selecionar-modo-jogo' } })`

### 5. Botão "Entrar com Google" no `GameAuthSelection.tsx`

- Adicionar botão Google no card de "FAZER LOGIN" (após o botão "Login com Email", linha 77)
- Mesmo flow OAuth do passo 4

### 6. Montar One Tap global — `src/components/ux/UXProvider.tsx`

- Importar e chamar `useGoogleOneTap()` dentro do `UXProvider`
- O hook só exibe o prompt se o usuário não está autenticado

## Arquivos afetados

| Ação | Arquivo |
|------|---------|
| Fix | `src/components/player-image/UnifiedPlayerImage.tsx` |
| Editar | `.env` |
| Criar | `src/hooks/useGoogleOneTap.ts` |
| Editar | `src/pages/Auth.tsx` |
| Editar | `src/components/auth/GameAuthSelection.tsx` |
| Editar | `src/components/ux/UXProvider.tsx` |

## Nota de segurança

O Client ID é uma chave pública (visível no HTML) — seguro para o frontend. O Client Secret NÃO vai no código — fica apenas no Supabase Dashboard.

