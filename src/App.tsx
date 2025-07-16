
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CriticalMeta } from "@/components/CriticalMeta";
import { MobileViewport } from "@/components/mobile/MobileViewport";
import { RootErrorBoundary } from "@/components/error-boundaries/RootErrorBoundary";
import { GameErrorBoundary } from "@/components/error-boundaries/GameErrorBoundary";
import { AdminErrorBoundary } from "@/components/error-boundaries/AdminErrorBoundary";

// Core pages (immediate load)
import Index from "@/pages/Index";

// Lazy loaded modules with optimized loading
import {
  LazyAdaptiveGuessPlayer,
  LazyDecadeGuessPlayer,
  LazyGameModeSelection,
  LazyAdmin,
  LazyAdminLogin,
  LazyProfile,
  LazyAuth,
  LazyFAQ
} from "@/components/lazy-modules";

const NotFound = React.lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && 'status' in error && typeof error.status === 'number') {
          if (error.status >= 400 && error.status < 500) {
            console.warn('⚠️ Não tentando novamente para erro 4xx:', error.status);
            return false;
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function App() {
  return (
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <CriticalMeta />
              <MobileViewport />
              <div className="min-h-screen bg-background font-sans antialiased">
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-flu-grena"></div>
                </div>}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<LazyAuth />} />
                    <Route path="/selecionar-modo-jogo" element={<LazyGameModeSelection />} />
                    <Route 
                      path="/quiz-adaptativo" 
                      element={
                        <GameErrorBoundary>
                          <LazyAdaptiveGuessPlayer />
                        </GameErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/quiz-decada" 
                      element={
                        <GameErrorBoundary>
                          <LazyDecadeGuessPlayer />
                        </GameErrorBoundary>
                      } 
                    />
                    <Route path="/meu-perfil-tricolor" element={<LazyProfile />} />
                    <Route path="/faq" element={<LazyFAQ />} />
                    <Route path="/admin/login-administrador" element={<LazyAdminLogin />} />
                    <Route 
                      path="/admin" 
                      element={
                        <AdminErrorBoundary>
                          <LazyAdmin />
                        </AdminErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/admin/dashboard" 
                      element={
                        <AdminErrorBoundary>
                          <LazyAdmin />
                        </AdminErrorBoundary>
                      } 
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </RootErrorBoundary>
  );
}

export default App;
