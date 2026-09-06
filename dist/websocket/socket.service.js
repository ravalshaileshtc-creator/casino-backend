"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const ws_1 = require("ws");
const engine_1 = require("../games/crash/engine");
const engine_2 = require("../games/luckyball/engine");
const db_1 = require("../database/db");
class SocketService {
    static wss;
    static clients = new Set();
    static initialize(server) {
        this.wss = new ws_1.WebSocketServer({ server, path: '/ws' });
        this.wss.on('connection', (ws) => {
            this.clients.add(ws);
            // Send initial handshake state
            ws.send(JSON.stringify({
                type: 'INIT',
                payload: {
                    online: this.clients.size,
                    luckyBall: engine_2.LuckyBallEngine.getRoundState()
                }
            }));
            ws.on('message', (msg) => {
                try {
                    const parsed = JSON.parse(msg);
                    // Handle client incoming actions if any
                }
                catch (e) { }
            });
            ws.on('close', () => {
                this.clients.delete(ws);
            });
        });
        // Start Crash Game WebSocket Loop (runs every 15-20 seconds per round)
        this.startCrashLoop();
        // Start Lucky Ball periodic broadcast
        setInterval(() => {
            this.broadcast('LUCKY_BALL_TICK', engine_2.LuckyBallEngine.getRoundState());
        }, 1000);
        // Random live bets ticker broadcast for casino atmosphere
        setInterval(() => {
            if (this.clients.size > 0 && Math.random() > 0.4) {
                const randomBet = db_1.db.bets[Math.floor(Math.random() * Math.min(db_1.db.bets.length, 10))];
                if (randomBet) {
                    this.broadcast('LIVE_BET', randomBet);
                }
            }
        }, 2500);
    }
    static broadcast(type, payload) {
        const data = JSON.stringify({ type, payload });
        for (const client of this.clients) {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(data);
            }
        }
    }
    static startCrashLoop() {
        let state = 'waiting';
        let currentMultiplier = 1.00;
        let crashPoint = 2.00;
        let flightInterval = null;
        const runRound = () => {
            // 1. Waiting for bets (5 seconds)
            state = 'waiting';
            const roundGen = engine_1.CrashEngine.generateCrashPoint();
            crashPoint = roundGen.crashPoint;
            this.broadcast('CRASH_STATE', { state: 'waiting', countdown: 5 });
            setTimeout(() => {
                // 2. Rocket Flight
                state = 'flying';
                currentMultiplier = 1.00;
                const startTime = Date.now();
                flightInterval = setInterval(() => {
                    const elapsed = (Date.now() - startTime) / 1000;
                    // Exponential multiplier growth curve: e^(0.06 * t)
                    currentMultiplier = +(Math.pow(Math.E, 0.065 * elapsed)).toFixed(2);
                    if (currentMultiplier >= crashPoint) {
                        // Crash!
                        if (flightInterval)
                            clearInterval(flightInterval);
                        state = 'crashed';
                        this.broadcast('CRASH_STATE', { state: 'crashed', multiplier: crashPoint });
                        // Next round in 4 seconds
                        setTimeout(runRound, 4000);
                    }
                    else {
                        this.broadcast('CRASH_STATE', { state: 'flying', multiplier: currentMultiplier });
                    }
                }, 100);
            }, 5000);
        };
        runRound();
    }
}
exports.SocketService = SocketService;
