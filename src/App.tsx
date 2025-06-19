
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { RootErrorBoundary } from "@/components/error-boundaries/RootErrorBoundary";
import { Loader } from "@/components/guess-game/Loader";

import Index from "@/pages/Index";
import GameModeSelection from "@/pages/GameModeSelection";
import GuessPlayer from "@/pages/GuessPlayer";
import Game from "@/pages/Game";
import Profile from "@/pages/Profile";
import FAQ from "@/pages/FAQ";
import NotFound from "@/pages/NotFound";
import Game2 from "@/pages/Game2";

const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const AdminLazy = lazy(() => import('@/pages/Admin'));

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RootErrorBoundary>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/selecionar-modo-jogo" element={<GameModeSelection />} />
            <Route path="/jogar-quiz-fluminense" element={<GuessPlayer />} />
            <Route path="/jogo-simples-fluminense" element={<Game />} />
            <Route path="/jogo-2" element={<Game2 />} />
            <Route path="/meu-perfil-tricolor" element={<Profile />} />
            <Route path="/admin/login-administrador" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLazy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RootErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
