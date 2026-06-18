export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';
export interface Token {
    id: string;
    color: PlayerColor;
    position: number;
    isFinished: boolean;
}
export interface Player {
    id: string;
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
//# sourceMappingURL=types.d.ts.map