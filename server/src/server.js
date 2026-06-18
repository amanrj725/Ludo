"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const RoomManager_1 = require("./managers/RoomManager");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Basic CORS configuration
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Basic route to check health and create rooms
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', message: 'Ludo server is running' });
});
// Socket.io Game Integration
io.on('connection', (socket) => {
    console.log(`[Socket] New connection established: ${socket.id}`);
    socket.on('create-room', (callback) => {
        const roomId = RoomManager_1.roomManager.createRoom();
        callback({ roomId });
    });
    socket.on('join-room', ({ roomId, playerName }, callback) => {
        const game = RoomManager_1.roomManager.getRoom(roomId);
        if (!game) {
            return callback({ error: 'Room not found' });
        }
        const player = game.addPlayer(socket.id, playerName);
        if (!player) {
            return callback({ error: 'Room is full or game already started' });
        }
        socket.join(roomId);
        io.to(roomId).emit('game-state-update', game.state);
        callback({ success: true, state: game.state });
    });
    socket.on('start-game', ({ roomId }) => {
        const game = RoomManager_1.roomManager.getRoom(roomId);
        if (game) {
            game.startGame();
            io.to(roomId).emit('game-state-update', game.state);
        }
    });
    socket.on('roll-dice', ({ roomId }) => {
        const game = RoomManager_1.roomManager.getRoom(roomId);
        if (game) {
            const roll = game.rollDice(socket.id);
            if (roll) {
                io.to(roomId).emit('dice-rolled', { roll, state: game.state });
            }
        }
    });
    socket.on('move-token', ({ roomId, tokenId }) => {
        const game = RoomManager_1.roomManager.getRoom(roomId);
        if (game) {
            const success = game.moveToken(socket.id, tokenId);
            if (success) {
                io.to(roomId).emit('game-state-update', game.state);
            }
        }
    });
    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
        // Handle player disconnects logically (remove from room or set as inactive)
    });
});
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`[Server] Ludo backend is initialized and listening on port ${PORT}`);
});
//# sourceMappingURL=server.js.map