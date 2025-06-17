
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RootErrorBoundary } from "@/components/error-boundaries/RootErrorBoundary";
import { GameErrorBoundary } from "@/components/error-boundaries/GameErrorBoundary";
import { AdminErrorBoundary } from "@/components/error-boundaries/AdminErrorBoundary";
import Index from "@/pages/Index";
import GuessPlayer from "@/pages/GuessPlayer";
import Profile from "@/pages/Profile";
import AdminLogin from "@/pages/AdminLogin";
import FAQ from "@/pages/FAQ";

// Lazy load heavy components
const AdminLazy = lazy(() => import("@/pages/AdminLazy"));

// Create a stable QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route 
                path="/guess-player" 
                element={
                  <GameErrorBoundary>
                    <GuessPlayer />
                  </GameErrorBoundary>
                } 
              />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/faq" element={<FAQ />} />
              <Route 
                path="/admin/*" 
                element={
                  <AdminErrorBoundary>
                    <Suspense fallback={
                      <div className="flex items-center justify-center min-h-screen">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-flu-grena"></div>
                      </div>
                    }>
                      <AdminLazy />
                    </Suspense>
                  </AdminErrorBoundary>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </RootErrorBoundary>
  );
}

export default App;
