/**
 * Serviço para reportar e gerenciar imagens problemáticas
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface ImageErrorReport {
  player_id: string;
  player_name: string;
  original_url: string | null;
  resolved_url: string | null;
  error_type: 'load_error' | 'timeout' | 'invalid_url' | 'network_error';
  retry_count: number;
  device_info?: {
    userAgent: string;
    viewport: { width: number; height: number };
    connection?: string;
  };
}

// Cache para evitar reports duplicados na mesma sessão
const reportedImages = new Set<string>();

/**
 * Reporta erro de carregamento de imagem para o backend
 */
export const reportImageError = async (report: ImageErrorReport): Promise<void> => {
  const cacheKey = `${report.player_id}-${report.original_url}`;
  
  // Evitar reports duplicados na mesma sessão
  if (reportedImages.has(cacheKey)) {
    logger.debug('Imagem já reportada nesta sessão', 'IMAGE_REPORT', { 
      playerId: report.player_id 
    });
    return;
  }

  try {
    const deviceInfo = {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: (navigator as Navigator & { connection?: { effectiveType?: string } })
        .connection?.effectiveType
    };

    const { error } = await supabase
      .from('image_error_reports')
      .insert({
        player_id: report.player_id,
        player_name: report.player_name,
        original_url: report.original_url,
        resolved_url: report.resolved_url,
        error_type: report.error_type,
        retry_count: report.retry_count,
        device_info: deviceInfo
      });

    if (error) {
      logger.warn('Erro ao salvar report de imagem', 'IMAGE_REPORT', { error });
    } else {
      reportedImages.add(cacheKey);
      logger.info('Report de imagem salvo com sucesso', 'IMAGE_REPORT', {
        playerId: report.player_id,
        playerName: report.player_name
      });
    }
  } catch (err) {
    logger.error('Falha ao reportar erro de imagem', 'IMAGE_REPORT', { err });
  }
};

/**
 * Limpa cache de reports (para nova sessão)
 */
export const clearReportCache = (): void => {
  reportedImages.clear();
};

/**
 * Verifica se uma imagem já foi reportada nesta sessão
 */
export const isImageReported = (playerId: string, imageUrl: string): boolean => {
  return reportedImages.has(`${playerId}-${imageUrl}`);
};

/**
 * Report de feedback do usuário (botão de flag)
 */
export const reportUserImageFeedback = async (
  itemName: string,
  itemType: 'player' | 'jersey',
  imageUrl: string | null,
  itemId?: string
): Promise<void> => {
  const cacheKey = `${itemId || itemName}-${imageUrl}`;
  
  if (reportedImages.has(cacheKey)) {
    logger.debug('Imagem já reportada pelo usuário nesta sessão', 'IMAGE_FEEDBACK');
    return;
  }

  const deviceInfo = {
    userAgent: navigator.userAgent,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    connection: (navigator as Navigator & { connection?: { effectiveType?: string } })
      .connection?.effectiveType,
    itemType,
  };

  const { error } = await supabase
    .from('image_error_reports')
    .insert({
      player_id: itemType === 'player' && itemId ? itemId : null,
      player_name: `[${itemType}] ${itemName}`,
      original_url: imageUrl,
      error_type: 'user_report',
      retry_count: 0,
      device_info: deviceInfo,
    });

  if (error) {
    logger.error('Erro ao salvar feedback de imagem', 'IMAGE_FEEDBACK', { error });
    throw error;
  }

  reportedImages.add(cacheKey);
  logger.info('Feedback de imagem salvo', 'IMAGE_FEEDBACK', { itemName, itemType });
};
