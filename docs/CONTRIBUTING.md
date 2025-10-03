# 🤝 Guia de Contribuição - Lendas do Flu

Obrigado por considerar contribuir com o projeto Lendas do Flu! Este guia ajudará você a entender como contribuir de forma efetiva.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Começar](#como-começar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Padrões de Código](#padrões-de-código)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Testes](#testes)
- [Documentação](#documentação)
- [Pull Requests](#pull-requests)

## Código de Conduta

Este projeto adota um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e inclusivo para todos.

## Como Começar

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/SEU-USUARIO/lendas-do-flu.git
cd lendas-do-flu
```

### 2. Instalação

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local

# Configurar Supabase
# Adicione suas credenciais no .env.local
```

### 3. Rodar Localmente

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Em outro terminal, rodar Supabase local (opcional)
npx supabase start
```

## Estrutura do Projeto

```
src/
├── components/     # Componentes React
├── hooks/          # Hooks customizados
├── services/       # Serviços de API
├── utils/          # Utilitários
├── types/          # Tipos TypeScript
├── stores/         # Zustand stores
└── pages/          # Páginas/rotas
```

### Convenções de Nomenclatura

- **Componentes**: PascalCase (`PlayerCard.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useGameMetrics.ts`)
- **Utilitários**: camelCase (`nameProcessor.ts`)
- **Tipos**: PascalCase (`GameState`, `Player`)
- **Constantes**: UPPER_SNAKE_CASE (`DIFFICULTY_LEVELS`)

## Padrões de Código

### TypeScript

✅ **BOM:**
```typescript
interface PlayerProps {
  player: Player;
  onSelect: (id: string) => void;
}

export const PlayerCard = ({ player, onSelect }: PlayerProps) => {
  // ...
};
```

❌ **RUIM:**
```typescript
export const PlayerCard = (props: any) => {
  // ...
};
```

### React Components

✅ **BOM:**
```typescript
/**
 * Card que exibe informações do jogador.
 * 
 * @param player - Dados do jogador
 * @param onSelect - Callback ao selecionar
 */
export const PlayerCard = memo(({ player, onSelect }: PlayerProps) => {
  const handleClick = useCallback(() => {
    onSelect(player.id);
  }, [player.id, onSelect]);
  
  return (
    <Card onClick={handleClick}>
      {/* ... */}
    </Card>
  );
});
```

❌ **RUIM:**
```typescript
export const PlayerCard = (props) => {
  return <Card onClick={() => props.onSelect(props.player.id)} />;
};
```

### Hooks Customizados

✅ **BOM:**
```typescript
/**
 * Hook para gerenciar seleção de jogadores.
 * 
 * @param players - Lista de jogadores disponíveis
 * @returns Objeto com jogador atual e funções de controle
 */
export const usePlayerSelection = (players: Player[]) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  
  const selectRandom = useCallback(() => {
    // Lógica de seleção
  }, [players]);
  
  return { currentPlayer, selectRandom };
};
```

❌ **RUIM:**
```typescript
export const usePlayerSelection = (players) => {
  const [currentPlayer, setCurrentPlayer] = useState(null);
  
  const selectRandom = () => {
    // Lógica
  };
  
  return { currentPlayer, selectRandom };
};
```

### Styling com Tailwind

✅ **BOM:**
```tsx
<div className="flex items-center justify-between p-4 bg-card text-card-foreground">
  <h2 className="text-2xl font-bold">Título</h2>
</div>
```

❌ **RUIM:**
```tsx
<div className="flex items-center justify-between p-4" style={{backgroundColor: '#fff'}}>
  <h2 style={{fontSize: '24px', fontWeight: 'bold'}}>Título</h2>
</div>
```

**Sempre use tokens semânticos do design system!**

## Processo de Desenvolvimento

### 1. Criar Branch

```bash
# Nomenclatura: tipo/descrição-curta
git checkout -b feature/adicionar-modo-campeonato
git checkout -b fix/corrigir-timer-bug
git checkout -b docs/atualizar-readme
```

**Tipos de branch:**
- `feature/`: Nova funcionalidade
- `fix/`: Correção de bug
- `docs/`: Documentação
- `refactor/`: Refatoração de código
- `perf/`: Melhoria de performance
- `test/`: Adição/correção de testes

### 2. Desenvolver

```bash
# Faça commits atômicos e descritivos
git add .
git commit -m "feat: adicionar filtro por posição no quiz"
```

**Formato de commit (Conventional Commits):**
```
tipo(escopo): descrição curta

[corpo opcional]

[rodapé opcional]
```

**Exemplos:**
```
feat(game): adicionar sistema de power-ups
fix(timer): corrigir timer não pausando
docs(readme): atualizar instruções de instalação
refactor(hooks): consolidar lógica de seleção de jogadores
perf(images): implementar lazy loading
```

### 3. Manter Atualizado

```bash
# Sincronizar com upstream
git remote add upstream https://github.com/REPO-ORIGINAL/lendas-do-flu.git
git fetch upstream
git rebase upstream/main
```

## Testes

### Estrutura de Testes

```
src/
├── components/
│   └── PlayerCard/
│       ├── PlayerCard.tsx
│       └── PlayerCard.test.tsx
├── hooks/
│   └── usePlayerSelection/
│       ├── usePlayerSelection.ts
│       └── usePlayerSelection.test.ts
└── utils/
    └── nameProcessor/
        ├── nameProcessor.ts
        └── nameProcessor.test.ts
```

### Exemplo de Teste

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerCard } from './PlayerCard';

describe('PlayerCard', () => {
  const mockPlayer = {
    id: '1',
    name: 'Fred',
    position: 'Atacante',
    image_url: '/fred.jpg'
  };
  
  it('deve renderizar o nome do jogador', () => {
    render(<PlayerCard player={mockPlayer} onSelect={() => {}} />);
    expect(screen.getByText('Fred')).toBeInTheDocument();
  });
  
  it('deve chamar onSelect ao clicar', () => {
    const onSelect = vi.fn();
    render(<PlayerCard player={mockPlayer} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

### Rodar Testes

```bash
# Todos os testes
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Documentação

### JSDoc Obrigatório

Todos os arquivos públicos devem ter documentação JSDoc:

```typescript
/**
 * Processa e valida o nome do jogador.
 * 
 * Remove acentos, normaliza espaços e converte para minúsculas.
 * 
 * @param name - Nome do jogador a ser processado
 * @returns Nome normalizado
 * 
 * @example
 * ```typescript
 * const normalized = processPlayerName("  José  Carlos  ");
 * // Retorna: "jose carlos"
 * ```
 */
export const processPlayerName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
};
```

### README de Funcionalidades

Ao adicionar features complexas, crie um README:

```markdown
# Feature: Sistema de Power-Ups

## Descrição
Sistema que permite ao jogador usar power-ups durante o jogo.

## Uso
\`\`\`typescript
const { usePowerUp, availablePowerUps } = usePowerUps();
\`\`\`

## Tipos de Power-Ups
- **Dica**: Revela uma letra do nome
- **Tempo Extra**: +15 segundos no timer
- **50/50**: Remove metade das opções
```

## Pull Requests

### Checklist Antes de Abrir PR

- [ ] Código segue os padrões do projeto
- [ ] Todos os testes passam
- [ ] Adicionei testes para novas funcionalidades
- [ ] Documentação está atualizada
- [ ] Commit messages seguem Conventional Commits
- [ ] Não há conflitos com a branch principal
- [ ] Testei localmente

### Template de PR

```markdown
## Descrição
[Descreva as mudanças feitas]

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

## Screenshots
[Se aplicável]

## Checklist
- [ ] Código testado localmente
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
```

### Processo de Review

1. **Automated checks**: CI/CD roda testes e linting
2. **Code review**: Mantenedores revisam o código
3. **Discussão**: Feedback e sugestões
4. **Aprovação**: Após ajustes necessários
5. **Merge**: Mantenedor faz merge na main

## Áreas que Precisam de Ajuda

### 🔴 Alta Prioridade
- [ ] Testes E2E com Playwright
- [ ] Melhorias de acessibilidade
- [ ] Otimização de bundle size

### 🟡 Média Prioridade
- [ ] Suporte a i18n (inglês, espanhol)
- [ ] Dark mode melhorado
- [ ] Mais conquistas (achievements)

### 🟢 Baixa Prioridade
- [ ] Novos modos de jogo
- [ ] Customização de avatar
- [ ] Sistema de amigos

## Recursos

- **Documentação**: [docs/](./docs/)
- **Arquitetura**: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Fluxo do Jogo**: [docs/GAME_FLOW.md](./docs/GAME_FLOW.md)
- **Discord**: [Link do Discord]
- **Issues**: [GitHub Issues](https://github.com/REPO/issues)

## Dúvidas?

Abra uma [issue](https://github.com/REPO/issues) com a tag `question` ou entre em contato no Discord.

Obrigado por contribuir! 🎉⚽️
