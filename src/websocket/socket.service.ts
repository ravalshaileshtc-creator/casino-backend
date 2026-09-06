import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { CrashEngine } from '../games/crash/engine';
import { LuckyBallEngine } from '../games/luckyball/engine';
import { db } from '../database/db';

export class SocketService {
  private static wss: WebSocketServer;
  private static clients: Set<WebSocket> = new Set();

  static initialize(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);

      // Send initial handshake state
      ws.send(JSON.stringify({
        type: 'INIT',
        payload: {
          online: this.clients.size,
          luckyBall: LuckyBallEngine.getRoundState()
        }
      }));

      ws.on('message', (msg: string) => {
        try {
          const parsed = JSON.parse(msg);
          // Handle client incoming actions if any
        } catch (e) {}
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });

    // Start Crash Game WebSocket Loop (runs every 15-20 seconds per round)
    this.startCrashLoop();

    // Start Lucky Ball periodic broadcast
    setInterval(() => {
      this.broadcast('LUCKY_BALL_TICK', LuckyBallEngine.getRoundState());
    }, 1000);

    // Random live bets ticker broadcast for casino atmosphere
    setInterval(() => {
      if (this.clients.size > 0 && Math.random() > 0.4) {
        const randomBet = db.bets[Math.floor(Math.random() * Math.min(db.bets.length, 10))];
        if (randomBet) {
          this.broadcast('LIVE_BET', randomBet);
        }
      }
    }, 2500);
  }

  static broadcast(type: string, payload: any) {
    const data = JSON.stringify({ type, payload });
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  private static startCrashLoop() {
    let state: 'waiting' | 'flying' | 'crashed' = 'waiting';
    let currentMultiplier = 1.00;
    let crashPoint = 2.00;
    let flightInterval: NodeJS.Timeout | null = null;

    const runRound = () => {
      // 1. Waiting for bets (5 seconds)
      state = 'waiting';
      const roundGen = CrashEngine.generateCrashPoint();
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
            if (flightInterval) clearInterval(flightInterval);
            state = 'crashed';
            this.broadcast('CRASH_STATE', { state: 'crashed', multiplier: crashPoint });

            // Next round in 4 seconds
            setTimeout(runRound, 4000);
          } else {
            this.broadcast('CRASH_STATE', { state: 'flying', multiplier: currentMultiplier });
          }
        }, 100);
      }, 5000);
    };

    runRound();
  }
}
