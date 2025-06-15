
import { Suspense, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { PageLoading } from "@/components/ui/loading-states";

interface RootLayoutProps {
  children: ReactNode;
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const location = useLocation();
  
  // Reset scroll position when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Preload critical fonts and resources
  useEffect(() => {
    // Use link preload for critical fonts
    const linkElement = document.createElement('link');
    linkElement.rel = 'preload';
    linkElement.as = 'font';
    linkElement.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap';
    linkElement.crossOrigin = 'anonymous';
    document.head.appendChild(linkElement);
    
    return () => {
      document.head.removeChild(linkElement);
    };
  }, []);
  
  return (
    <Suspense fallback={
      <PageLoading 
        title="Carregando Lendas do Flu..."
        description="Preparando sua experiência tricolor"
      />
    }>
      {children}
    </Suspense>
  );
};
