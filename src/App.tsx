import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { UXProvider } from "@/components/ux/UXProvider";
import { PWAProvider } from "@/components/pwa/PWAProvider";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { PWAStatusIndicator } from "@/components/pwa/PWAStatusIndicator";
import { AdvancedServiceWorker } from "@/components/performance/AdvancedServiceWorker";
import { RootLayout } from "@/components/RootLayout";
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

const NotFound = React.lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PWAProvider>
          <BrowserRouter>
            <AuthProvider>
              <UXProvider>
                <TooltipProvider>
                  <MobileViewport />
                  <AdvancedServiceWorker />
                  <PWAStatusIndicator />
                  <PWAInstallPrompt />
                  
                  <RootLayout>
                    <div className="min-h-screen bg-background font-sans antialiased">
                      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
                  </RootLayout>
                  
                  <Toaster />
                </TooltipProvider>
              </UXProvider>
            </AuthProvider>
          </BrowserRouter>
        </PWAProvider>
      </QueryClientProvider>
    </RootErrorBoundary>
  );
}

export default App;