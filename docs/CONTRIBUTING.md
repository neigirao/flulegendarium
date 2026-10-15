# Guia de Contribuição

Obrigado por contribuir com o Lendas do Flu.

Leia primeiro [CURRENT_STATE.md](CURRENT_STATE.md) para gates de exclusão, banco compartilhado e pipelines. Documentos de auditoria de março são históricos, não estado de implantação.

## 1. Princípios

- Corrigir com segurança antes de otimizar.
- Preferir mudanças pequenas e revisáveis.
- Atualizar documentação junto com código.
- Não ocultar erro: registrar contexto e evidências.

## 2. Setup local

```bash
npm install
npm run dev
```

## 3. Fluxo de trabalho

1. Criar branch (`feature/*`, `fix/*`, `docs/*`, `refactor/*`).
2. Implementar mudança mínima para resolver um problema claro.
3. Executar validações locais.
4. Abrir PR com contexto técnico e funcional.

## 4. Validações mínimas

Antes de abrir PR:

```bash
npm run lint
```

Quando houver alteração de lógica crítica, incluir também testes unitários/e2e relacionados.

## 5. Quando a mudança envolve IA

No PR, adicione obrigatoriamente:

- hipótese inicial,
- resumo do que a IA sugeriu,
- o que foi aceito/rejeitado,
- riscos identificados,
- plano de rollback.

## 6. Template de PR

```md
## O que mudou

## Por que mudou

## Hipótese técnica (se houver IA)

## Riscos
- [ ] baixo
- [ ] médio
- [ ] alto

## Validação
- [ ] npm run lint
- [ ] teste(s) afetado(s)
- [ ] validação manual do fluxo

## Rollback
```

## 7. Convenções essenciais

- TypeScript estrito: evitar `any` sem justificativa.
- Componentes sem regra de negócio complexa.
- Serviços com entrada/saída explícita e validada.
- Logs com contexto útil (rota, modo, ID da sessão quando existir).

## 8. Documentação obrigatória

Atualize docs quando alterar:

- fluxo de jogo,
- contrato de serviço/schema,
- processo de triagem/observabilidade,
- onboarding de desenvolvimento.

Arquivos mais comuns:

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/AI_GUIDE.md`
- `docs/ERROR_TRIAGE.md`

## Operação sem efeitos colaterais

Codemagic web-ci é manual e o webhook está desligado (15/10). GitHub Actions é separado e ainda tem triggers push/PR. Não disparar checks/builds/publish/deploy por uma atualização documental. Migrations e funções precisam de revisão e autorização próprias; não presumir que foram aplicadas.

Não testar exclusão com conta ativa/Apple Review. Exigir backup verificado e autorização para uma conta descartável nomeada. A exclusão do Lendas mantém Auth porque o projeto é compartilhado; nunca ampliar para `auth.users` por conveniência. Nenhum segredo real, payload de login ou dado privado deve entrar em docs/logs.
