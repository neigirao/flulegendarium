import type { DifficultyLevel } from '@/types/guess-game';
import type { JerseyYearOption } from '@/types/jersey-game';

/**
 * Configuração de distância de opções por nível de dificuldade
 * Níveis mais difíceis têm opções mais próximas
 */
const DIFFICULTY_DISTANCES: Record<DifficultyLevel, number[]> = {
  muito_facil: [4, 7, 10],    // Opções bem distantes
  facil: [3, 5, 8],           // Opções distantes
  medio: [2, 4, 6],           // Opções moderadas
  dificil: [1, 3, 5],         // Opções próximas
  muito_dificil: [1, 2, 3],   // Opções muito próximas
};

/**
 * Limites de ano válidos para o jogo
 */
const MIN_YEAR = 1902; // Fundação do Fluminense
const MAX_YEAR = new Date().getFullYear();

/**
 * Embaralha um array usando Fisher-Yates
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Gera um ano incorreto que não colida com os anos corretos
 */
function generateIncorrectYear(
  correctYears: number[],
  baseYear: number,
  distance: number,
  usedYears: Set<number>,
  direction: 'up' | 'down' | 'random'
): number {
  const attempts = 20;
  
  for (let i = 0; i < attempts; i++) {
    let year: number;
    
    if (direction === 'random') {
      const sign = Math.random() > 0.5 ? 1 : -1;
      year = baseYear + (distance * sign);
    } else if (direction === 'up') {
      year = baseYear + distance;
    } else {
      year = baseYear - distance;
    }
    
    // Ajustar variação aleatória para não ficar previsível
    year += Math.floor(Math.random() * 2) - 1;
    
    // Verificar se está dentro dos limites e não é um ano correto ou já usado
    if (
      year >= MIN_YEAR &&
      year <= MAX_YEAR &&
      !correctYears.includes(year) &&
      !usedYears.has(year)
    ) {
      return year;
    }
    
    // Tentar direção oposta
    if (direction === 'up') {
      year = baseYear - distance;
    } else if (direction === 'down') {
      year = baseYear + distance;
    }
    
    if (
      year >= MIN_YEAR &&
      year <= MAX_YEAR &&
      !correctYears.includes(year) &&
      !usedYears.has(year)
    ) {
      return year;
    }
  }
  
  // Fallback: gerar ano próximo que seja válido
  for (let offset = 1; offset <= 20; offset++) {
    const yearUp = baseYear + offset;
    const yearDown = baseYear - offset;
    
    if (
      yearUp <= MAX_YEAR &&
      !correctYears.includes(yearUp) &&
      !usedYears.has(yearUp)
    ) {
      return yearUp;
    }
    
    if (
      yearDown >= MIN_YEAR &&
      !correctYears.includes(yearDown) &&
      !usedYears.has(yearDown)
    ) {
      return yearDown;
    }
  }
  
  // Último fallback
  return baseYear + 5;
}

/**
 * Gera 4 opções de ano para múltipla escolha
 * 
 * @param correctYears Array de anos corretos (qualquer um é aceito)
 * @param difficulty Nível de dificuldade do jogo
 * @returns Array de 4 opções embaralhadas
 */
export function generateYearOptions(
  correctYears: number[],
  difficulty: DifficultyLevel = 'medio'
): JerseyYearOption[] {
  // Escolher um ano correto aleatório para usar como base
  const correctYear = correctYears[Math.floor(Math.random() * correctYears.length)];
  
  // Obter distâncias baseadas na dificuldade
  const distances = DIFFICULTY_DISTANCES[difficulty] || DIFFICULTY_DISTANCES.medio;
  
  // Gerar anos incorretos
  const usedYears = new Set<number>(correctYears);
  const incorrectYears: number[] = [];
  
  const directions: ('up' | 'down' | 'random')[] = ['up', 'down', 'random'];
  
  for (let i = 0; i < 3; i++) {
    const distance = distances[i];
    const direction = directions[i];
    
    const incorrectYear = generateIncorrectYear(
      correctYears,
      correctYear,
      distance,
      usedYears,
      direction
    );
    
    usedYears.add(incorrectYear);
    incorrectYears.push(incorrectYear);
  }
  
  // Criar opções
  const options: JerseyYearOption[] = [
    { year: correctYear, isCorrect: true, position: 0 },
    { year: incorrectYears[0], isCorrect: false, position: 1 },
    { year: incorrectYears[1], isCorrect: false, position: 2 },
    { year: incorrectYears[2], isCorrect: false, position: 3 },
  ];
  
  // Embaralhar e atribuir novas posições
  const shuffled = shuffleArray(options);
  
  return shuffled.map((option, index) => ({
    ...option,
    position: index,
  }));
}

/**
 * Verifica se um ano selecionado está correto
 */
export function checkYearOption(
  selectedYear: number,
  correctYears: number[]
): boolean {
  return correctYears.includes(selectedYear);
}
