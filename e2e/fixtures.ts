import { test as base, expect } from '@playwright/test';

/** Browser-only test session. No real user's credentials or writes to Auth. */
export const test = base.extend({
  page: async ({ page }, applyFixture) => {
    await page.addInitScript(() => {
      const key = 'sb-hafxruwnggitvtyngedy-auth-token';
      const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZnhydXduZ2dpdHZ0eW5nZWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNDE0NTIsImV4cCI6MjA1NTkxNzQ1Mn0.gWlNlVeJyISEIjjfLN46hrZ7OZSKd_6rQFJ2LnUkVDw';
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({
        access_token: anon, refresh_token: 'e2e-not-a-real-refresh-token', token_type: 'bearer',
        expires_in: 3600, expires_at: Math.floor(Date.now()/1000) + 3600,
        user: { id:'00000000-0000-4000-8000-000000000001', aud:'authenticated', role:'authenticated',
          email:'e2e@example.invalid', app_metadata:{provider:'email',providers:['email']},
          user_metadata:{full_name:'Jogador Teste'}, created_at:'2026-01-01T00:00:00Z' }
      }));
    });
    await applyFixture(page);
  },
});
export { expect };
