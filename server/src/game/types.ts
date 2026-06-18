export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

export interface Token {
  id: string;
  color: PlayerColor;
  position: number; // -1 means base, 0-51 normal path, 52-56 home stretch, 57 finished
  isFinished: boolean;
}

export interface Player {
  id: string; // Socket ID
  name: string;
  color: PlayerColor;
  tokens: Token[];
  isBot: boolean;
}

export interface GameState {
  roomId: string;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  players: Player[];
  currentTurn: PlayerColor | null;
  lastDiceRoll: number | null;
  diceRolled: boolean;
  winner: PlayerColor | null;
}

export interface Room {
  id: string;
  gameState: GameState;
  createdAt: number;
}
