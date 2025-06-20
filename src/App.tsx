
import React, { Suspense, lazy } from "react";
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

const Index = lazy(() => import("@/pages/Index"))
const AdaptiveGuessPlayerSimple = lazy(() => import("@/pages/AdaptiveGuessPlayerSimple"))
const SelectGameMode = lazy(() => import("@/pages/GameModeSelection"))
const Profile = lazy(() => import("@/pages/Profile"))
const AdminLogin = lazy(() => import("@/pages/AdminLogin"))
const AdminDashboard = lazy(() => import("@/pages/Admin"))
const FAQ = lazy(() => import("@/pages/FAQ"))
const NotFound = lazy(() => import("@/pages/NotFound"))

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
                    <Route path="/selecionar-modo-jogo" element={<SelectGameMode />} />
                    <Route 
                      path="/quiz-adaptativo" 
                      element={
                        <GameErrorBoundary>
                          <AdaptiveGuessPlayerSimple />
                        </GameErrorBoundary>
                      } 
                    />
                    <Route path="/meu-perfil-tricolor" element={<Profile />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/admin/login-administrador" element={<AdminLogin />} />
                    <Route 
                      path="/admin" 
                      element={
                        <AdminErrorBoundary>
                          <AdminDashboard />
                        </AdminErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/admin/dashboard" 
                      element={
                        <AdminErrorBoundary>
                          <AdminDashboard />
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
