
import { Suspense, useEffect, ReactNode } from "react";
import { Loader } from "lucide-react";
import { useLocation } from "react-router-dom";

interface RootLayoutProps {
  children: ReactNode;
}

// Loading fallback component for content
const ContentLoader = () => (
  <div className="flex items-center justify-center p-12">
    <Loader className="w-8 h-8 text-flu-grena animate-spin" />
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
