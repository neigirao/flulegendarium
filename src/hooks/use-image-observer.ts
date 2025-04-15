
import { useEffect, useRef } from "react";

export function useImageObserver(imgRef: React.RefObject<HTMLImageElement>) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const cleanupObserver = () => {
    if (observerRef.current && imgRef.current) {
      observerRef.current.unobserve(imgRef.current);
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  };

  useEffect(() => {
    if (!imgRef.current) return;

    cleanupObserver();

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && imgRef.current) {
        imgRef.current.fetchPriority = "high";
        
        if (imgRef.current.complete === false) {
          const currentSrc = imgRef.current.src;
          imgRef.current.src = currentSrc;
        }
        
        cleanupObserver();
      }
    }, {
      rootMargin: "200px",
      threshold: 0.1
    });
    
    observerRef.current.observe(imgRef.current);
    
    return cleanupObserver;
  }, [imgRef]);

  return { cleanupObserver };
}
