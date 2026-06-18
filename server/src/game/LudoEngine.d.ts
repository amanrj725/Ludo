import { GameState, Player } from './types';
export declare class LudoEngine {
    state: GameState;
    constructor(roomId: string);
    addPlayer(id: string, name: string, isBot?: boolean): Player | null;
    startGame(): void;
    rollDice(playerId: string): number | null;
    moveToken(playerId: string, tokenId: string): boolean;
    private hasValidMoves;
    private nextTurn;
    private getPlayerById;
}
//# sourceMappingURL=LudoEngine.d.ts.map