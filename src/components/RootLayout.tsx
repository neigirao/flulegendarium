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
  
  return (
    <main id="main-content" role="main" tabIndex={-1} className="focus:outline-none">
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
