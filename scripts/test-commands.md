
# Comandos de Teste

Adicione estes scripts ao seu package.json:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

## Como usar:

- `npm test` - Executa testes unitários em modo watch
- `npm run test:run` - Executa testes unitários uma vez
- `npm run test:coverage` - Executa testes com cobertura
- `npm run test:e2e` - Executa testes E2E
- `npm run test:e2e:ui` - Executa testes E2E com interface gráfica
