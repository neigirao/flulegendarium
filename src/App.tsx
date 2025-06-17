
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SimpleErrorBoundary } from "@/components/error-boundaries/SimpleErrorBoundary";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "@/pages/Index";
import GuessPlayer from "@/pages/GuessPlayer";
import Profile from "@/pages/Profile";
import AdminLogin from "@/pages/AdminLogin";
import FAQ from "@/pages/FAQ";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <SimpleErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/guess-player" element={<GuessPlayer />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </SimpleErrorBoundary>
  );
}

export default App;
