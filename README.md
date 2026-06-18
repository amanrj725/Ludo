# Web-Based Multiplayer Ludo Game 🎲

A real-time, highly interactive multiplayer Ludo game built from scratch using industry-standard web technologies. Play with your friends in private rooms or challenge the built-in smart AI bots!

## 🚀 Key Features

- **Real-Time Synchronized Multiplayer:** Play seamlessly with friends over the web using private 6-digit room codes (powered by Socket.io). It maintains an exact 1:1 state across all connected networks safely.
- **Single Player vs Smart AI Bots:** Don`'`t have 4 players? The node engine intelligently fills empty room seats with AI bots (`BOT Alpha`, `BOT Beta`, `BOT Gamma`) that use actual mathematical Ludo strategy to hunt down players and advance.
- **Standard Ludo Rules Engine:** Fully enforces all Ludo mechanics including constraints on rolling a 6 to exit the base, collision-based captures, safe zones, and entering the home stretch color channels.
- **Fluid & Responsive UI:** Built dynamically with Next.js, Tailwind CSS, & Framer Motion to deliver smooth token jump animations and pulse-effects for eligible moves.

## 🛠️ Tech Stack

- **Frontend:** Next.js (React 18), TypeScript, Tailwind CSS, Framer Motion, Socket.io-client
- **Backend:** Node.js, Express, Socket.io, TypeScript

## 📋 Installation & Setup

To run this project locally, you will need Node.js installed. In VS Code, you`'`ll open two separate terminal windows to run the backend and frontend simultaneously.

### 1. Start the Backend (Server)
Navigate to the `server` directory, install all dependencies, and start the development server using:
```bash
cd server
npm install
npm run dev
```
*The backend server will successfully start on `http://localhost:3002`.*

### 2. Start the Frontend (Client)
Navigate to the `client` directory, install all GUI dependencies, and start the development server using:
```bash
cd client
npm install
npm run dev
```
*The Next.js client will start on `http://localhost:3000`.*

---

## 🎮 How to Play

1. Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.
2. Enter your Name into the textbox.
3. Click **Create Private Room** (The game will instantly assign you as the native `RED` player).
4. To invite friends, share the uniquely generated Room ID located on the right panel. They can jump into action by typing that code and selecting **Join** on the main menu.
5. Hit **Start Game** whenever you are ready. Any empty remaining slots will be automatically taken over by the `BOT` AI!
6. Click **Roll Dice**. If you get a 6, your pieces will pulse yellow - click them to safely move them out. Race around the track to the center!

