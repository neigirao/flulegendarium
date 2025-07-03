
import { Player } from "./guess-game";

export type Decade = '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s';

export interface DecadeInfo {
  id: Decade;
  label: string;
  description: string;
  period: string;
  color: string;
  icon: string;
}

export interface DecadePlayer extends Player {
  decades?: Decade[];
}

export interface DecadeGameState {
  selectedDecade: Decade | null;
  availablePlayers: DecadePlayer[];
  currentPlayer: DecadePlayer | null;
  isLoading: boolean;
}
