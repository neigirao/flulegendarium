# Runbook de Triagem de Erros

Este runbook define como identificar, classificar e corrigir erros no **Lendas do Flu** com rastreabilidade para humanos e agentes de IA.

## 1) Classificação de severidade

- **SEV-1 (crítico):** app indisponível, erro impede jogar em massa, perda de dados.
- **SEV-2 (alto):** fluxo principal degradado (ex.: jogo não progride em um modo).
- **SEV-3 (médio):** erro com workaround simples, impacto parcial.
- **SEV-4 (baixo):** erro visual, inconsistência não bloqueante.

## 2) Checklist de triagem inicial (10 minutos)

1. Confirmar ambiente (produção, preview, local).
2. Reproduzir erro com passos mínimos.
3. Registrar:
   - rota,
   - modo de jogo,
   - usuário autenticado/guest,
   - navegador/dispositivo,
   - horário UTC.
4. Coletar evidências:
   - stack trace,
   - logs do console,
   - resposta da API/Supabase,
   - screenshot (quando visual).
5. Classificar severidade e abrir incidente.

## 3) Heurísticas por tipo de problema

### A. Erro de imagem

Verificar na ordem:
1. URL em `player.image_url` está válida?
2. Fallback em `src/utils/fallback-images` cobre o jogador?
3. Transform de imagem está compatível com bucket/política?
4. Cache (SW) está servindo asset stale?

Ações imediatas:
- invalidar cache local,
- testar URL original no navegador,
- validar políticas de storage.

### B. Erro de fluxo de jogo

Verificar:
1. seleção de jogador respeitou dificuldade,
2. estado de tentativas/vidas atualizou sem race condition,
3. transição de tela não bloqueou por condição inválida.

### C. Erro de ranking/estatísticas

Verificar:
1. payload enviado ao serviço,
2. permissões/RLS,
3. timezone e janela de agregação,
4. retries ou idempotência.

## 4) Template de incidente

```md
# Incidente: <título>

- Data/hora (UTC):
- Severidade:
- Ambiente:
- Responsável:

## Sintoma

## Impacto

## Como reproduzir
1.
2.

## Evidências
- Logs:
- Stack trace:
- Capturas:

## Causa raiz (quando houver)

## Mitigação imediata

## Correção permanente

## Testes adicionados/ajustados

## Riscos remanescentes
```

## 5) Fluxo de correção com IA (obrigatório)

Para usar IA com segurança:

1. Definir hipótese técnica (o que quebrou e por quê).
2. Pedir mudança mínima (evitar refatoração ampla em incidente).
3. Exigir diffs pequenos e justificativa por arquivo alterado.
4. Validar com checklist:
   - lint,
   - testes afetados,
   - regressão manual no fluxo principal.
5. Registrar no PR:
   - hipótese inicial,
   - resultado,
   - rollback plan.

## 6) Critérios de encerramento

Incidente só pode ser encerrado quando:

- reprodução original não ocorre mais,
- há evidência de teste/validação,
- monitoramento não aponta recorrência na janela combinada,
- documentação pertinente foi atualizada.
