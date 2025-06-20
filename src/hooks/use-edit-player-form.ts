
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
    console.log('🔄 === FORMULÁRIO CARREGADO ===');
    console.log('  - Nome do jogador:', player.name);
    console.log('  - ID do jogador:', player.id);
    console.log('  - Dificuldade original do banco:', player.difficulty_level);
    console.log('  - Tipo da dificuldade original:', typeof player.difficulty_level);
    console.log('  - Dificuldade no state inicial:', difficultyLevel);
  }, [player, difficultyLevel]);

  const handleDifficultyChange = (value: string) => {
    console.log('🔄 === MUDANÇA DE DIFICULDADE ===');
    console.log('  - Dificuldade anterior:', difficultyLevel);
    console.log('  - Nova dificuldade selecionada:', value);
    console.log('  - Tipo da nova dificuldade:', typeof value);
    setDifficultyLevel(value as DifficultyLevel);
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
