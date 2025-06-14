
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { CriticalCSS } from "@/components/performance/CriticalCSS";
import { PerformanceMetrics } from "@/components/performance/PerformanceMetrics";
import { StructuredDataManager } from "@/components/performance/StructuredDataManager";
import { PreloadManager } from "@/components/performance/PreloadManager";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Game = lazy(() => import("./pages/Game"));
const GuessPlayer = lazy(() => import("./pages/GuessPlayer"));
const GameModeSelection = lazy(() => import("./pages/GameModeSelection"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminLazy = lazy(() => import("./pages/AdminLazy"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized Query Client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: 'smart',
    },
  },
});

// Critical resources to preload
const criticalResources = [
  {
    href: '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png',
    as: 'image' as const,
    priority: 'high' as const
  },
  {
    href: '/og-image.png',
    as: 'image' as const,
    priority: 'low' as const
  }
];

// Enhanced loading fallback
const LoadingFallback = () => (
  <div className="critical-loading">
    <img 
      src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
      alt="Fluminense FC" 
      className="critical-logo"
      width={60}
      height={60}
    />
    <div className="critical-spinner" />
    <div className="critical-text">Carregando...</div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Performance optimization components */}
        <CriticalCSS />
        <PerformanceMetrics />
        <StructuredDataManager />
        <PreloadManager resources={criticalResources} />
        
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/game" element={<Game />} />
            <Route path="/guess-player" element={<GuessPlayer />} />
            <Route path="/select-mode" element={<GameModeSelection />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminLazy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
