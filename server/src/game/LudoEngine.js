"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LudoEngine = void 0;
const types_1 = require("./types");
// Constants for the board mapped in a 1D circular array (0 to 51)
// Red: 0-12, Green: 13-25, Yellow: 26-38, Blue: 39-51
const START_POSITIONS = {
    RED: 0,
    GREEN: 13,
    YELLOW: 26,
    BLUE: 39,
};
const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];
class LudoEngine {
    state;
    constructor(roomId) {
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
    addPlayer(id, name, isBot = false) {
        if (this.state.players.length >= 4 || this.state.status !== 'WAITING')
            return null;
        const colors = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
        const takenColors = this.state.players.map((p) => p.color);
        const availableColor = colors.find((c) => !takenColors.includes(c));
        if (!availableColor)
            return null;
        const newPlayer = {
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
    startGame() {
        if (this.state.players.length >= 1) {
            this.state.status = 'PLAYING';
            this.state.currentTurn = this.state.players[0].color;
        }
    }
    rollDice(playerId) {
        if (this.state.status !== 'PLAYING')
            return null;
        const player = this.getPlayerById(playerId);
        if (!player || player.color !== this.state.currentTurn || this.state.diceRolled)
            return null;
        const roll = Math.floor(Math.random() * 6) + 1;
        this.state.lastDiceRoll = roll;
        this.state.diceRolled = true;
        // Auto pass turn if no possible moves
        if (!this.hasValidMoves(player, roll)) {
            this.nextTurn();
        }
        return roll;
    }
    moveToken(playerId, tokenId) {
        if (this.state.status !== 'PLAYING' || !this.state.diceRolled || !this.state.lastDiceRoll)
            return false;
        const player = this.getPlayerById(playerId);
        if (!player || player.color !== this.state.currentTurn)
            return false;
        const token = player.tokens.find((t) => t.id === tokenId);
        if (!token || token.isFinished)
            return false;
        const steps = this.state.lastDiceRoll;
        let newPos = token.position;
        // Moving out of base
        if (token.position === -1) {
            if (steps === 6) {
                newPos = START_POSITIONS[player.color];
            }
            else {
                return false; // Can't move out without a 6
            }
        }
        else {
            // Regular movement
            // Simplified movement logic - wrapping around
            newPos = token.position + steps;
            // Note: A robust system would transition newPos > 50 into the home stretch (52-56)
            // Here we implement a simplified path for demonstration
            if (newPos > 51) {
                newPos = newPos % 52;
            }
        }
        token.position = newPos;
        // Check for captures
        if (!SAFE_ZONES.includes(newPos)) {
            this.state.players.forEach(p => {
                if (p.color !== player.color) {
                    p.tokens.forEach(t => {
                        if (t.position === newPos) {
                            t.position = -1; // Send back to base
                            // Player gets another turn for capturing (requires logic extension)
                        }
                    });
                }
            });
        }
        // Checking win condition
        if (player.tokens.every(t => t.isFinished)) {
            this.state.winner = player.color;
            this.state.status = 'FINISHED';
        }
        else {
            if (steps !== 6) {
                this.nextTurn();
            }
            else {
                // Rolled a 6, keep turn
                this.state.diceRolled = false;
            }
        }
        return true;
    }
    hasValidMoves(player, roll) {
        return player.tokens.some(t => {
            if (t.isFinished)
                return false;
            if (t.position === -1 && roll !== 6)
                return false;
            return true; // Simplified: assume any other token can move
        });
    }
    nextTurn() {
        const currentIndex = this.state.players.findIndex((p) => p.color === this.state.currentTurn);
        const nextIndex = (currentIndex + 1) % this.state.players.length;
        this.state.currentTurn = this.state.players[nextIndex].color;
        this.state.diceRolled = false;
        this.state.lastDiceRoll = null;
    }
    getPlayerById(id) {
        return this.state.players.find((p) => p.id === id);
    }
}
exports.LudoEngine = LudoEngine;
//# sourceMappingURL=LudoEngine.js.map