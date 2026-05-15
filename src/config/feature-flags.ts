/**
 * Feature flags centralizados.
 *
 * Cada flag deve ter um nome descritivo, valor padrão claro, e variável de ambiente
 * correspondente (quando aplicável). Antes de ativar em produção, documente o risco
 * e o plano de rollback no ADR ou PR associado.
 */

const env = import.meta.env;

export const featureFlags = {
  /**
   * Ativa o design system visual em produção.
   * Controlado por VITE_ENABLE_DESIGN_SYSTEM=true ou ativo automaticamente em DEV.
   */
  enableDesignSystem: env.DEV || env.VITE_ENABLE_DESIGN_SYSTEM === 'true',

  /**
   * Integra Sentry para rastreamento de erros em produção.
   * Ativo apenas em modo PROD.
   */
  enableSentry: env.PROD,

  /**
   * Envia eventos para Google Analytics 4.
   * Ativo apenas em modo PROD para evitar poluição de métricas.
   */
  enableAnalytics: env.PROD,

  /**
   * Exibe detalhes de erro técnicos nos error boundaries.
   * Apenas em DEV para evitar exposição de internals em produção.
   */
  showErrorDetails: env.DEV,
} as const;

export type FeatureFlags = typeof featureFlags;
