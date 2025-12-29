/**
 * Módulo de utilitários para imagens de camisas
 */

export { 
  isValidJerseyImageUrl, 
  getReliableJerseyImageUrl,
  clearJerseyImageUrlCache,
  jerseyDefaultImage,
  jerseyImagesFallbacks
} from './imageUtils';

export { 
  JERSEY_CACHE_EXPIRATION 
} from './constants';

export { 
  reportJerseyImageProblem,
  getProblematicJerseys,
  getJerseyProblemHistory,
  clearJerseyProblems
} from './problemTracking';

export { 
  preloadJerseyImages, 
  clearJerseyImageCache,
  preloadNextJersey,
  prepareNextJerseyBatch
} from './preloadUtils';
