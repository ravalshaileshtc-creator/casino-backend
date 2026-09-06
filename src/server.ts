import http from 'http';
import express from 'express';
import cors from 'cors';
import { adminRouter } from './admin/admin.routes';
import { gamesRouter } from './games/games.routes';
import { SocketService } from './websocket/socket.service';
import { LuckyBallEngine } from './games/luckyball/engine';

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Routes
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/games', gamesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'GameHub APEX Casino Backend',
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);

// Initialize WebSocket stream and game state timers
LuckyBallEngine.initialize();
SocketService.initialize(server);

server.listen(PORT, () => {
  console.log(`🚀 GameHub Casino Real-time Backend running on http://localhost:${PORT}`);
  console.log(`👑 Super Admin API ready at http://localhost:${PORT}/api/v1/admin`);
  console.log(`🔌 WebSocket Stream ready at ws://localhost:${PORT}/ws`);
});
