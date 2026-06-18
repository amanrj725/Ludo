import { LudoEngine } from '../game/LudoEngine';
import { GameState } from '../game/types';

export class RoomManager {
  private rooms: Map<string, LudoEngine>;

  constructor() {
    this.rooms = new Map();
  }

  createRoom(): string {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.rooms.set(code, new LudoEngine(code));
    return code;
  }

  getRoom(roomId: string): LudoEngine | undefined {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId: string) {
    this.rooms.delete(roomId);
  }

  cleanEmptyRooms() {
    this.rooms.forEach((game, roomId) => {
      if (game.state.players.length === 0) {
        this.rooms.delete(roomId);
      }
    });
  }
}

// Export singleton instance
export const roomManager = new RoomManager();
