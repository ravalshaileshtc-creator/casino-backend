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
const socket_service_1 = require("./websocket/socket.service");
const engine_1 = require("./games/luckyball/engine");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Middlewares
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
// API Routes
app.use('/api/v1/admin', admin_routes_1.adminRouter);
app.use('/api/v1/games', games_routes_1.gamesRouter);
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
