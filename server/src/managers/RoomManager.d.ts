import { LudoEngine } from '../game/LudoEngine';
export declare class RoomManager {
    private rooms;
    constructor();
    createRoom(): string;
    getRoom(roomId: string): LudoEngine | undefined;
    deleteRoom(roomId: string): void;
    cleanEmptyRooms(): void;
}
export declare const roomManager: RoomManager;
//# sourceMappingURL=RoomManager.d.ts.map