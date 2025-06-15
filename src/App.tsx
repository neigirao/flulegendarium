import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CriticalMeta } from "@/components/CriticalMeta";
import { MobileViewport } from "@/components/mobile/MobileViewport";

const Index = lazy(() => import("@/pages/Index"))
const GuessThePlayer = lazy(() => import("@/pages/GuessThePlayer"))
const SelectGameMode = lazy(() => import("@/pages/SelectGameMode"))
const Profile = lazy(() => import("@/pages/Profile"))
const AdminLogin = lazy(() => import("@/pages/AdminLogin"))
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"))
const AdminPlayers = lazy(() => import("@/pages/AdminPlayers"))
const AdminUploads = lazy(() => import("@/pages/AdminUploads"))
const AdminUsers = lazy(() => import("@/pages/AdminUsers"))
const AdminSettings = lazy(() => import("@/pages/AdminSettings"))
const NotFound = lazy(() => import("@/pages/NotFound"))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
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
                  <Route path="/quiz" element={<GuessThePlayer />} />
                  <Route path="/meu-perfil-tricolor" element={<Profile />} />
                  <Route path="/admin/login-administrador" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/jogadores" element={<AdminPlayers />} />
                  <Route path="/admin/imagens" element={<AdminUploads />} />
                  <Route path="/admin/usuarios" element={<AdminUsers />} />
                  <Route path="/admin/configuracoes" element={<AdminSettings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </div>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
