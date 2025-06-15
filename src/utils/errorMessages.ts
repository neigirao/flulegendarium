
// Sistema de mensagens de erro específicas e contextuais

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  gameState?: any;
  timestamp?: string;
}

export interface DetailedError {
  title: string;
  message: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  code: string;
  context?: ErrorContext;
}

// Categorias de erro específicas
export const ErrorCategories = {
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTH',
  GAME_LOGIC: 'GAME',
  DATA_VALIDATION: 'DATA',
  USER_INPUT: 'INPUT',
  SYSTEM: 'SYSTEM',
  PERMISSION: 'PERMISSION'
} as const;

// Mapeamento de erros específicos
export const ErrorMessages: Record<string, DetailedError> = {
  // Erros de Rede
  'NETWORK_TIMEOUT': {
    title: 'Conexão Lenta',
    message: 'A conexão está mais lenta que o normal',
    suggestion: 'Verifique sua conexão com a internet e tente novamente',
    severity: 'medium',
    code: 'NET_001'
  },
  
  'NETWORK_OFFLINE': {
    title: 'Sem Conexão',
    message: 'Você está offline no momento',
    suggestion: 'Conecte-se à internet para continuar jogando',
    severity: 'high',
    code: 'NET_002'
  },

  'API_SERVER_ERROR': {
    title: 'Servidor Indisponível',
    message: 'Nossos servidores estão temporariamente indisponíveis',
    suggestion: 'Tente novamente em alguns minutos. Se persistir, entre em contato conosco',
    severity: 'high',
    code: 'NET_003'
  },

  // Erros de Autenticação
  'AUTH_SESSION_EXPIRED': {
    title: 'Sessão Expirada',
    message: 'Sua sessão expirou por inatividade',
    suggestion: 'Faça login novamente para continuar',
    severity: 'medium',
    code: 'AUTH_001'
  },

  'AUTH_INVALID_CREDENTIALS': {
    title: 'Credenciais Inválidas',
    message: 'Email ou senha incorretos',
    suggestion: 'Verifique seus dados ou use "Esqueci minha senha"',
    severity: 'low',
    code: 'AUTH_002'
  },

  'AUTH_ACCOUNT_LOCKED': {
    title: 'Conta Bloqueada',
    message: 'Sua conta foi temporariamente bloqueada',
    suggestion: 'Entre em contato com o suporte para reativar sua conta',
    severity: 'critical',
    code: 'AUTH_003'
  },

  // Erros de Jogo
  'GAME_NO_PLAYERS': {
    title: 'Sem Jogadores Disponíveis',
    message: 'Não conseguimos carregar os jogadores para o quiz',
    suggestion: 'Recarregue a página ou tente novamente mais tarde',
    severity: 'high',
    code: 'GAME_001'
  },

  'GAME_INVALID_GUESS': {
    title: 'Resposta Inválida',
    message: 'A resposta inserida não é válida',
    suggestion: 'Digite apenas letras e números, sem caracteres especiais',
    severity: 'low',
    code: 'GAME_002'
  },

  'GAME_SESSION_CORRUPTED': {
    title: 'Sessão de Jogo Corrompida',
    message: 'Dados da partida foram corrompidos',
    suggestion: 'Inicie uma nova partida. Suas estatísticas foram preservadas',
    severity: 'medium',
    code: 'GAME_003'
  },

  'GAME_TIMER_ERROR': {
    title: 'Erro no Cronômetro',
    message: 'O cronômetro do jogo parou de funcionar',
    suggestion: 'Continue jogando normalmente, o tempo será ajustado automaticamente',
    severity: 'low',
    code: 'GAME_004'
  },

  // Erros de Dados
  'DATA_CORRUPTED': {
    title: 'Dados Corrompidos',
    message: 'Os dados recebidos estão corrompidos ou incompletos',
    suggestion: 'Recarregue a página para buscar dados atualizados',
    severity: 'medium',
    code: 'DATA_001'
  },

  'DATA_SAVE_FAILED': {
    title: 'Falha ao Salvar',
    message: 'Não foi possível salvar seus dados',
    suggestion: 'Suas informações podem ser perdidas. Tente novamente',
    severity: 'high',
    code: 'DATA_002'
  },

  'DATA_LOAD_FAILED': {
    title: 'Falha ao Carregar',
    message: 'Não foi possível carregar os dados necessários',
    suggestion: 'Verifique sua conexão e recarregue a página',
    severity: 'medium',
    code: 'DATA_003'
  },

  // Erros de Input do Usuário
  'INPUT_EMPTY_FIELD': {
    title: 'Campo Obrigatório',
    message: 'Este campo é obrigatório e não pode estar vazio',
    suggestion: 'Preencha o campo para continuar',
    severity: 'low',
    code: 'INPUT_001'
  },

  'INPUT_INVALID_FORMAT': {
    title: 'Formato Inválido',
    message: 'O formato inserido não é válido',
    suggestion: 'Verifique o formato esperado e tente novamente',
    severity: 'low',
    code: 'INPUT_002'
  },

  'INPUT_TOO_LONG': {
    title: 'Texto Muito Longo',
    message: 'O texto inserido excede o limite permitido',
    suggestion: 'Reduza o tamanho do texto e tente novamente',
    severity: 'low',
    code: 'INPUT_003'
  },

  // Erros de Sistema
  'SYSTEM_MEMORY_LOW': {
    title: 'Memória Insuficiente',
    message: 'Seu dispositivo está com pouca memória disponível',
    suggestion: 'Feche outros aplicativos e recarregue a página',
    severity: 'medium',
    code: 'SYS_001'
  },

  'SYSTEM_BROWSER_UNSUPPORTED': {
    title: 'Navegador Não Suportado',
    message: 'Seu navegador não suporta todos os recursos necessários',
    suggestion: 'Use uma versão mais recente do Chrome, Firefox ou Safari',
    severity: 'high',
    code: 'SYS_002'
  },

  // Erros de Permissão
  'PERMISSION_DENIED': {
    title: 'Acesso Negado',
    message: 'Você não tem permissão para realizar esta ação',
    suggestion: 'Entre em contato com o administrador se precisar de acesso',
    severity: 'medium',
    code: 'PERM_001'
  },

  'PERMISSION_ADMIN_REQUIRED': {
    title: 'Acesso Administrativo Necessário',
    message: 'Esta funcionalidade requer privilégios de administrador',
    suggestion: 'Faça login com uma conta de administrador',
    severity: 'medium',
    code: 'PERM_002'
  }
};

// Função para obter mensagem de erro específica
export const getSpecificError = (
  errorType: string,
  context?: ErrorContext,
  fallbackMessage?: string
): DetailedError => {
  const error = ErrorMessages[errorType];
  
  if (error) {
    return {
      ...error,
      context: {
        ...context,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Fallback para erros não mapeados
  return {
    title: 'Erro Inesperado',
    message: fallbackMessage || 'Ocorreu um erro inesperado',
    suggestion: 'Tente novamente ou entre em contato com o suporte se o problema persistir',
    severity: 'medium',
    code: 'UNKNOWN',
    context: {
      ...context,
      timestamp: new Date().toISOString()
    }
  };
};

// Função para formatar erro para display
export const formatErrorForDisplay = (error: DetailedError): string => {
  return `[${error.code}] ${error.title}: ${error.message}\n\n💡 ${error.suggestion}`;
};

// Função para log estruturado de erro
export const logStructuredError = (error: DetailedError): void => {
  const logLevel = {
    low: 'info',
    medium: 'warn',
    high: 'error',
    critical: 'error'
  }[error.severity];

  console[logLevel as keyof Console](`🚨 [${error.code}] ${error.title}:`, {
    message: error.message,
    suggestion: error.suggestion,
    severity: error.severity,
    context: error.context,
    timestamp: new Date().toISOString()
  });
};

// Função para determinar se erro precisa de intervenção imediata
export const requiresImmediateAttention = (error: DetailedError): boolean => {
  return error.severity === 'critical' || error.severity === 'high';
};

// Função para gerar sugestões contextuais
export const getContextualSuggestions = (error: DetailedError): string[] => {
  const baseSuggestions = [error.suggestion];
  
  // Adicionar sugestões específicas baseadas no contexto
  if (error.context?.component === 'GuessGame') {
    baseSuggestions.push('Você pode tentar iniciar uma nova partida');
  }
  
  if (error.context?.action === 'save') {
    baseSuggestions.push('Suas informações podem ter sido perdidas');
  }
  
  if (error.severity === 'critical') {
    baseSuggestions.push('Entre em contato com o suporte imediatamente');
  }
  
  return baseSuggestions;
};
