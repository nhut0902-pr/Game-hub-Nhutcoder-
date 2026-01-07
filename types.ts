export type PlayerColor = 'w' | 'b'; // For Chess
export type CaroPlayer = 'X' | 'O'; // For Caro

export type GameMode = 'pvp' | 'bot' | 'menu';
export type GameType = 'chess' | 'caro';
export type GameSubMode = 'classic' | 'time' | 'challenge' | 'online';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

// Shop Types
export type ItemType = 'theme' | 'piece_style' | 'utility' | 'music' | 'avatar' | 'effect';

// Chess Types
export interface GameState {
  fen: string;
  turn: PlayerColor;
  isGameOver: boolean;
  winner: PlayerColor | 'draw' | null;
  history: string[];
  captured: { w: string[]; b: string[] };
  inCheck: boolean;
}

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface SquareProps {
  square: string;
  piece: { type: PieceType; color: PlayerColor } | null;
  isLight: boolean;
  isSelected: boolean;
  isLastMove: boolean;
  isPossibleMove: boolean;
  isCheck: boolean;
  onClick: () => void;
  // Visual props
  themeColors: { light: string, dark: string };
  pieceStyle: string;
}

// Caro Types
export interface CaroState {
    board: (CaroPlayer | null)[][];
    turn: CaroPlayer;
    winner: CaroPlayer | 'draw' | null;
    winningLine: {r: number, c: number}[] | null;
    history: {r: number, c: number, player: CaroPlayer}[];
}

export interface Difficulty {
    name: string;
    depth: number;
}