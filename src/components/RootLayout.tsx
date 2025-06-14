
import { Suspense, useEffect, ReactNode } from "react";
import { Loader } from "lucide-react";
import { useLocation } from "react-router-dom";

interface RootLayoutProps {
  children: ReactNode;
}

// Loading fallback component for content
const ContentLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <img 
          src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
          alt="Fluminense FC" 
          className="w-10 h-10 object-contain"
        />
        <Loader className="w-8 h-8 text-flu-grena animate-spin" />
      </div>
      <p className="text-flu-grena font-semibold">Carregando...</p>
    </div>
  </div>
);

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
    <Suspense fallback={<ContentLoader />}>
      {children}
    </Suspense>
  );
};
