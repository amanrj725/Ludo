import { GameState, Player, PlayerColor, Token } from './types';

// Constants for the board mapped in a 1D circular array (0 to 51)
// Red: 0-12, Green: 13-25, Yellow: 26-38, Blue: 39-51
const START_POSITIONS: Record<PlayerColor, number> = {
  RED: 0,
  GREEN: 13,
  YELLOW: 26,
  BLUE: 39,
};

const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];

export class LudoEngine {
  public state: GameState;

  constructor(roomId: string) {
    this.state = {
      roomId,
      status: 'WAITING',
      players: [],
      currentTurn: null,
      lastDiceRoll: null,
      diceRolled: false,
      winner: null,
    };
  }

  addPlayer(id: string, name: string, isBot = false): Player | null {
    const existingPlayer = this.getPlayerById(id);
    if (existingPlayer) return existingPlayer;

    if (this.state.players.length >= 4 || this.state.status !== 'WAITING') return null;
    const colors: PlayerColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
    const takenColors = this.state.players.map((p) => p.color);
    const availableColor = colors.find((c) => !takenColors.includes(c));

    if (!availableColor) return null;

    const newPlayer: Player = {
      id,
      name,
      color: availableColor,
      isBot,
      tokens: Array.from({ length: 4 }).map((_, i) => ({
        id: `${availableColor}-${i}`,
        color: availableColor,
        position: -1, // -1 means in base
        isFinished: false,
      })),
    };

    this.state.players.push(newPlayer);
    return newPlayer;
  }

  removePlayer(id: string) {
    if (this.state.status === 'WAITING') {
      this.state.players = this.state.players.filter(p => p.id !== id);
    }
  }

  startGame() {
    if (this.state.players.length >= 1) {

      // Ensure 4 players by filling with Bots
      const botNames = ['BOT Alpha', 'BOT Beta', 'BOT Gamma'];
      let botsAdded = 0;
      
      // Get colors already taken by real players
      const takenColors = this.state.players.map(p => p.color);
      const allColors: PlayerColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
      
      // Auto-assign remaining empty colors to Bots
      allColors.forEach(color => {
        if (!takenColors.includes(color) && this.state.players.length < 4) {
          const newBot: Player = {
            id: `bot-${Math.random().toString(36).substring(2, 8)}`,
            name: botNames[botsAdded++],
            color: color,
            isBot: true,
            tokens: Array.from({ length: 4 }).map((_, i) => ({
              id: `${color}-${i}`,
              color: color,
              position: -1,
              isFinished: false,
            })),
          };
          this.state.players.push(newBot);
        }
      });

      this.state.status = 'PLAYING';
      // Typical Ludo convention normally starts turn with RED
      this.state.currentTurn = 'RED';
    }
  }

  rollDice(playerId: string): number | null {
    if (this.state.status !== 'PLAYING') return null;
    const player = this.getPlayerById(playerId);
    if (!player || player.color !== this.state.currentTurn || this.state.diceRolled) return null;

    const roll = Math.floor(Math.random() * 6) + 1;
    this.state.lastDiceRoll = roll;
    this.state.diceRolled = true;

    return roll;
  }

  moveToken(playerId: string, tokenId: string): boolean {
    if (this.state.status !== 'PLAYING' || !this.state.diceRolled || !this.state.lastDiceRoll) return false;
    
    const player = this.getPlayerById(playerId);
    if (!player || player.color !== this.state.currentTurn) return false;

    const token = player.tokens.find((t) => t.id === tokenId);
    if (!token || token.isFinished) return false;

    const steps = this.state.lastDiceRoll;
    let newPos = token.position;

    // Moving out of base
    if (token.position === -1) {
      if (steps === 6) {
        newPos = START_POSITIONS[player.color];
      } else {
        return false; // Can't move out without a 6
      }
    } else {
       // Regular movement
       const startPos = START_POSITIONS[player.color];
       let distBefore = (token.position - startPos + 52) % 52;
       let distAfter = distBefore + steps;
       
       if (distAfter >= 51) {
         token.isFinished = true;
         token.position = 57; // 57 means finished
       } else {
         newPos = (token.position + steps) % 52;
       }
    }

    if (!token.isFinished) {
      token.position = newPos;

      // Check for captures
      if (!SAFE_ZONES.includes(newPos)) {
        this.state.players.forEach(p => {
          if (p.color !== player.color) {
            p.tokens.forEach(t => {
              if (t.position === newPos) {
                t.position = -1; // Send back to base
              }
            });
          }
        });
      }
    }

    // Checking win condition
    if (player.tokens.every(t => t.isFinished)) {
      this.state.winner = player.color;
      this.state.status = 'FINISHED';
    } else {
      if (steps !== 6) {
        this.nextTurn();
      } else {
        // Rolled a 6, keep turn
        this.state.diceRolled = false;
      }
    }

    return true;
  }

  public hasValidMoves(player: Player, roll: number): boolean {
    return player.tokens.some(t => {
      if (t.isFinished) return false;
      if (t.position === -1 && roll !== 6) return false;
      return true; // Simplified: assume any other token can move
    });
  }

  public getBestBotMove(player: Player, roll: number): string | null {
    const validTokens = player.tokens.filter(t => {
      if (t.isFinished) return false;
      if (t.position === -1 && roll !== 6) return false;
      return true;
    });

    if (validTokens.length === 0) return null;

    // 1. Priority: Can we capture an opponent?
    for (const t of validTokens) {
      if (t.position !== -1) {
        const startPos = START_POSITIONS[player.color];
        let distBefore = (t.position - startPos + 52) % 52;
        let distAfter = distBefore + roll;
        
        // If not reaching home, check for capture
        if (distAfter < 51) {
          const newPos = (t.position + roll) % 52;
          if (!SAFE_ZONES.includes(newPos)) {
            // Check if any opponent is there
            let hasOpponent = false;
            this.state.players.forEach(p => {
              if (p.color !== player.color) {
                if (p.tokens.some(ot => ot.position === newPos && !ot.isFinished)) {
                  hasOpponent = true;
                }
              }
            });
            if (hasOpponent) return t.id; // Capture!
          }
        }
      }
    }

    // 2. Priority: Can we reach home to finish?
    for (const t of validTokens) {
      if (t.position !== -1) {
        const startPos = START_POSITIONS[player.color];
        let distBefore = (t.position - startPos + 52) % 52;
        let distAfter = distBefore + roll;
        if (distAfter >= 51) return t.id; // Finish!
      }
    }

    // 3. Priority: Roll out of base if 6
    if (roll === 6) {
      const inBase = validTokens.find(t => t.position === -1);
      if (inBase) return inBase.id;
    }

    // 4. Fallback: Advance the most progressed token to get it home faster
    const onBoard = validTokens.filter(t => t.position !== -1);
    if (onBoard.length > 0) {
      const startPos = START_POSITIONS[player.color];
      onBoard.sort((a, b) => ((b.position - startPos + 52) % 52) - ((a.position - startPos + 52) % 52));
      return onBoard[0].id;
    }

    return validTokens[0].id; // Fallback to first valid token
  }

  public nextTurn() {
    const currentIndex = this.state.players.findIndex((p) => p.color === this.state.currentTurn);
    const nextIndex = (currentIndex + 1) % this.state.players.length;
    this.state.currentTurn = this.state.players[nextIndex]?.color ?? null;
    this.state.diceRolled = false;
    this.state.lastDiceRoll = null;
  }

  public getPlayerById(id: string): Player | undefined {
    return this.state.players.find((p) => p.id === id);
  }
}
