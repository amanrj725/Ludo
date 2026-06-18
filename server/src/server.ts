import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { roomManager } from './managers/RoomManager';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Helper function to trigger bot plays automatically
const handleBotTurn = (roomId: string) => {
  try {
    const game = roomManager.getRoom(roomId);
    if (!game || game.state.status !== 'PLAYING') return;

    const currentPlayer = game.state.players.find(p => p.color === game.state.currentTurn);
    
    if (currentPlayer && currentPlayer.isBot) {
      setTimeout(() => {
        try {
          if (!game.state.diceRolled && game.state.currentTurn === currentPlayer.color) {
            const roll = game.rollDice(currentPlayer.id);
            
            if (!roll) {
               console.error(`[CRITICAL] Bot ${currentPlayer.color} rollDice returned null!`);
               game.nextTurn();
               io.to(roomId).emit('game-state-update', game.state);
               handleBotTurn(roomId);
               return;
            }

            io.to(roomId).emit('dice-rolled', { roll, state: game.state });
            
            setTimeout(() => {
                try {
                  if (!game.hasValidMoves(currentPlayer, roll)) {
                    setTimeout(() => {
                      game.nextTurn();
                      io.to(roomId).emit('game-state-update', game.state);
                      handleBotTurn(roomId);
                    }, 800);
                  } else {
                    const bestTokenId = game.getBestBotMove(currentPlayer, roll);

                    if (bestTokenId) {
                      const success = game.moveToken(currentPlayer.id, bestTokenId);
                      
                      if (!success) {
                         console.error(`[CRITICAL] Bot moveToken failed.`);
                         game.nextTurn();
                      }

                      io.to(roomId).emit('game-state-update', game.state);
                      
                      setTimeout(() => {
                        handleBotTurn(roomId);
                      }, 800); 
                    } else {
                      game.nextTurn();
                      io.to(roomId).emit('game-state-update', game.state);
                      handleBotTurn(roomId);
                    }
                  }
                } catch (e) {
                   console.error("Error during bot move execution", e);
                }
            }, 800);
          }
        } catch (e) {
           console.error("Error during bot roll", e);
        }
      }, 800);
    }
  } catch(e) {
    console.error("Error initiating bot turn", e);
  }
};

// Basic CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Basic route to check health and create rooms
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Ludo server is running' });
});

// Socket.io Game Integration
io.on('connection', (socket) => {
  console.log(`[Socket] New connection established: ${socket.id}`);

  socket.on('create-room', (callback) => {
    const roomId = roomManager.createRoom();
    callback({ roomId });
  });

  socket.on('join-room', ({ roomId, playerName }, callback) => {
    const game = roomManager.getRoom(roomId);
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
    const game = roomManager.getRoom(roomId);
    if (game) {
      game.startGame();
      io.to(roomId).emit('game-state-update', game.state);
      // Wait a moment before starting bot turn so players see game started
      setTimeout(() => {
        handleBotTurn(roomId);
      }, 1000);
    }
  });

  socket.on('roll-dice', ({ roomId }) => {
    const game = roomManager.getRoom(roomId);
    if (game) {
      const roll = game.rollDice(socket.id);
      if (roll) {
        io.to(roomId).emit('dice-rolled', { roll, state: game.state });
        
        const player = game.getPlayerById(socket.id);
        if (player && !game.hasValidMoves(player, roll)) {
           setTimeout(() => {
              game.nextTurn();
              io.to(roomId).emit('game-state-update', game.state);
              handleBotTurn(roomId);
           }, 800); // 0.8 sec delay to see the dice roll before skipping
        } else {
           // User has valid moves, wait for them to move a token
        }
      }
    }
  });

  socket.on('move-token', ({ roomId, tokenId }) => {
    const game = roomManager.getRoom(roomId);
    if (game) {
      const success = game.moveToken(socket.id, tokenId);
      if (success) {
        io.to(roomId).emit('game-state-update', game.state);
        handleBotTurn(roomId); // Check if the next turn belongs to a bot
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
    
    // Find any waiting rooms this player was in and remove them
    const socketRooms = Array.from(socket.rooms);
    // Since socket.rooms might be empty on disconnect, we can safely just scan all rooms 
    // to see if the player exists in a 'WAITING' room and purge them.
    // However, roomManager.rooms is private, let's just expose a cleanup method.
    // To make it easy without changing RoomManager significantly:
    roomManager['rooms'].forEach((game, roomId) => {
      if (game.state.status === 'WAITING' && game.getPlayerById(socket.id)) {
         game.removePlayer(socket.id);
         io.to(roomId).emit('game-state-update', game.state);
      }
    });
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`[Server] Ludo backend is initialized and listening on port ${PORT}`);
});
