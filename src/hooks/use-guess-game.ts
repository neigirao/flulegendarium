import { useState, useCallback, useRef, useEffect } from "react";
import { Player } from "@/types/guess-game";
import { processPlayerName } from "@/utils/name-processor";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/use-analytics";
import { useGameTimer } from "@/hooks/use-game-timer";

const POINTS_PER_CORRECT_GUESS = 5;
const MAX_ATTEMPTS = 3;
const GAME_TIME_SECONDS = 60;

export const useGuessGame = (players?: Player[]) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackCorrectGuess, trackIncorrectGuess } = useAnalytics();
  
  // Estados do jogo
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  
  // Timer do jogo
  const { timeRemaining, isTimerRunning, startTimer, stopTimer, resetTimer } = useGameTimer(GAME_TIME_SECONDS);
  
  // Refs para controle
  const gameStartedRef = useRef(false);
  const lastGuessTimeRef = useRef(0);

  // Função para selecionar jogador aleatório
  const selectRandomPlayer = useCallback(() => {
    if (!players || players.length === 0) {
      console.warn("Nenhum jogador disponível para seleção");
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * players.length);
    const selectedPlayer = players[randomIndex];
    
    console.log(`🎯 Jogador selecionado: ${selectedPlayer.name}`);
    setCurrentPlayer(selectedPlayer);
    setAttempts(0);
    setGameOver(false);
    setHasLost(false);
    
    // Reset timer but don't start it yet - will be started when image loads
    resetTimer();
  }, [players, resetTimer]);

  // Função para iniciar o jogo para um jogador específico
  const startGameForPlayer = useCallback(() => {
    if (!currentPlayer) return;
    
    console.log(`🎮 Iniciando timer para: ${currentPlayer.name}`);
    gameStartedRef.current = true;
    startTimer();
  }, [currentPlayer, startTimer]);

  // Função para salvar estatísticas do jogo
  const saveGameStats = useCallback(async (finalScore: number, isCorrect: boolean) => {
    if (!user || !currentPlayer) return;
    
    try {
      // Salvar na tabela de ranking
      const { error: rankingError } = await supabase
        .from('rankings')
        .insert({
          player_name: user.user_metadata?.full_name || user.email || 'Anônimo',
          score: finalScore,
          user_id: user.id,
          games_played: 1
        });

      if (rankingError) {
        console.error('Erro ao salvar no ranking:', rankingError);
      }

      // Salvar na tabela de tentativas
      const { error: attemptError } = await supabase
        .from('game_attempts')
        .insert({
          target_player_id: currentPlayer.id,
          target_player_name: currentPlayer.name,
          is_correct: isCorrect,
          attempt_number: attempts + 1,
          player_name: user.user_metadata?.full_name || user.email || 'Anônimo',
          guess: 'Finalizado',
          score: finalScore
        });

      if (attemptError) {
        console.error('Erro ao salvar tentativa:', attemptError);
      }

      console.log(`✅ Estatísticas salvas - Score: ${finalScore}, Correto: ${isCorrect}`);
    } catch (error) {
      console.error('Erro ao salvar estatísticas:', error);
    }
  }, [user, currentPlayer, attempts]);

  // Função para processar palpite
  const handleGuess = useCallback(async (guess: string) => {
    if (!currentPlayer || isProcessingGuess || gameOver) return;
    
    // Evitar spam de cliques
    const now = Date.now();
    if (now - lastGuessTimeRef.current < 1000) return;
    lastGuessTimeRef.current = now;
    
    setIsProcessingGuess(true);
    
    try {
      const isCorrect = await processPlayerName(guess, currentPlayer.name);
      const newAttempts = attempts + 1;
      
      if (isCorrect) {
        const newScore = score + POINTS_PER_CORRECT_GUESS;
        setScore(newScore);
        setGameOver(true);
        stopTimer();

        // Salvar estatísticas do acerto
        await saveGameStats(newScore, true);

        trackCorrectGuess(currentPlayer.name);

        toast({
          title: "🎉 Parabéns!",
          description: `Você acertou! Era ${currentPlayer.name}. +${POINTS_PER_CORRECT_GUESS} pontos!`,
          duration: 3000,
        });

        // Selecionar próximo jogador após delay
        setTimeout(() => {
          selectRandomPlayer();
        }, 2000);
      } else {
        setAttempts(newAttempts);

        trackIncorrectGuess(currentPlayer.name, guess, newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setHasLost(true);
          setGameOver(true);
          stopTimer();

          // Salvar estatísticas da derrota
          await saveGameStats(score, false);

          toast({
            title: "😔 Você perdeu!",
            description: `Era ${currentPlayer.name}. Suas tentativas se esgotaram.`,
            variant: "destructive",
            duration: 4000,
          });
        } else {
          toast({
            title: "❌ Resposta incorreta",
            description: `Restam ${MAX_ATTEMPTS - newAttempts} tentativas`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Erro ao processar palpite:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar seu palpite. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingGuess(false);
    }
  }, [
    currentPlayer, 
    isProcessingGuess, 
    gameOver, 
    attempts, 
    score, 
    saveGameStats, 
    trackCorrectGuess, 
    trackIncorrectGuess, 
    toast, 
    stopTimer, 
    selectRandomPlayer
  ]);

  // Função para lidar com correção de imagem
  const handlePlayerImageFixed = useCallback(() => {
    console.log(`🔧 Imagem corrigida para: ${currentPlayer?.name}`);
  }, [currentPlayer]);

  // Função para resetar pontuação
  const resetScore = useCallback(() => {
    setScore(0);
    setAttempts(0);
    setGameOver(false);
    setHasLost(false);
    gameStartedRef.current = false;
    resetTimer();
  }, [resetTimer]);

  // Effect para timeout do jogo
  useEffect(() => {
    if (timeRemaining === 0 && isTimerRunning && !gameOver) {
      setHasLost(true);
      setGameOver(true);
      stopTimer();
      
      if (currentPlayer) {
        saveGameStats(score, false);
        toast({
          title: "⏰ Tempo esgotado!",
          description: `Era ${currentPlayer.name}. O tempo acabou!`,
          variant: "destructive",
          duration: 4000,
        });
      }
    }
  }, [timeRemaining, isTimerRunning, gameOver, currentPlayer, score, saveGameStats, stopTimer, toast]);

  // Inicializar com primeiro jogador quando players estiver disponível
  useEffect(() => {
    if (players && players.length > 0 && !currentPlayer) {
      selectRandomPlayer();
    }
  }, [players, currentPlayer, selectRandomPlayer]);

  return {
    currentPlayer,
    attempts,
    score,
    gameOver,
    timeRemaining,
    MAX_ATTEMPTS,
    handleGuess,
    selectRandomPlayer,
    handlePlayerImageFixed,
    isProcessingGuess,
    hasLost,
    startGameForPlayer,
    isTimerRunning,
    resetScore
  };
};
