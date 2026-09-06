"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const admin_routes_1 = require("./admin/admin.routes");
const games_routes_1 = require("./games/games.routes");
const auth_routes_1 = require("./auth/auth.routes");
const socket_service_1 = require("./websocket/socket.service");
const engine_1 = require("./games/luckyball/engine");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Middlewares
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
// API Routes
app.use('/api/v1/auth', auth_routes_1.authRouter);
app.use('/api/v1/admin', admin_routes_1.adminRouter);
app.use('/api/v1/games', games_routes_1.gamesRouter);
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
const server = http_1.default.createServer(app);
// Initialize WebSocket stream and game state timers
engine_1.LuckyBallEngine.initialize();
socket_service_1.SocketService.initialize(server);
server.listen(PORT, () => {
    console.log(`🚀 GameHub Casino Real-time Backend running on http://localhost:${PORT}`);
    console.log(`👑 Super Admin API ready at http://localhost:${PORT}/api/v1/admin`);
    console.log(`🔌 WebSocket Stream ready at ws://localhost:${PORT}/ws`);
});
