import { Suspense, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { PageLoading } from "@/components/ui/loading-states";
import { preconnectCriticalOrigins } from "@/hooks/use-critical-image-preload";

interface RootLayoutProps {
  children: ReactNode;
}

// Critical images to preload at app startup
const CRITICAL_PRELOADS = [
  '/lovable-uploads/1b089617-8fa2-440f-ab41-5192f292f5f3.png', // Hero banner
  '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png'  // Logo/favicon
];

export const RootLayout = ({ children }: RootLayoutProps) => {
  const location = useLocation();
  
  // Reset scroll position when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Preconnect to critical origins and preload fonts
  useEffect(() => {
    // Preconnect to CDNs for faster resource loading
    preconnectCriticalOrigins();
    
    // Preload critical fonts with display=swap
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.as = 'style';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);
    
    // Preload critical images
    CRITICAL_PRELOADS.forEach((src, index) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.fetchPriority = index === 0 ? 'high' : 'low';
      document.head.appendChild(link);
    });
    
    return () => {
      // Cleanup is not needed as preloads should persist
    };
  }, []);
  
  return (
    <main role="main">
      <Suspense
        fallback={
          <PageLoading
            title="Carregando Lendas do Flu..."
            description="Preparando sua experiência tricolor"
          />
        }
      >
        {children}
      </Suspense>
    </main>
  );
};
