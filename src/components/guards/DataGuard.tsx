
import { ReactNode, useMemo } from 'react';
import { validateApiResponse, validatePlayerData } from '@/utils/validation/dataValidators';
import { LoadingCard } from '@/components/ui/loading-states';
import { ErrorState } from '@/components/ui/error-states';

interface DataGuardProps {
  data: any;
  loading?: boolean;
  error?: Error | null;
  children: ReactNode;
  expectedFields?: string[];
  validator?: (data: any) => { isValid: boolean; error?: string };
  fallbackComponent?: ReactNode;
  loadingComponent?: ReactNode;
  emptyMessage?: string;
}

export const DataGuard = ({
  data,
  loading = false,
  error = null,
  children,
  expectedFields = [],
  validator,
  fallbackComponent,
  loadingComponent,
  emptyMessage = "Nenhum dado disponível"
}: DataGuardProps) => {
  
  const validationResult = useMemo(() => {
    if (loading || error || !data) return null;
    
    // Use custom validator if provided
    if (validator) {
      return validator(data);
    }
    
    // Use default API response validator
    return validateApiResponse(data, expectedFields);
  }, [data, expectedFields, validator, loading, error]);

  // Show loading state
  if (loading) {
    return loadingComponent || (
      <LoadingCard 
        title="Carregando dados..."
        description="Aguarde um momento"
        size="md"
      />
    );
  }

  // Show error state
  if (error) {
    console.error('❌ DataGuard - Erro detectado:', error);
    return (
      <ErrorState
        type="database"
        title="Erro ao carregar dados"
        description={error.message || "Ocorreu um erro inesperado"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Show empty state
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return fallbackComponent || (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Show validation error
  if (validationResult && !validationResult.isValid) {
    console.warn('⚠️ DataGuard - Dados inválidos:', validationResult.error);
    return (
      <ErrorState
        type="generic"
        title="Dados inválidos"
        description={validationResult.error || "Os dados recebidos não são válidos"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // All good - render children
  return <>{children}</>;
};

// Guard específico para dados de jogadores
export const PlayerDataGuard = ({ 
  players, 
  loading, 
  error, 
  children 
}: {
  players: any[];
  loading: boolean;
  error: Error | null;
  children: ReactNode;
}) => {
  const validator = (data: any[]) => {
    if (!Array.isArray(data)) {
      return { isValid: false, error: 'Dados de jogadores devem ser um array' };
    }

    const invalidPlayers = data.filter(player => {
      const validation = validatePlayerData(player);
      return !validation.isValid;
    });

    if (invalidPlayers.length > 0) {
      console.warn('⚠️ Jogadores com dados inválidos encontrados:', invalidPlayers);
      return { 
        isValid: false, 
        error: `${invalidPlayers.length} jogador(es) com dados inválidos` 
      };
    }

    return { isValid: true };
  };

  return (
    <DataGuard
      data={players}
      loading={loading}
      error={error}
      validator={validator}
      emptyMessage="Nenhum jogador encontrado"
      loadingComponent={
        <LoadingCard 
          title="Carregando jogadores..."
          description="Buscando dados dos jogadores"
          icon="user"
          size="lg"
        />
      }
    >
      {children}
    </DataGuard>
  );
};
