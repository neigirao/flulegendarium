
import { useResponsive } from './use-responsive';

export function useIsMobile() {
  const { isMobile } = useResponsive();
  return isMobile;
}
