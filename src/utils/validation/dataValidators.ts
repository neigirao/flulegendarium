
// Utilitários para validação de dados e prevenção de erros

import { logger } from '@/utils/logger';

export interface ValidationResult<T = unknown> {
  isValid: boolean;
  error?: string;
  sanitizedData?: T;
}

// Validador de URLs de imagem
export const validateImageUrl = (url: string | null | undefined): ValidationResult<string> => {
  if (!url) {
    return {
      isValid: false,
      error: 'URL de imagem não fornecida',
      sanitizedData: '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png'
    };
  }

  try {
    new URL(url);
  } catch {
    logger.warn('URL de imagem inválida', 'VALIDATION', { url });
    return {
      isValid: false,
      error: 'URL de imagem inválida',
      sanitizedData: '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png'
    };
  }

  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const hasValidExtension = validExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  );

  if (!hasValidExtension && !url.includes('supabase') && !url.includes('lovable-uploads')) {
    logger.warn('URL não parece ser uma imagem', 'VALIDATION', { url });
    return {
      isValid: false,
      error: 'URL não parece ser uma imagem válida',
      sanitizedData: '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png'
    };
  }

  return {
    isValid: true,
    sanitizedData: url
  };
};

interface SanitizedPlayerData {
  id: string;
  name: string;
  image_url: string | null;
  position: string;
  period: string;
}

export const validatePlayerData = (player: Record<string, unknown> | null | undefined): ValidationResult<SanitizedPlayerData> => {
  if (!player) {
    return {
      isValid: false,
      error: 'Dados do jogador não fornecidos'
    };
  }

  const requiredFields = ['id', 'name'];
  const missingFields = requiredFields.filter(field => !player[field]);
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`
    };
  }

  const sanitizedPlayer: SanitizedPlayerData = {
    id: String(player.id),
    name: String(player.name).trim(),
    image_url: player.image_url ? String(player.image_url) : null,
    position: player.position ? String(player.position) : 'Não informado',
    period: player.period ? String(player.period) : 'Não informado'
  };

  return {
    isValid: true,
    sanitizedData: sanitizedPlayer
  };
};

export const validateApiResponse = (data: unknown, expectedFields: string[] = []): ValidationResult => {
  if (!data) {
    return {
      isValid: false,
      error: 'Resposta da API vazia'
    };
  }

  if (Array.isArray(data) && data.length === 0) {
    return {
      isValid: false,
      error: 'Array vazio retornado pela API'
    };
  }

  if (expectedFields.length > 0) {
    const dataToCheck = Array.isArray(data) ? data[0] : data;
    if (dataToCheck && typeof dataToCheck === 'object') {
      const missingFields = expectedFields.filter(field => !(field in (dataToCheck as Record<string, unknown>)));
      
      if (missingFields.length > 0) {
        logger.warn('Campos esperados ausentes na resposta da API', 'VALIDATION', { missingFields });
        return {
          isValid: false,
          error: `Campos esperados ausentes: ${missingFields.join(', ')}`
        };
      }
    }
  }

  return {
    isValid: true,
    sanitizedData: data
  };
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(`Tentativa ${attempt}/${maxRetries}`, 'RETRY');
      return await fn();
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Tentativa ${attempt} falhou`, 'RETRY', { error: String(error) });
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  logger.error('Todas as tentativas falharam', 'RETRY');
  throw lastError!;
};

export const sanitizeString = (str: unknown): string => {
  if (str === null || str === undefined) {
    return '';
  }
  
  if (typeof str !== 'string') {
    return String(str);
  }
  
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[<>]/g, '');
};

export const validateNumber = (value: unknown, min?: number, max?: number): ValidationResult<number> => {
  const num = Number(value);
  
  if (isNaN(num)) {
    return {
      isValid: false,
      error: 'Valor não é um número válido',
      sanitizedData: 0
    };
  }
  
  if (min !== undefined && num < min) {
    return {
      isValid: false,
      error: `Valor deve ser maior ou igual a ${min}`,
      sanitizedData: min
    };
  }
  
  if (max !== undefined && num > max) {
    return {
      isValid: false,
      error: `Valor deve ser menor ou igual a ${max}`,
      sanitizedData: max
    };
  }
  
  return {
    isValid: true,
    sanitizedData: num
  };
};
