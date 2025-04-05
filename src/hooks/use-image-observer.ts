
import { useEffect, useRef } from "react";

export function useImageObserver(imgRef: React.RefObject<HTMLImageElement>) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Cleanup function for observer
  const cleanupObserver = () => {
    if (observerRef.current && imgRef.current) {
      observerRef.current.unobserve(imgRef.current);
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  };

  // Set up Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    cleanupObserver();

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && imgRef.current) {
        // Set high priority when visible
        if (imgRef.current) {
          imgRef.current.fetchPriority = "high";
          
          // Force browser to load the image if it hasn't already
          if (imgRef.current.complete === false) {
            const currentSrc = imgRef.current.src;
            imgRef.current.src = currentSrc;
          }
        }
        
        // Cleanup observer once image is visible
        cleanupObserver();
      }
    }, {
      rootMargin: "200px", // Start loading when within 200px of viewport
      threshold: 0.1
    });
    
    observerRef.current.observe(imgRef.current);
    
    return cleanupObserver;
  }, [imgRef]);

  return { cleanupObserver };
}
