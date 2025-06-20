
import { useState, useEffect } from "react";
import { Player, DifficultyLevel } from "@/types/guess-game";

export const useEditPlayerForm = (player: Player) => {
  const [name, setName] = useState(player.name);
  const [imageUrl, setImageUrl] = useState(player.image_url);
  const [image, setImage] = useState<File | null>(null);
  const [nicknames, setNicknames] = useState(player.nicknames?.join(', ') || '');
  const [position, setPosition] = useState(player.position);
  const [yearHighlight, setYearHighlight] = useState(player.year_highlight || '');
  const [funFact, setFunFact] = useState(player.fun_fact || '');
  const [achievements, setAchievements] = useState(player.achievements?.join(', ') || '');
  const [gols, setGols] = useState(player.statistics?.gols || 0);
  const [jogos, setJogos] = useState(player.statistics?.jogos || 0);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>(player.difficulty_level || 'medio');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('url');

  useEffect(() => {
    console.log('📋 === FORMULÁRIO INICIALIZADO ===');
    console.log('  - Player:', player.name);
    console.log('  - Dificuldade do banco:', player.difficulty_level);
    console.log('  - Dificuldade no state:', difficultyLevel);
    console.log('  - Todos os dados do player:', player);
  }, [player, difficultyLevel]);

  const handleDifficultyChange = (value: string) => {
    console.log('🎯 === MUDANÇA DE DIFICULDADE ===');
    console.log('  - Valor anterior:', difficultyLevel);
    console.log('  - Novo valor:', value);
    console.log('  - Tipo do novo valor:', typeof value);
    
    const newDifficulty = value as DifficultyLevel;
    setDifficultyLevel(newDifficulty);
    
    console.log('  - State atualizado para:', newDifficulty);
  };

  return {
    // Form state
    name,
    setName,
    imageUrl,
    setImageUrl,
    image,
    setImage,
    nicknames,
    setNicknames,
    position,
    setPosition,
    yearHighlight,
    setYearHighlight,
    funFact,
    setFunFact,
    achievements,
    setAchievements,
    gols,
    setGols,
    jogos,
    setJogos,
    difficultyLevel,
    uploadMethod,
    setUploadMethod,
    handleDifficultyChange,
  };
};
