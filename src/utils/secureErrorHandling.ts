/**
 * Secure error handling utilities to prevent information disclosure
 */

// Generic user-friendly error messages
const GENERIC_ERRORS = {
  network: 'Erro de conexão. Verifique sua internet e tente novamente.',
  authentication: 'Erro de autenticação. Verifique suas credenciais.',
  authorization: 'Acesso negado. Você não tem permissão para esta ação.',
  validation: 'Dados inválidos. Verifique as informações fornecidas.',
  notFound: 'Recurso não encontrado.',
  server: 'Erro interno. Tente novamente em alguns instantes.',
  unknown: 'Erro inesperado. Tente novamente.'
};

/**
 * Sanitizes error messages for user display
 * @param error - The error object or message
 * @param context - Optional context for logging
 * @returns User-friendly error message
 */
export const sanitizeError = (error: any, context?: string): string => {
  // Log the actual error for debugging (server-side only in production)
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error in ${context || 'application'}:`, error);
  }

  // Handle common error types
  if (error?.code === 'PGRST116') {
    return GENERIC_ERRORS.notFound;
  }
  
  if (error?.message?.includes('auth')) {
    return GENERIC_ERRORS.authentication;
  }
  
  if (error?.message?.includes('permission') || error?.message?.includes('access')) {
    return GENERIC_ERRORS.authorization;
  }
  
  if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    return GENERIC_ERRORS.network;
  }
  
  if (error?.message?.includes('validation')) {
    return GENERIC_ERRORS.validation;
  }

  // Default to generic server error
  return GENERIC_ERRORS.server;
};

/**
 * Creates a secure error object for API responses
 * @param error - The original error
 * @param statusCode - HTTP status code
 * @returns Sanitized error response
 */
export const createSecureErrorResponse = (error: any, statusCode: number = 500) => {
  return {
    error: true,
    message: sanitizeError(error),
    statusCode,
    // Only include error details in development
    ...(process.env.NODE_ENV === 'development' && { details: error?.message })
  };
};

/**
 * Validates and sanitizes user input to prevent injection attacks
 * @param input - User input string
 * @param maxLength - Maximum allowed length
 * @returns Sanitized input
 */
export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};