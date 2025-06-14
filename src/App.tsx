
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader } from "lucide-react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { usePerformance } from "@/hooks/use-performance";
import { useBundleAnalyzer } from "@/hooks/use-bundle-analyzer";

// Lazy load pages with better loading and preloading
const Index = lazy(() => 
  import("./pages/Index").then(module => {
    // Preload critical pages after Index loads
    import("./pages/GameModeSelection");
    import("./pages/Game");
    return module;
  })
);

const GameModeSelection = lazy(() => 
  import("./pages/GameModeSelection").then(module => {
    // Preload Game page when user is selecting mode
    import("./pages/Game");
    return module;
  })
);

const Game = lazy(() => import("./pages/Game"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Enhanced loading fallback component
const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-flu-verde/50 to-white">
      <div className="flex flex-col items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
        <Loader className="w-10 h-10 text-flu-grena animate-spin" />
        <p className="text-flu-verde font-medium">Carregando...</p>
      </div>
    </div>
  );
};

// Optimized QueryClient configuration for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2; // Reduced retries for better performance
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// Performance monitoring component
const PerformanceMonitor = () => {
  usePerformance();
  useBundleAnalyzer();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <PerformanceMonitor />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/select-mode" element={<GameModeSelection />} />
              <Route path="/game" element={<Game />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
