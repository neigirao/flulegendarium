import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/utils/logger';

// Hook que previne updates de estado em componentes desmontados
export const useSafeState = <T>(initialState: T) => {
  const [state, setState] = useState<T>(initialState);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setSafeState = useCallback((newState: T | ((prevState: T) => T)) => {
    if (isMountedRef.current) {
      setState(newState);
    } else {
      logger.warn('Tentativa de atualizar estado em componente desmontado prevenida', 'SAFE_STATE');
    }
  }, []);

  return [state, setSafeState] as const;
};

// Hook para operações assíncronas seguras
export const useSafeAsync = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeExecute = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ) => {
    try {
      const result = await asyncFn();
      
      if (isMountedRef.current && onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      if (isMountedRef.current && onError) {
        onError(error as Error);
      } else if (isMountedRef.current) {
        logger.error('Erro em operação assíncrona', 'SAFE_ASYNC', error);
      }
      throw error;
    }
  }, []);

  return { safeExecute, isMounted: () => isMountedRef.current };
};
