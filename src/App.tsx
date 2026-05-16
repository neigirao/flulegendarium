import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { UXProvider } from "@/components/ux/UXProvider";
import { RootLayout } from "@/components/RootLayout";
import { MobileViewport } from "@/components/mobile/MobileViewport";
import { RootErrorBoundary } from "@/components/error-boundaries/RootErrorBoundary";
import { GameErrorBoundary } from "@/components/error-boundaries/GameErrorBoundary";
import { AdminErrorBoundary } from "@/components/error-boundaries/AdminErrorBoundary";
import { RouteErrorBoundary } from "@/components/error-boundaries/RouteErrorBoundary";
import { RoutePrefetchProvider } from "@/components/performance/RoutePrefetchProvider";
import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { featureFlags } from "@/config/feature-flags";

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
  LazyTutorial,
  LazySocialPage,
  LazyNewsPortal,
  LazyNewsArticle,
  LazyDonations,
  LazyConquistas,
  LazyResetPassword,
  LazyProfilePage,
  LazyDailyChallengesPage,
  LazyJerseyQuizPage,
  LazyEstatisticasPublicas,
  LazyDesignSystem
} from "@/components/lazy-modules";

const NotFound = React.lazy(() => import("@/pages/NotFound"));

const AppRouteFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center" role="status" aria-live="polite">
    <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-primary" aria-hidden="true"></div>
    <p className="text-sm text-muted-foreground">Carregando conteúdo…</p>
  </div>
);

const isDesignSystemEnabled = featureFlags.enableDesignSystem;

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
        <BrowserRouter>
            <RoutePrefetchProvider>
              <AuthProvider>
                <UXProvider>
                  <TooltipProvider>
                    <MobileViewport />
                    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md">
                      Pular para o conteúdo principal
                    </a>
                    <RootLayout>
                      <div className="min-h-screen bg-background font-sans antialiased">
                        <Suspense fallback={<AppRouteFallback />}>
                          <RouteErrorBoundary>
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/auth" element={<LazyAuth />} />
                            <Route path="/reset-password" element={<LazyResetPassword />} />
                            <Route path="/selecionar-modo-jogo" element={<ProtectedRoute><LazyGameModeSelection /></ProtectedRoute>} />
                            <Route
                              path="/quiz-adaptativo"
                              element={
                                <ProtectedRoute>
                                  <GameErrorBoundary>
                                    <AdaptiveGuessPlayerSimple />
                                  </GameErrorBoundary>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/quiz-decada"
                              element={
                                <ProtectedRoute>
                                  <GameErrorBoundary>
                                    <DecadeGuessPlayerSimple />
                                  </GameErrorBoundary>
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/quiz-camisas"
                              element={
                                <ProtectedRoute>
                                  <GameErrorBoundary>
                                    <LazyJerseyQuizPage />
                                  </GameErrorBoundary>
                                </ProtectedRoute>
                              }
                            />

                            <Route path="/estatisticas" element={<LazyEstatisticasPublicas />} />
                            {isDesignSystemEnabled && <Route path="/design-system" element={<LazyDesignSystem />} />}
                            <Route path="/social" element={<LazySocialPage />} />
                            <Route path="/perfil" element={<LazyProfilePage />} />
                            <Route path="/desafios" element={<LazyDailyChallengesPage />} />
                            <Route path="/faq" element={<LazyFAQ />} />
                            <Route path="/tutorial" element={<LazyTutorial />} />
                            <Route path="/noticias" element={<LazyNewsPortal />} />
                            <Route path="/noticias/:slug" element={<LazyNewsArticle />} />
                            <Route path="/doacoes" element={<LazyDonations />} />
                            <Route path="/conquistas" element={<LazyConquistas />} />
                            <Route path="/admin/login-administrador" element={<LazyAdminLogin />} />
                            <Route
                              path="/admin"
                              element={
                                <AdminErrorBoundary>
                                  <AdminRouteGuard>
                                    <LazyAdmin />
                                  </AdminRouteGuard>
                                </AdminErrorBoundary>
                              }
                            />
                            <Route
                              path="/admin/dashboard"
                              element={
                                <AdminErrorBoundary>
                                  <AdminRouteGuard>
                                    <LazyAdmin />
                                  </AdminRouteGuard>
                                </AdminErrorBoundary>
                              }
                            />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                          </RouteErrorBoundary>
                        </Suspense>
                      </div>
                    </RootLayout>

                    <Toaster />
                    <SpeedInsights />
                  </TooltipProvider>
                </UXProvider>
              </AuthProvider>
            </RoutePrefetchProvider>
          </BrowserRouter>
      </QueryClientProvider>
    </RootErrorBoundary>
  );
}

export default App;
