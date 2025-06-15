
import { useState, useCallback, useRef, useEffect } from 'react';

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
      console.warn('⚠️ Tentativa de atualizar estado em componente desmontado prevenida');
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
        console.error('❌ Erro em operação assíncrona:', error);
      }
      throw error;
    }
  }, []);

  return { safeExecute, isMounted: () => isMountedRef.current };
};
