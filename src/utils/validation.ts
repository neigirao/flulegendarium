import { z, ZodError, ZodSchema, ZodRawShape } from 'zod';
import { logger } from './logger';

/**
 * Resultado da validação
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
  message?: string;
}

/**
 * Opções de validação
 */
export interface ValidationOptions {
  /**
   * Se deve logar erros de validação
   */
  logErrors?: boolean;
  /**
   * Contexto adicional para logging
   */
  context?: string;
  /**
   * Se deve fazer sanitização dos dados antes da validação
   */
  sanitize?: boolean;
}

/**
 * Valida dados usando um schema Zod
 */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown,
  options: ValidationOptions = {}
): ValidationResult<T> {
  const { logErrors = true, context = 'Validation', sanitize = false } = options;

  try {
    // Sanitiza dados se necessário
    const dataToValidate = sanitize ? sanitizeData(data) : data;
    
    // Valida os dados
    const validatedData = schema.parse(dataToValidate);
    
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = formatZodErrors(error);
      
      if (logErrors) {
        logger.warn(`[${context}] Erro de validação: ${JSON.stringify(errors)}`);
      }
      
      return {
        success: false,
        errors,
        message: 'Dados inválidos',
      };
    }
    
    // Erro inesperado
    if (logErrors) {
      logger.error(`[${context}] Erro inesperado na validação: ${String(error)}`);
    }
    
    return {
      success: false,
      message: 'Erro ao validar dados',
    };
  }
}

/**
 * Valida dados de forma assíncrona
 */
export async function validateAsync<T>(
  schema: ZodSchema<T>,
  data: unknown,
  options: ValidationOptions = {}
): Promise<ValidationResult<T>> {
  const { logErrors = true, context = 'Validation', sanitize = false } = options;

  try {
    const dataToValidate = sanitize ? sanitizeData(data) : data;
    const validatedData = await schema.parseAsync(dataToValidate);
    
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = formatZodErrors(error);
      
      if (logErrors) {
        logger.warn(`[${context}] Erro de validação assíncrona: ${JSON.stringify(errors)}`);
      }
      
      return {
        success: false,
        errors,
        message: 'Dados inválidos',
      };
    }
    
    if (logErrors) {
      logger.error(`[${context}] Erro inesperado na validação assíncrona: ${String(error)}`);
    }
    
    return {
      success: false,
      message: 'Erro ao validar dados',
    };
  }
}

/**
 * Valida apenas se os dados são válidos (retorna boolean)
 */
export function isValid<T>(schema: ZodSchema<T>, data: unknown): boolean {
  try {
    schema.parse(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida dados com schema parcial (todos os campos opcionais)
 */
export function validatePartial<T extends z.ZodObject<ZodRawShape>>(
  schema: T,
  data: unknown,
  options: ValidationOptions = {}
): ValidationResult<Partial<z.infer<T>>> {
  return validate(schema.partial(), data, options);
}

/**
 * Formata erros do Zod em um objeto mais amigável
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    const message = err.message;
    
    if (!formatted[path]) {
      formatted[path] = [];
    }
    
    formatted[path].push(message);
  });
  
  return formatted;
}

/**
 * Sanitiza dados básicos (trim strings, remove nulls vazios, etc.)
 */
function sanitizeData(data: unknown): unknown {
  if (typeof data === 'string') {
    return data.trim();
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  
  if (data !== null && typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Remove valores undefined e null vazios
      if (value !== undefined) {
        sanitized[key] = sanitizeData(value);
      }
    }
    
    return sanitized;
  }
  
  return data;
}

/**
 * Sanitiza dados para logging (remove informações sensíveis)
 */
function sanitizeForLogging(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey'];
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '***';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Cria um validador reutilizável
 */
export function createValidator<T>(
  schema: ZodSchema<T>,
  defaultOptions: ValidationOptions = {}
) {
  return (data: unknown, options?: ValidationOptions): ValidationResult<T> => {
    return validate(schema, data, { ...defaultOptions, ...options });
  };
}

/**
 * Helper para validar resposta de API do Supabase
 */
export function validateSupabaseResponse<T>(
  schema: ZodSchema<T>,
  response: { data: unknown; error: unknown }
): ValidationResult<T> {
  if (response.error) {
    logger.error(`Erro na resposta do Supabase: ${JSON.stringify(response.error)}`);
    return {
      success: false,
      message: 'Erro ao buscar dados',
    };
  }
  
  return validate(schema, response.data, {
    context: 'Supabase Response',
    logErrors: true,
  });
}
