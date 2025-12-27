import type { JerseyYearOption } from '@/types/jersey-game';

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
 * Gera uma distância aleatória entre 1 e 3 anos
 */
function getRandomDistance(): number {
  return Math.floor(Math.random() * 3) + 1; // 1, 2 ou 3
}

/**
 * Gera um ano incorreto que não colida com os anos corretos
 */
function generateIncorrectYear(
  correctYears: number[],
  baseYear: number,
  usedYears: Set<number>
): number {
  const attempts = 20;
  
  for (let i = 0; i < attempts; i++) {
    const distance = getRandomDistance();
    const sign = Math.random() > 0.5 ? 1 : -1;
    const year = baseYear + (distance * sign);
    
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
    const yearOpposite = baseYear - (distance * sign);
    if (
      yearOpposite >= MIN_YEAR &&
      yearOpposite <= MAX_YEAR &&
      !correctYears.includes(yearOpposite) &&
      !usedYears.has(yearOpposite)
    ) {
      return yearOpposite;
    }
  }
  
  // Fallback: gerar ano próximo que seja válido
  for (let offset = 1; offset <= 10; offset++) {
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
  return baseYear + 2;
}

/**
 * Gera 3 opções de ano para múltipla escolha
 * Cada opção incorreta tem de 1 a 3 anos de diferença (randomizado)
 * 
 * @param correctYears Array de anos corretos (qualquer um é aceito)
 * @returns Array de 3 opções embaralhadas
 */
export function generateYearOptions(
  correctYears: number[]
): JerseyYearOption[] {
  // Escolher um ano correto aleatório para usar como base
  const correctYear = correctYears[Math.floor(Math.random() * correctYears.length)];
  
  // Gerar 2 anos incorretos
  const usedYears = new Set<number>(correctYears);
  const incorrectYears: number[] = [];
  
  for (let i = 0; i < 2; i++) {
    const incorrectYear = generateIncorrectYear(
      correctYears,
      correctYear,
      usedYears
    );
    
    usedYears.add(incorrectYear);
    incorrectYears.push(incorrectYear);
  }
  
  // Criar opções (1 correta + 2 incorretas = 3 total)
  const options: JerseyYearOption[] = [
    { year: correctYear, isCorrect: true, position: 0 },
    { year: incorrectYears[0], isCorrect: false, position: 1 },
    { year: incorrectYears[1], isCorrect: false, position: 2 },
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
