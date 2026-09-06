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

// Root status landing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>GameHub Casino Cloud API</title>
        <style>
          body { background: #07090E; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #0F1523; border: 1px solid #FFD700; padding: 30px; border-radius: 16px; text-align: center; box-shadow: 0 0 30px rgba(255, 215, 0, 0.2); }
          h1 { color: #FFD700; margin: 0 0 10px 0; font-size: 24px; }
          .status { display: inline-block; background: rgba(0, 245, 118, 0.2); color: #00F576; padding: 6px 14px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          p { color: #7A8B9E; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>👑 GAMEHUB CASINO CLOUD ENGINE</h1>
          <div class="status">● SERVER IS LIVE & HEALTHY</div>
          <p>REST API: <code>/api/v1/admin</code> | WebSocket: <code>/ws</code></p>
        </div>
      </body>
    </html>
  `);
});

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
