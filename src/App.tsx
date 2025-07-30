
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
import AdaptiveGuessPlayerSimple from "@/pages/AdaptiveGuessPlayerSimple";
import DecadeGuessPlayerSimple from "@/pages/DecadeGuessPlayerSimple";

// Lazy loaded modules with optimized loading
import {
  LazyGameModeSelection,
  LazyAdmin,
  LazyAdminLogin,
  LazyAuth,
  LazyFAQ,
  LazySocialPage,
  LazyNewsPortal,
  LazyNewsArticle,
  LazyDonations
} from "@/components/lazy-modules";

import { PerformanceDashboard } from "@/components/observability/PerformanceDashboard";
import { createOptimizedQueryClient } from "@/utils/performance/cacheOptimization";
import { useIframeCache } from "@/hooks/use-iframe-cache";

const NotFound = React.lazy(() => import("@/pages/NotFound"));

const queryClient = createOptimizedQueryClient();

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
                          <AdaptiveGuessPlayerSimple />
                        </GameErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/quiz-decada" 
                      element={
                        <GameErrorBoundary>
                          <DecadeGuessPlayerSimple />
                        </GameErrorBoundary>
                      } 
                    />
                    
                    <Route path="/social" element={<LazySocialPage />} />
                    <Route path="/faq" element={<LazyFAQ />} />
                    <Route path="/noticias" element={<LazyNewsPortal />} />
                    <Route path="/noticias/:slug" element={<LazyNewsArticle />} />
                    <Route path="/doacoes" element={<LazyDonations />} />
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
              <PerformanceDashboard />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </RootErrorBoundary>
  );
}

export default App;
