"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomManager = exports.RoomManager = void 0;
const LudoEngine_1 = require("../game/LudoEngine");
const types_1 = require("../game/types");
class RoomManager {
    rooms;
    constructor() {
        this.rooms = new Map();
    }
    createRoom() {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.rooms.set(code, new LudoEngine_1.LudoEngine(code));
        return code;
    }
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    deleteRoom(roomId) {
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
exports.RoomManager = RoomManager;
// Export singleton instance
exports.roomManager = new RoomManager();
//# sourceMappingURL=RoomManager.js.map