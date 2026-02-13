

# Plano: Corrigir teste E2E "should allow submitting a guess in decade mode"

## Problema

O teste falha na linha 157 porque o overlay `guest-name-form` (div com `fixed inset-0 z-50`) intercepta os cliques no botao de confirmar palpite. Mesmo apos `startGameWithName` ter sido chamado, o formulario de nome reaparece ou nao e totalmente removido do DOM, bloqueando a interacao com o `GuessConfirmDialog`.

## Causa Raiz

1. O `closeAllOverlays` (linha 147) e chamado antes do submit, mas nao e chamado novamente antes de clicar no botao de confirmacao (linha 157)
2. O `confirmButton.click()` na linha 157 usa click normal (sem `force: true`), enquanto o `safeClick` usado em outros lugares usa `{ force: true }` justamente para evitar esse tipo de bloqueio
3. O seletor `getByRole('button', { name: /confirmar|sim/i })` pode encontrar o botao correto, mas o overlay do guest-name-form impede o click

## Solucao

Alterar o teste `should allow submitting a guess in decade mode` em `e2e/gameplay-decada.spec.ts` para:

1. Chamar `closeAllOverlays` antes de tentar clicar no botao de confirmacao
2. Usar `{ force: true }` no click do botao de confirmacao, assim como o `safeClick` faz
3. Buscar o botao de confirmacao pelo `data-testid` mais especifico do `GuessConfirmDialog` em vez de usar `getByRole` generico

## Mudancas

### Arquivo: `e2e/gameplay-decada.spec.ts` (linhas 147-158)

Substituir:
```typescript
await closeAllOverlays(page);

const submitButton = page.getByTestId('guess-submit-btn');
if (await submitButton.isVisible({ timeout: 5000 }).catch(() => false)) {
  await safeClick(page, submitButton);

  // Confirmar dialog se aparecer
  await page.waitForTimeout(1000);
  const confirmButton = page.getByRole('button', { name: /confirmar|sim/i });
  if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmButton.click();
  }
```

Por:
```typescript
await closeAllOverlays(page);

const submitButton = page.getByTestId('guess-submit-btn');
if (await submitButton.isVisible({ timeout: 5000 }).catch(() => false)) {
  await safeClick(page, submitButton);

  // Confirmar dialog se aparecer
  await page.waitForTimeout(1000);
  await closeAllOverlays(page);
  const confirmButton = page.getByRole('button', { name: /confirmar|sim/i });
  if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmButton.click({ force: true });
  }
```

Essas duas mudancas (chamar `closeAllOverlays` novamente e usar `force: true`) garantem que qualquer overlay remanescente seja fechado e que o click no botao de confirmacao nao seja bloqueado.

