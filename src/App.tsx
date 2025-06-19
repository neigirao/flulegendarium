import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from "@tanstack/react-query";

import { RootErrorBoundary } from "@/components/RootErrorBoundary";
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

function App() {
  return (
    <QueryClient>
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
    </QueryClient>
  );
}

export default App;
